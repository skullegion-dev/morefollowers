"use client";

import AdsterraBanner from "./AdsterraBanner";
import AdsterraNative from "./AdsterraNative";

export function LeaderboardAd() {
  return (
    <AdsterraBanner
      adKey="e1854487361d2da88beb79134ab86ea5"
      width={468}
      height={60}
      className="my-4"
    />
  );
}

export function SkyscraperAd() {
  return (
    <AdsterraBanner
      adKey="89a765191eb4af79fd93cb49ed78e316"
      width={160}
      height={300}
      className="my-4"
    />
  );
}

export function NativeAd() {
  return <AdsterraNative />;
}