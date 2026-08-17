export const USD_TO_KES = 129.5; // Change this rate whenever you want

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatKES(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function usdToKes(usd: number): number {
  return Math.ceil(usd * USD_TO_KES); // Round up so you never lose money
}

export function kesToUsd(kes: number): number {
  return Number((kes / USD_TO_KES).toFixed(2));
}