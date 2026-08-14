"use client";

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
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative py-16 md:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-5 px-4 py-1.5 text-sm" variant="secondary">
              🚀 Trusted by thousands of creators
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-5"
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
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Real followers, likes & views for Instagram, TikTok, YouTube & X.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          >
            <Link href="/login">
              <Button
                size="lg"
                className="h-12 sm:h-14 px-8 text-base sm:text-lg rounded-full w-full sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/services">
              <Button
                size="lg"
                variant="outline"
                className="h-12 sm:h-14 px-8 text-base sm:text-lg rounded-full w-full sm:w-auto"
              >
                View Services
              </Button>
            </Link>
          </motion.div>

          {/* ===== PAYMENTS LOGOS (BIGGER) ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="max-w-5xl mx-auto"
          >
            <p className="text-sm text-muted-foreground mb-5 font-medium">
              We accept
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {/* M-Pesa - BIGGER LOGO */}
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border rounded-full px-5 py-2.5 shadow-sm">
                <Image
                  src="/payments/mpesa.png"
                  alt="M-Pesa"
                  width={70}
                  height={70}
                  className="object-contain"
                />
                <span className="text-base font-semibold">M-Pesa</span>
              </div>

              {/* Visa */}
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border rounded-full px-5 py-2.5 shadow-sm">
                <div className="w-12 h-7 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">VISA</span>
                </div>
                <span className="text-base font-semibold">Visa</span>
              </div>

              {/* Mastercard */}
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border rounded-full px-5 py-2.5 shadow-sm">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-red-500"></div>
                  <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
                </div>
                <span className="text-base font-semibold">Mastercard</span>
              </div>

              {/* PayPal */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border rounded-full px-5 py-2.5 shadow-sm">
                <span className="text-blue-600 font-bold text-base">Pay</span>
                <span className="text-blue-800 font-bold text-base">Pal</span>
              </div>

              {/* Bitcoin */}
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border rounded-full px-5 py-2.5 shadow-sm">
                <span className="text-orange-500 font-bold text-2xl">₿</span>
                <span className="text-base font-semibold">Bitcoin</span>
              </div>

              {/* USDT */}
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border rounded-full px-5 py-2.5 shadow-sm">
                <span className="text-green-600 font-bold text-base">USDT</span>
              </div>

              {/* BNB */}
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border rounded-full px-5 py-2.5 shadow-sm">
                <span className="text-yellow-500 font-bold text-base">BNB</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platforms */}
      <div className="container px-4 mb-14">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-muted-foreground text-sm">
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
            <Hash className="h-4 w-4" /> X
          </div>
        </div>
      </div>

      {/* ===== FEATURES ===== */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12">
            Why creators love MoreFollowers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="h-8 w-8 text-blue-500" />,
                title: "Lightning Fast",
                description:
                  "Most orders start within minutes and finish in a few hours.",
              },
              {
                icon: <Shield className="h-8 w-8 text-green-500" />,
                title: "100% Safe",
                description:
                  "We never ask for your password. Completely risk-free.",
              },
              {
                icon: <CreditCard className="h-8 w-8 text-purple-500" />,
                title: "Easy Payments",
                description:
                  "M-Pesa, Cards, PayPal and Crypto — all supported.",
              },
            ].map((feature) => (
              <Card key={feature.title} className="border-0 shadow-md">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-16 md:py-24">
        <div className="container px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5">
            Ready to grow your account?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Create a free account in seconds and start getting more followers
            today.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="h-12 sm:h-14 px-10 text-base sm:text-lg rounded-full"
            >
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}