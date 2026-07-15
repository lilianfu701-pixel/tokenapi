import Link from "next/link";

export default function RequestSentPage() {
  return (
    <main className="docs-shell">
      <header className="docs-header">
        <Link className="brand" href="/" aria-label="Back to TokenAPI home">
          <span className="brand-mark" aria-hidden="true">
            T
          </span>
          <span>
            <strong>TokenAPI</strong>
            <small>Access queue</small>
          </span>
        </Link>
        <Link className="button button-secondary" href="/docs">
          Read developer docs
        </Link>
      </header>

      <section className="docs-hero request-sent-hero">
        <span className="eyebrow">Access request received</span>
        <h1>Your TokenAPI request is in the queue.</h1>
        <p>
          Thanks for sharing what you want to build. The request has been stored
          in the TokenAPI access queue, and the next step is reviewing the use
          case before API keys are issued.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/docs">
            Review the docs
          </Link>
          <Link className="button button-secondary" href="/">
            Back to homepage
          </Link>
        </div>
      </section>
    </main>
  );
}
