import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("M-Pesa Callback received:", JSON.stringify(body, null, 2));

    // For now just acknowledge. We will credit wallet in next step.
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("Callback parse error:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Rejected" });
  }
}