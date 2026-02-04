import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    const user = getUser(username);

    if (user && user.password === password) {
      // Simple auth: return success
      // In a real app we would use JWT or sessions
      return NextResponse.json({ success: true, username: user.username });
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
