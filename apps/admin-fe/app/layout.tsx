import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrackMed Admin",
  description: "TrackMed Admin Portal - Manage your supply chain platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
