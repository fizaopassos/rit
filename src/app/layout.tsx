import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans, Bree_Serif  } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

const breeSerif = Bree_Serif({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RIT — Retha Ativos",
  description: "Controle de ativos de tecnologia da Retha",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} ${breeSerif.variable} h-full antialiased`}    >
      <body>
         <AppShell>{children}</AppShell>
          <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
