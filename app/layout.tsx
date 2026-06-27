import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "מופע המעטפות 💌",
  description: "מופע חי לפתיחת מעטפות בחתונה.",
};

export const viewport: Viewport = {
  themeColor: "#0a0612",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
