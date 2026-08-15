import Link from "next/link";
import { Music2, Hash, Users, Play, Share2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              MoreFollowers
            </Link>
            <p className="text-sm text-muted-foreground">
              Get more followers, likes and views on Instagram, TikTok, YouTube,
              Facebook & X.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/services" className="hover:text-primary">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-primary">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-3">
              <Link
                href="#"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-white transition"
                title="Instagram"
              >
                <Users className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-white transition"
                title="TikTok"
              >
                <Music2 className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-white transition"
                title="YouTube"
              >
                <Play className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-white transition"
                title="X (Twitter)"
              >
                <Hash className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-white transition"
                title="Facebook"
              >
                <Share2 className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} MoreFollowers. All rights reserved.
        </div>
      </div>
    </footer>
  );
}