import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { Providers } from "@/components/providers";
import { USE_MOCKS } from "@/lib/config";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], weight: ["400", "500", "600"] });
const sourceSerif = Source_Serif_4({ variable: "--font-source-serif", subsets: ["latin"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: { default: "NoteHive · Learn together", template: "%s · NoteHive" },
  description: "Ask a question and get a short answer from a shared library and your peers' notes. Every point is cited, and every peer is credited.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${sourceSerif.variable} h-full`}>
      <head>
        {/* Icon font used across the designs; next/font can't subset variable icon fonts. */}
        {/* display=block avoids flashing icon ligature names as text. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font, @next/next/google-font-display */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..500,0..1,0&display=block"
        />
      </head>
      <body className="min-h-full bg-bg text-ink antialiased">
        <Providers mock={USE_MOCKS}>{children}</Providers>
      </body>
    </html>
  );
}
