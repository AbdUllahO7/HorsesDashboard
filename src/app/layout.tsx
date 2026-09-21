import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { AuthProvider } from "@/core/hooks/useAuth";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import "@/styles/globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "لوحة التحكم | منصة الخيول والمستلزمات",
  description: "لوحة إدارة المزادات وبائعي المواشي والمستلزمات",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] antialiased font-cairo selection:bg-[var(--primary-gold)] selection:text-black">
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
