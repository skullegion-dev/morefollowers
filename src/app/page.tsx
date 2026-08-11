import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Music2, Play, Users, Hash } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20" />
        
        <div className="container relative z-10 text-center">
          <Badge className="mb-6" variant="secondary">
            Trusted by thousands of creators worldwide
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Get{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              More Followers
            </span>
            <br />
            Instantly
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Buy real followers, likes, views and engagement for Instagram, TikTok, YouTube, X and more.  
            Pay with <strong>M-Pesa</strong>, Stripe, PayPal or Crypto.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services">
              <Button size="lg" className="text-lg h-14 px-8">
                Start Growing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                How it Works
              </Button>
            </Link>
          </div>

          {/* Platforms */}
          <div className="flex flex-wrap justify-center gap-8 mt-16 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Instagram
            </div>
            <div className="flex items-center gap-2">
              <Music2 className="h-5 w-5" /> TikTok
            </div>
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5" /> YouTube
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5" /> X (Twitter)
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/40">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose MoreFollowers?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Fast Delivery",
                description: "Most orders start within minutes and complete in hours.",
              },
              {
                title: "Safe & Secure",
                description: "We never ask for your password. 100% safe methods.",
              },
              {
                title: "Multiple Payments",
                description: "M-Pesa, Stripe, PayPal and Crypto accepted.",
              },
            ].map((feature) => (
              <Card key={feature.title}>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to get more followers?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of creators already growing their accounts with MoreFollowers.
          </p>
          <Link href="/register">
            <Button size="lg" className="h-14 px-10 text-lg">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}