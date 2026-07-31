import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabase-admin.js";
import { sendBookingEmail } from "@/lib/email"; // Added: Import your Resend helper

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
  const { resource, title, attendeeCount, notes, startTime, endTime, userEmail } = body;

  if (!resource || !title || !startTime || !endTime) {
    return NextResponse.json(
      { message: "resource, title, startTime and endTime are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from("bookings")
    .insert({
      resource_id: resource,
      title,
      attendee_count: attendeeCount || 1,
      notes: notes || "",
      start_time: startTime,
      end_time: endTime,
    })
    .select("*, resource:resources(*)")
    .single();

  if (error) {
    if (error.code === "23P01") {
      return NextResponse.json(
        { message: "This slot conflicts with an existing booking (including its buffer time)." },
        { status: 409 }
      );
    }
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  // Added: Trigger confirmation email via Resend if userEmail is provided
  if (userEmail) {
    await sendBookingEmail({
      to: userEmail,
      subject: "Booking Confirmed - SpaceSync",
      title: `Your booking "${title}" has been successfully confirmed.`,
      date: `${new Date(startTime).toLocaleString()} - ${new Date(endTime).toLocaleString()}`,
      resourceName: data?.resource?.name || `Resource ID: ${resource}`,
    });
  }
  

  return NextResponse.json(data, { status: 201 });
}