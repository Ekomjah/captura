import { Link } from "react-router";
import { Show, SignInButton, SignUpButton } from "@clerk/react";
import { ArrowRight, ScanText, Search, ShieldCheck } from "lucide-react";
import { CapturaMark } from "@/components/CapturaMark";

const features = [
  {
    icon: ScanText,
    title: "OCR on upload",
    body: "Every capture is read for text the moment it lands — no manual tagging.",
  },
  {
    icon: Search,
    title: "Full-text search",
    body: "Find any screenshot by the words inside it, across your whole library.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Originals live in a private bucket, served only through signed URLs.",
  },
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-3">
          <span className="glow-primary flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CapturaMark className="size-5" />
          </span>
          <span className="font-heading text-xl font-extrabold tracking-tight">
            Captura
          </span>
        </div>

        <nav className="flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Sign up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link
              to="/dashboard"
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Go to dashboard
            </Link>
          </Show>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pb-20 pt-16 text-center sm:pt-24">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="size-1.5 animate-glow rounded-full bg-primary" />
          Screenshot intelligence
        </span>

        <h1 className="font-heading text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Every screenshot,
          <br />
          <span className="text-primary">searchable.</span>
        </h1>

        <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
          Drop in a screenshot and Captura stores the original, generates an
          optimized variant, and extracts its text — turning a throwaway capture
          into a searchable, downloadable cloud asset.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Show when="signed-out">
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="glow-primary inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]">
                Get started
                <ArrowRight className="size-4" />
              </button>
            </SignUpButton>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
                Sign in
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link
              to="/dashboard"
              className="glow-primary inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Open your library
              <ArrowRight className="size-4" />
            </Link>
          </Show>
        </div>

        {/* Feature row */}
        <div className="mt-20 grid w-full gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-border/60 bg-card/60 p-5 text-left backdrop-blur-sm transition-colors hover:border-primary/40"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4.5" />
              </span>
              <h3 className="mt-4 font-heading text-base font-bold tracking-tight">
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
