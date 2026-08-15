export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">How it Works</h1>
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold mb-2">1. Create a free account</h3>
          <p className="text-muted-foreground">Sign up with Google, Apple or email in seconds.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">2. Add funds</h3>
          <p className="text-muted-foreground">Pay with M-Pesa, Visa, Mastercard, PayPal or Crypto.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">3. Choose a service</h3>
          <p className="text-muted-foreground">Select the platform and the quantity you need.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">4. Place your order</h3>
          <p className="text-muted-foreground">We start processing immediately. Track progress in your dashboard.</p>
        </div>
      </div>
    </div>
  );
}