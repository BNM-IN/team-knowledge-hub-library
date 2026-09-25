import Link from "next/link";
import { Logo } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-ink">
      <Logo size={32} text={false} onBg="var(--bg)" />
      <h1 className="m-0 text-xl font-semibold">This page is private or no longer exists.</h1>
      <Link href="/" className="text-sm font-medium text-accent-text hover:underline">
        Ask a question instead
      </Link>
    </main>
  );
}
