import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import {
  addPeakerrOrder,
  calcSellTotal,
  fetchPeakerrServices,
} from "@/lib/peakerr";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = String(body.userId || "");
    const serviceId = Number(body.serviceId);
    const link = String(body.link || "").trim();
    const quantity = Number(body.quantity);

    if (!userId || !serviceId || !link || !quantity) {
      return NextResponse.json(
        { success: false, error: "Missing order details" },
        { status: 400 }
      );
    }

    const services = await fetchPeakerrServices();
    const service = services.find((s) => s.service === serviceId);

    if (!service) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
        { status: 404 }
      );
    }

    const min = Number(service.min);
    const max = Number(service.max);

    if (quantity < min || quantity > max) {
      return NextResponse.json(
        {
          success: false,
          error: `Quantity must be between ${min} and ${max}`,
        },
        { status: 400 }
      );
    }

    const chargeUSD = calcSellTotal(service.sellRate, quantity);
    if (chargeUSD <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order amount" },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection("users").doc(userId);
    const orderRef = adminDb.collection("orders").doc();

    let deducted = false;

    await adminDb.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      const current = userSnap.exists
        ? Number(userSnap.data()?.balance || 0)
        : 0;

      if (current < chargeUSD) {
        throw new Error("Insufficient wallet balance");
      }

      tx.set(
        userRef,
        {
          balance: Number((current - chargeUSD).toFixed(4)),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      tx.set(orderRef, {
        userId,
        serviceId,
        serviceName: service.name,
        category: service.category,
        link,
        quantity,
        chargeUSD,
        costRate: service.costRate,
        sellRate: service.sellRate,
        status: "submitting",
        createdAt: FieldValue.serverTimestamp(),
      });

      deducted = true;
    });

    try {
      const { providerOrderId } = await addPeakerrOrder({
        serviceId,
        link,
        quantity,
      });

      await orderRef.update({
        status: "pending",
        providerOrderId,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        orderId: orderRef.id,
        providerOrderId,
        chargeUSD,
      });
    } catch (providerError: any) {
      if (deducted) {
        await adminDb.runTransaction(async (tx) => {
          const userSnap = await tx.get(userRef);
          const current = userSnap.exists
            ? Number(userSnap.data()?.balance || 0)
            : 0;
          tx.set(
            userRef,
            {
              balance: Number((current + chargeUSD).toFixed(4)),
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        });
      }

      await orderRef.update({
        status: "failed",
        error: providerError.message || "Provider error",
        refunded: true,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json(
        {
          success: false,
          error: providerError.message || "Could not place order",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Could not place order" },
      { status: 500 }
    );
  }
}