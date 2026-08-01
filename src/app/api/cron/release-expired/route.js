import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabase-admin.js";

// GET /api/cron/release-expired
export async function GET() {
  const now = new Date().toISOString();

  // Find and update unconfirmed/un-checked-in bookings past their start time
  const { data, error } = await supabaseServer
    .from("bookings")
    .update({ status: "expired" })
    .eq("status", "confirmed")
    .lt("start_time", now)
    .select();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ 
    success: true, 
    releasedCount: data?.length || 0 
  }, { status: 200 });
}