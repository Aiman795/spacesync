import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseServer } from "../../../../../lib/supabase-admin.js";
import { sendBookingEmail } from "@/lib/email";

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

export async function PATCH(request, { params }) {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  const { data: roleData } = await supabaseServer
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const isAdmin = roleData?.role === "super_admin" || roleData?.role === "space_admin";
  if (!isAdmin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { data, error: updateError } = await supabaseServer
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", params.id)
    .eq("status", "pending")
    .select("*, resource:resources(*)")
    .single();

  if (updateError) {
    return NextResponse.json({ message: updateError.message }, { status: 400 });
  }

  if (data?.user_id) {
    const { data: requesterData, error: requesterError } = await supabaseServer.auth.admin.getUserById(data.user_id);
    const requesterEmail = requesterData?.user?.email;

    if (!requesterError && requesterEmail) {
      await sendBookingEmail({
        to: requesterEmail,
        subject: "Booking Approved - SpaceSync",
        title: `Your booking "${data.title}" has been approved.`,
        date: `${new Date(data.start_time).toLocaleString()} - ${new Date(data.end_time).toLocaleString()}`,
        resourceName: data?.resource?.name || `Resource ID: ${data.resource_id}`,
      });
    }
  }

  return NextResponse.json(data, { status: 200 });
}
