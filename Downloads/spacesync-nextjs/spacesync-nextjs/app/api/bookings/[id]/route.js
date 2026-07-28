import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabase-server.js";

// DELETE /api/bookings/:id
export async function DELETE(_request, { params }) {
  const { error } = await supabaseServer.from("bookings").delete().eq("id", params.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ message: "Deleted" });
}
