import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { fetchPeakerrOrderStatus } from "@/lib/peakerr";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = String(body.userId || "");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    const snap = await adminDb
      .collection("orders")
      .where("userId", "==", userId)
      .get();

    const updates = [];

    for (const docSnap of snap.docs) {
      const order = docSnap.data();
      const providerOrderId = order.providerOrderId;
      if (!providerOrderId) continue;

      const current = String(order.status || "").toLowerCase();
      if (["completed", "canceled", "cancelled", "refunded", "failed"].includes(current)) {
        continue;
      }

      try {
        const status = await fetchPeakerrOrderStatus(String(providerOrderId));
        await docSnap.ref.update({
          status: status.status,
          providerStatus: status.status,
          providerCharge: status.charge,
          startCount: status.startCount,
          remains: status.remains,
          statusUpdatedAt: FieldValue.serverTimestamp(),
        });
        updates.push({
          id: docSnap.id,
          status: status.status,
        });
      } catch (err: any) {
        updates.push({
          id: docSnap.id,
          error: err.message || "Status check failed",
        });
      }
    }

    return NextResponse.json({
      success: true,
      updated: updates.length,
      updates,
    });
  } catch (error: any) {
    console.error("Order status refresh error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Could not refresh status" },
      { status: 500 }
    );
  }
}