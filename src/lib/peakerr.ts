const PEAKERR_API_URL = "https://peakerr.com/api/v2";

export async function peakerrRequest(action: string, params: Record<string, string> = {}) {
  const body = new URLSearchParams({
    key: process.env.PEAKERR_API_KEY || "",
    action,
    ...params,
  });

  const res = await fetch(PEAKERR_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`Peakerr API error: ${res.status}`);
  }

  return res.json();
}

export async function getServices() {
  return peakerrRequest("services");
}

export async function getBalance() {
  return peakerrRequest("balance");
}

export async function addOrder(service: string, link: string, quantity: number) {
  return peakerrRequest("add", {
    service,
    link,
    quantity: quantity.toString(),
  });
}

export async function getOrderStatus(orderId: string) {
  return peakerrRequest("status", { order: orderId });
}