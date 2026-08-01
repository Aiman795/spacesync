import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { RRule } from "rrule";
import { supabaseServer } from "../../../lib/supabase-admin.js";
import { sendBookingEmail } from "@/lib/email"; // Added: Import your Resend helper

function overlapsWithBuffer(requestStart, requestEnd, existingStart, existingEnd, bufferMinutes) {
  const bufferMs = (bufferMinutes || 0) * 60 * 1000;
  const requestedStartTime = typeof requestStart === "number" ? requestStart : new Date(requestStart).getTime();
  const requestedEndTime = typeof requestEnd === "number" ? requestEnd : new Date(requestEnd).getTime();
  const existingStartTime = typeof existingStart === "number" ? existingStart : new Date(existingStart).getTime();
  const existingEndTime = typeof existingEnd === "number" ? existingEnd : new Date(existingEnd).getTime();

  return (
    requestedStartTime < existingEndTime + bufferMs &&
    requestedEndTime > existingStartTime - bufferMs
  );
}

function getSuggestedSlots(requestedStart, requestedEnd, existingBookings, bufferMinutes) {
  const bufferMs = (bufferMinutes || 0) * 60 * 1000;
  const requestedStartTime = typeof requestedStart === "number" ? requestedStart : new Date(requestedStart).getTime();
  const requestedEndTime = typeof requestedEnd === "number" ? requestedEnd : new Date(requestedEnd).getTime();
  const durationMs = requestedEndTime - requestedStartTime;
  const suggestions = [];
  let candidateStart = requestedStartTime;

  while (suggestions.length < 3) {
    let currentStart = candidateStart;
    let hasConflict = true;

    while (hasConflict) {
      hasConflict = false;

      for (const booking of existingBookings || []) {
        const existingStartTime = new Date(booking.start_time).getTime();
        const existingEndTime = new Date(booking.end_time).getTime();

        if (overlapsWithBuffer(currentStart, currentStart + durationMs, existingStartTime, existingEndTime, bufferMinutes)) {
          currentStart = existingEndTime + bufferMs;
          hasConflict = true;
          break;
        }
      }
    }

    suggestions.push({
      start: new Date(currentStart).toISOString(),
      end: new Date(currentStart + durationMs).toISOString(),
    });

    candidateStart = currentStart + durationMs;
  }

  return suggestions;
}

async function getAuthenticatedUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component context — safe to ignore
          }
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

async function notifyConflictingOwners(conflictingBookings, newBookingTitle, startTime, endTime, resourceName) {
  const ownerIds = [...new Set(conflictingBookings.map((booking) => booking.user_id).filter(Boolean))];

  await Promise.allSettled(
    ownerIds.map(async (ownerId) => {
      const { data: ownerData, error: ownerError } = await supabaseServer.auth.admin.getUserById(ownerId);
      const ownerEmail = ownerData?.user?.email;

      if (ownerError || !ownerEmail) return;

      await sendBookingEmail({
        to: ownerEmail,
        subject: "Booking Override Notice - SpaceSync",
        title: `An admin has overridden a conflict for "${newBookingTitle}".`,
        date: `${new Date(startTime).toLocaleString()} - ${new Date(endTime).toLocaleString()}`,
        resourceName,
      });
    })
  );
}

// GET /api/bookings?resource=<id>
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource");

  let query = supabaseServer.from("bookings").select("*, resource:resources(*)").order("start_time");
  if (resource) query = query.eq("resource_id", resource);

  const { data, error } = await query;
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/bookings
// Body: { resource, title, attendeeCount, notes, startTime, endTime, userEmail }
export async function POST(request) {
  const body = await request.json();
  const { resource, title, attendeeCount, notes, startTime, endTime, userEmail, override, recurrenceRule } = body;

  if (!resource || !title || !startTime || !endTime) {
    return NextResponse.json(
      { message: "resource, title, startTime and endTime are required" },
      { status: 400 }
    );
  }

  const { user: currentUser, error: authError } = await getAuthenticatedUser();
  if (authError || !currentUser) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  let isAdmin = false;

  if (currentUser) {
    const { data: roleData } = await supabaseServer
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    isAdmin = roleData?.role === "super_admin" || roleData?.role === "space_admin";
  }

  const { data: resourceData, error: resourceError } = await supabaseServer
    .from("resources")
    .select("name, buffer_minutes, requires_approval")
    .eq("id", resource)
    .single();

  const bufferMinutes = resourceError ? 0 : resourceData?.buffer_minutes || 0;
  const requiresApproval = Boolean(resourceData?.requires_approval);

  const { data: existingBookings, error: bookingsError } = await supabaseServer
    .from("bookings")
    .select("*, resource:resources(*)")
    .eq("resource_id", resource)
    .eq("status", "confirmed");

  if (bookingsError) {
    return NextResponse.json({ message: bookingsError.message }, { status: 500 });
  }

  const requestedStartTime = new Date(startTime).getTime();
  const requestedEndTime = new Date(endTime).getTime();
  const conflictingBookings = existingBookings?.filter((booking) => {
    const existingStartTime = new Date(booking.start_time).getTime();
    const existingEndTime = new Date(booking.end_time).getTime();
    return overlapsWithBuffer(requestedStartTime, requestedEndTime, existingStartTime, existingEndTime, bufferMinutes);
  }) || [];

  const canOverride = Boolean(isAdmin && override);

  const recurrenceOccurrences = [];
  if (recurrenceRule) {
    try {
      const rule = RRule.fromString(recurrenceRule, { dtstart: new Date(startTime) });
      const maxDate = new Date(new Date(startTime).getTime() + 1000 * 60 * 60 * 24 * 365 * 3);
      const occurrenceDates = rule.between(new Date(startTime), maxDate);
      occurrenceDates.forEach((occurrence) => {
        const occurrenceStart = new Date(occurrence);
        const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();
        recurrenceOccurrences.push({
          start: occurrenceStart.toISOString(),
          end: new Date(occurrenceStart.getTime() + durationMs).toISOString(),
        });
      });
    } catch {
      return NextResponse.json({ message: "Invalid recurrence rule" }, { status: 400 });
    }
  } else {
    recurrenceOccurrences.push({
      start: new Date(startTime).toISOString(),
      end: new Date(endTime).toISOString(),
    });
  }

  const occurrenceConflicts = [];
  for (const occurrence of recurrenceOccurrences) {
    const occurrenceStartTime = new Date(occurrence.start).getTime();
    const occurrenceEndTime = new Date(occurrence.end).getTime();
    const occurrenceConflictingBookings = existingBookings?.filter((booking) => {
      const existingStartTime = new Date(booking.start_time).getTime();
      const existingEndTime = new Date(booking.end_time).getTime();
      return overlapsWithBuffer(occurrenceStartTime, occurrenceEndTime, existingStartTime, existingEndTime, bufferMinutes);
    }) || [];

    if (occurrenceConflictingBookings.length > 0 && !canOverride) {
      occurrenceConflicts.push({
        occurrence,
        conflictingBooking: occurrenceConflictingBookings[0],
      });
    }
  }

  if (occurrenceConflicts.length > 0) {
    const firstConflict = occurrenceConflicts[0];
    return NextResponse.json(
      {
        success: false,
        error: "Booking conflict",
        conflictingBooking: firstConflict.conflictingBooking,
        conflictingOccurrences: occurrenceConflicts.map((conflict) => conflict.occurrence),
        suggestedSlots: getSuggestedSlots(firstConflict.occurrence.start, firstConflict.occurrence.end, existingBookings, bufferMinutes),
      },
      { status: 409 }
    );
  }

  const bookingPayloads = recurrenceOccurrences.map((occurrence) => ({
    start: occurrence.start,
    end: occurrence.end,
  }));

  const { data, error } = await supabaseServer.rpc("create_recurring_bookings", {
    p_resource_id: resource,
    p_user_id: currentUser.id,
    p_title: title,
    p_attendee_count: attendeeCount || 1,
    p_notes: notes || "",
    p_occurrences: bookingPayloads,
    p_status: requiresApproval ? "pending" : "confirmed",
    p_is_override: canOverride,
  });

  if (error) {
    if (error.code === "23P01") {
      return NextResponse.json(
        { message: "This slot conflicts with an existing booking (including its buffer time)." },
        { status: 409 }
      );
    }
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const createdBookings = Array.isArray(data) ? data : [data];
  const createdBooking = createdBookings.length > 0 ? createdBookings[0] : null;
  const resourceName = resourceData?.name || createdBooking?.resource?.name || `Resource ID: ${resource}`;

  // Added: Trigger confirmation email via Resend if userEmail is provided
  if (userEmail) {
    await sendBookingEmail({
      to: userEmail,
      subject: requiresApproval ? "Booking Pending Approval - SpaceSync" : "Booking Confirmed - SpaceSync",
      title: requiresApproval
        ? `Your booking "${title}" is awaiting approval.`
        : `Your booking "${title}" has been successfully confirmed.`,
      date: `${new Date(startTime).toLocaleString()} - ${new Date(endTime).toLocaleString()}`,
      resourceName,
    });
  }

  if (canOverride && conflictingBookings.length > 0) {
    await notifyConflictingOwners(
      conflictingBookings,
      title,
      startTime,
      endTime,
      resourceName
    );
  }

  return NextResponse.json(createdBooking || createdBookings, { status: 201 });
}