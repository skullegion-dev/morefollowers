"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import { formatUSD } from "@/lib/currency";

type ServiceItem = {
  id: number;
  name: string;
  type: string;
  category: string;
  min: number;
  max: number;
  refill: boolean;
  cancel: boolean;
  rate: number;
  desc: string;
};

export default function ServicesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        if (!data.success) {
          setError(data.error || "Could not load services");
          return;
        }
        setServices(data.services || []);
        setCategories(data.categories || []);
      } catch {
        setError("Could not load services");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      const catOk = category === "All" || s.category === category;
      const text = `${s.name} ${s.category} ${s.type}`.toLowerCase();
      const searchOk = !q || text.includes(q);
      return catOk && searchOk;
    });
  }, [services, search, category]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <h1 className="text-3xl font-bold mb-2">Services</h1>
      <p className="text-muted-foreground mb-6">
        Choose a service. Ordering from wallet comes next.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Instagram, TikTok, YouTube..."
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm sm:w-72"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg text-sm bg-red-50 text-red-700 dark:bg-red-900/20">
          {error}
        </div>
      )}

      {fetching ? (
        <p className="text-muted-foreground">Loading services from Peakerr…</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filtered.length} of {services.length} services
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.slice(0, 200).map((s) => (
              <Card key={s.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base leading-snug">
                    {s.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{s.category}</p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    Price: <strong>{formatUSD(s.rate)}</strong> / 1,000
                  </p>
                  <p className="text-muted-foreground">
                    Min {s.min.toLocaleString()} · Max {s.max.toLocaleString()}
                    {s.refill ? " · Refill" : ""}
                  </p>
                  <Button className="w-full mt-2" disabled>
                    Order coming next
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {filtered.length > 200 && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing first 200 matches. Use search to narrow results.
            </p>
          )}
        </>
      )}
    </div>
  );
}