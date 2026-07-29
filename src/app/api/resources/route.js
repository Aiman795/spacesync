import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabase-admin.js";

// GET /api/resources?type=Room&building=Block%20A&tag=projector
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const building = searchParams.get("building");
  const tag = searchParams.get("tag");

  let query = supabaseServer.from("resources").select("*").order("building").order("name");
  if (type) query = query.eq("type", type);
  if (building) query = query.eq("building", building);
  if (tag) query = query.contains("tags", [tag]);

  const { data, error } = await query;
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/resources
export async function POST(request) {
  const body = await request.json();
  const { data, error } = await supabaseServer.from("resources").insert(body).select().single();
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
