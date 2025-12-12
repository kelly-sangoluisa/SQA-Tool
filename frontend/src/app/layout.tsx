import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/components.css";
import { ClientProviders } from "./providers";
import { GlobalLayout } from "@/components/layout/GlobalLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SQA Tool - Evaluación de Calidad de Software",
  description: "Sistema de evaluación de calidad de software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ClientProviders>
          <GlobalLayout>
            {children}
          </GlobalLayout>
        </ClientProviders>
      </body>
    </html>
  );
}
