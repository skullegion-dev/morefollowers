export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Frequently Asked Questions</h1>
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Is it safe?</h3>
          <p className="text-muted-foreground">Yes. We never ask for your password.</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">How fast is delivery?</h3>
          <p className="text-muted-foreground">Most orders start within minutes.</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Which payments do you accept?</h3>
          <p className="text-muted-foreground">M-Pesa, Visa, Mastercard, PayPal, Bitcoin, USDT, BNB and more.</p>
        </div>
      </div>
    </div>
  );
}