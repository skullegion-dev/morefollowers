import { NextResponse } from "next/server";
import { fetchPeakerrServices } from "@/lib/peakerr";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const services = await fetchPeakerrServices();

    const categories = Array.from(
      new Set(services.map((s) => s.category || "Other"))
    ).sort();

    return NextResponse.json({
      success: true,
      count: services.length,
      categories,
      services: services.map((s) => ({
        id: s.service,
        name: s.name,
        type: s.type,
        category: s.category,
        min: Number(s.min),
        max: Number(s.max),
        refill: Boolean(s.refill),
        cancel: Boolean(s.cancel),
        rate: s.sellRate,
        desc: s.desc || "",
      })),
    });
  } catch (error: any) {
    console.error("Peakerr services error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Could not load services",
      },
      { status: 500 }
    );
  }
}