import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medalverse Enterprise",
  description: "Medalverse An end-to-end platform that turns experiences into verified credentials for university & job applications.",
  icons: {
    icon: "/app/assets/logos/medalverse-logo.svg",
    shortcut: "/app/assets/logos/medalverse-logo.svg",
    apple: "/app/assets/logos/medalverse-logo.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=chillax@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
