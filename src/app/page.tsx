"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowRight,
  Music2,
  Play,
  Users,
  Hash,
  Zap,
  Shield,
  CreditCard,
  Globe,
  Headphones,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

function AdsterraBanner({
  adKey,
  width,
  height,
}: {
  adKey: string;
  width: number;
  height: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";
    const conf = document.createElement("script");
    conf.type = "text/javascript";
    conf.text = `atOptions = {
      'key': '${adKey}',
      'format': 'iframe',
      'height': ${height},
      'width': ${width},
      'params': {}
    };`;
    const inv = document.createElement("script");
    inv.type = "text/javascript";
    inv.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;
    el.appendChild(conf);
    el.appendChild(inv);
    return () => {
      el.innerHTML = "";
    };
  }, [adKey, width, height]);

  return (
    <div
      ref={ref}
      className="mx-auto flex justify-center overflow-hidden"
      style={{ maxWidth: width, minHeight: height }}
    />
  );
}

function AdsterraNative() {
  return (
    <div className="w-full overflow-hidden">
      <Script
        id="adsterra-native-home"
        src="https://pl31106143.profitableratecpmnetwork.com/f07c1e4d8ad63a084bee8db0083b70ce/invoke.js"
        strategy="lazyOnload"
      />
      <div id="container-f07c1e4d8ad63a084bee8db0083b70ce" />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-6">
              Trusted by thousands of creators
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6"
          >
            Get{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              More Followers
            </span>
            <br />
            Instantly
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Real followers, likes, views & plays for Instagram, TikTok,
            YouTube, Spotify, Facebook and more.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <Link href="/login">
              <Button size="lg" className="rounded-full px-8 h-12 text-base">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/services">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-12 text-base"
              >
                View Services
              </Button>
            </Link>
          </motion.div>

          <div className="mb-12 flex justify-center">
            <AdsterraBanner
              adKey="e1854487361d2da88beb79134ab86ea5"
              width={468}
              height={60}
            />
          </div>

          {/* Payment methods */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <div className="flex items-center gap-2 bg-background border rounded-full px-4 py-2 text-sm shadow-sm">
              <Image
                src="/payments/mpesa.png"
                alt="M-Pesa"
                width={24}
                height={24}
                className="object-contain"
              />
              M-Pesa
            </div>
            <div className="flex items-center gap-2 bg-background border rounded-full px-4 py-2 text-sm shadow-sm">
              Visa & Mastercard
            </div>
            <div className="flex items-center gap-2 bg-background border rounded-full px-4 py-2 text-sm shadow-sm">
              PayPal
            </div>
            <div className="flex items-center gap-2 bg-background border rounded-full px-4 py-2 text-sm shadow-sm">
              Crypto
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-8 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Instagram
            </div>
            <div className="flex items-center gap-2">
              <Music2 className="h-4 w-4" /> TikTok
            </div>
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4" /> YouTube
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4" /> Spotify
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4" /> X
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> Website Traffic
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">
              Why creators love MoreFollowers
            </h2>
            <p className="text-muted-foreground">
              Fast, safe and easy to use
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 items-start">
            <div className="hidden md:flex justify-center">
              <AdsterraBanner
                adKey="89a765191eb4af79fd93cb49ed78e316"
                width={160}
                height={300}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Zap className="h-7 w-7 text-blue-500" />,
                  title: "Lightning Fast",
                  desc: "Most orders start within minutes.",
                },
                {
                  icon: <Shield className="h-7 w-7 text-green-500" />,
                  title: "100% Safe",
                  desc: "We never ask for your password.",
                },
                {
                  icon: <CreditCard className="h-7 w-7 text-purple-500" />,
                  title: "Easy Payments",
                  desc: "M-Pesa, Cards, PayPal & Crypto.",
                },
              ].map((item) => (
                <Card key={item.title} className="border shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 flex justify-center">{item.icon}</div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="mt-8 flex justify-center md:hidden">
            <AdsterraBanner
              adKey="89a765191eb4af79fd93cb49ed78e316"
              width={160}
              height={300}
            />
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Popular Services</h2>
            <p className="text-muted-foreground">
              Grow on every major platform
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Instagram", icon: <Users className="h-5 w-5" /> },
              { name: "TikTok", icon: <Music2 className="h-5 w-5" /> },
              { name: "YouTube", icon: <Play className="h-5 w-5" /> },
              { name: "Spotify", icon: <Headphones className="h-5 w-5" /> },
              { name: "Website Traffic", icon: <Globe className="h-5 w-5" /> },
              { name: "X", icon: <Hash className="h-5 w-5" /> },
            ].map((item) => (
              <Card key={item.name} className="hover:shadow-md transition">
                <CardContent className="p-5 flex flex-col items-center gap-3 text-center">
                  <div className="p-2.5 rounded-full bg-primary/10 text-primary">
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">{item.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to grow your account?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Create a free account and start getting more followers today.
          </p>
          <Link href="/login">
            <Button size="lg" className="rounded-full px-10 h-12">
              Create Free Account
            </Button>
          </Link>
          <div className="mt-10">
            <AdsterraNative />
          </div>
        </div>
      </section>
    </div>
  );
}