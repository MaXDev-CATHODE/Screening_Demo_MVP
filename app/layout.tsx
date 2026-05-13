import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Screening Demo MVP",
  description: "Interactive demo MVP for reference-list product screening"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
