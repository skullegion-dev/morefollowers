export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose dark:prose-invert space-y-4 text-muted-foreground">
        <p>
          By using MoreFollowers you agree to these Terms of Service.
        </p>
        <p>
          You are responsible for providing correct information when placing
          orders. We do not guarantee specific results from social media
          services.
        </p>
        <p>
          Payments are final once processed. Refunds are handled on a
          case-by-case basis.
        </p>
        <p>
          We reserve the right to suspend accounts that abuse the platform.
        </p>
      </div>
    </div>
  );
}