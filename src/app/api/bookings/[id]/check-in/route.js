import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../../lib/supabase-admin.js";

// PATCH /api/bookings/[id]/check-in
export async function PATCH(request, { params }) {
  const { id } = params;

  const { data, error } = await supabaseServer
    .from("bookings")
    .update({ status: "checked-in" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 200 });
}