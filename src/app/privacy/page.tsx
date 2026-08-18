export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose dark:prose-invert space-y-4 text-muted-foreground">
        <p>
          We collect only the information needed to provide our services
          (email, payment details, and order information).
        </p>
        <p>
          Your data is stored securely and is never sold to third parties.
        </p>
        <p>
          Payment information is handled by the respective payment providers
          (M-Pesa, Stripe, PayPal, Crypto processors).
        </p>
        <p>
          By using the site you consent to this privacy policy.
        </p>
      </div>
    </div>
  );
}