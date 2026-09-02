import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();

  // Sign out the user (clears Supabase session cookies)
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
