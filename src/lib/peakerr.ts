export type PeakerrService = {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string | number;
  max: string | number;
  refill?: boolean;
  cancel?: boolean;
  desc?: string;
};

export type CatalogService = PeakerrService & {
  sellRate: number;
  costRate: number;
};

const API_URL = process.env.PEAKERR_API_URL || "https://peakerr.com/api/v2";

export function getMarkupPercent(): number {
  const raw = Number(process.env.PEAKERR_MARKUP_PERCENT || 80);
  return Number.isFinite(raw) && raw >= 0 ? raw : 80;
}

export function applyMarkup(costRate: number): number {
  const markup = getMarkupPercent();
  return Number((costRate * (1 + markup / 100)).toFixed(4));
}

export function calcSellTotal(sellRatePer1000: number, quantity: number): number {
  return Number(((sellRatePer1000 * quantity) / 1000).toFixed(4));
}

export async function peakerrRequest(params: Record<string, string>) {
  const key = process.env.PEAKERR_API_KEY;
  if (!key) {
    throw new Error("PEAKERR_API_KEY is not set");
  }

  const body = new URLSearchParams({ key, ...params });

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const data = await res.json();
  return data;
}

export async function fetchPeakerrServices(): Promise<CatalogService[]> {
  const data = await peakerrRequest({ action: "services" });

  if (!Array.isArray(data)) {
    throw new Error(data?.error || "Could not load service list");
  }

  return data.map((s: PeakerrService) => {
    const costRate = Number(s.rate) || 0;
    return {
      ...s,
      service: Number(s.service),
      costRate,
      sellRate: applyMarkup(costRate),
    };
  });
}

export async function addPeakerrOrder(params: {
  serviceId: number;
  link: string;
  quantity: number;
}) {
  const data = await peakerrRequest({
    action: "add",
    service: String(params.serviceId),
    link: params.link,
    quantity: String(params.quantity),
  });

  if (data?.error || !data?.order) {
    throw new Error(data?.error || "Provider rejected the order");
  }

  return {
    providerOrderId: String(data.order),
  };
}

export async function fetchPeakerrOrderStatus(providerOrderId: string) {
  const data = await peakerrRequest({
    action: "status",
    order: providerOrderId,
  });

  if (data?.error) {
    throw new Error(data.error);
  }

  return {
    status: String(data.status || "Unknown"),
    charge: data.charge != null ? Number(data.charge) : null,
    startCount: data.start_count != null ? Number(data.start_count) : null,
    remains: data.remains != null ? Number(data.remains) : null,
    currency: data.currency ? String(data.currency) : "USD",
  };
}