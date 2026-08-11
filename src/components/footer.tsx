import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="font-bold text-lg">MoreFollowers</p>
            <p className="text-sm text-muted-foreground mt-1">
              Get more followers on Instagram, TikTok, YouTube & more
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/support" className="hover:underline">Support</Link>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} MoreFollowers. All rights reserved.
        </div>
      </div>
    </footer>
  );
}