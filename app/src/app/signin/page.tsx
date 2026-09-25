import type { Metadata } from "next";
import Link from "next/link";
import { GoogleButton } from "@/components/google-button";
import { Icon, Logo, cn } from "@/components/ui";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Sign in" };

// S1 · C: /signin is only shown when sign-in is cancelled or fails, a session has ended, or a page needs sign-in.
const STATES = {
  ended: {
    title: "Sign in to continue",
    alert: "You've been signed out. Sign in to pick up where you left off.",
    tone: "bg-surface-2",
    icon: "logout",
    iconClass: "text-ink-2",
    cta: "Continue with Google",
    foot: "You will return to the page you were on.",
  },
  cancelled: {
    title: "Sign in to NoteHive",
    alert: "Sign-in was cancelled. Choose a Google account to continue.",
    tone: "bg-warning-soft",
    icon: "info",
    iconClass: "text-warning",
    cta: "Try again with Google",
    foot: "NoteHive only uses your name and email.",
  },
  failed: {
    title: "Sign in to NoteHive",
    alert: "Couldn't sign you in with Google. Try again in a moment.",
    tone: "bg-error-soft",
    icon: "error",
    iconClass: "text-error",
    cta: "Try again with Google",
    foot: "Still stuck? Check that pop-ups and cookies are allowed for NoteHive.",
  },
  default: {
    title: "Sign in to NoteHive",
    alert: null,
    tone: "",
    icon: "",
    iconClass: "",
    cta: "Continue with Google",
    foot: "New to NoteHive? This creates your account. You'll join Community automatically.",
  },
} as const;

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ reason?: string; next?: string }> }) {
  const { reason, next } = await searchParams;
  const st = STATES[(reason as keyof typeof STATES) in STATES ? (reason as keyof typeof STATES) : "default"];
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 py-16">
      <div className="flex w-full max-w-[400px] flex-col gap-[22px]">
        <Link href="/" className="self-start">
          <Logo size={24} textClass="text-[19px]" onBg="var(--bg)" />
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="m-0 text-[26px] font-semibold leading-[33px] tracking-[-0.02em]">{st.title}</h1>
          <p className="m-0 text-[15px] leading-[23px] text-ink-2">Ask what you want to learn and get answers from a shared library and your peers&apos; notes.</p>
        </div>
        {st.alert && (
          <div role="alert" className={cn("flex items-start gap-2.5 rounded-[10px] px-3.5 py-3 text-sm leading-5", st.tone)}>
            <Icon name={st.icon} size={18} className={st.iconClass} />
            <span>{st.alert}</span>
          </div>
        )}
        <GoogleButton next={safeNext(next)} label={st.cta} full />
        <span className="text-[13px] text-ink-3">{st.foot}</span>
      </div>
    </main>
  );
}
