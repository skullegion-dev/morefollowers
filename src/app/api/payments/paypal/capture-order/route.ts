import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || "live";
  const base =
    mode === "sandbox"
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return { token: data.access_token as string, base };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, userId } = body;

    if (!orderId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing orderId or userId" },
        { status: 400 }
      );
    }

    const pendingRef = adminDb.collection("pending_payments").doc(orderId);
    const pendingSnap = await pendingRef.get();

    if (!pendingSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const pending = pendingSnap.data()!;
    if (pending.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (pending.status === "completed") {
      return NextResponse.json({
        success: true,
        status: "completed",
        amountUSD: pending.amountUSD,
      });
    }

    const { token, base } = await getPayPalAccessToken();

    const captureRes = await fetch(
      `${base}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const capture = await captureRes.json();

    const status = capture.status;
    if (status !== "COMPLETED") {
      return NextResponse.json({
        success: false,
        status: "failed",
        error: "Payment not completed",
        details: capture,
      });
    }

    const amountUSD = Number(pending.amountUSD) || 0;
    const userRef = adminDb.collection("users").doc(userId);

    await adminDb.runTransaction(async (tx) => {
      const fresh = await tx.get(pendingRef);
      if (fresh.exists && fresh.data()?.status === "completed") return;

      const userSnap = await tx.get(userRef);
      const current = userSnap.exists
        ? Number(userSnap.data()?.balance || 0)
        : 0;

      tx.set(
        userRef,
        {
          balance: Number((current + amountUSD).toFixed(2)),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      tx.update(pendingRef, {
        status: "completed",
        creditedUSD: amountUSD,
        captureId: capture.id || null,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({
      success: true,
      status: "completed",
      amountUSD,
    });
  } catch (error: any) {
    console.error("PayPal capture error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Capture failed" },
      { status: 500 }
    );
  }
}