import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BRAND_LOGO_URL } from "@/lib/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trailer Abby",
  description: "Shared trailer tracking board for Little Abby dispatch",
  icons: {
    icon: BRAND_LOGO_URL,
    apple: BRAND_LOGO_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} min-h-screen bg-black font-sans text-[#e7e9ea] antialiased`}
      >
        <ClerkProvider
          signInUrl="/sign-in"
          signInFallbackRedirectUrl="/"
          afterSignOutUrl="/sign-in"
          appearance={{
            variables: {
              colorBackground: "#000000",
              colorText: "#e7e9ea",
              colorPrimary: "#1d9bf0",
              borderRadius: "0px",
            },
            layout: {
              logoImageUrl: BRAND_LOGO_URL,
              logoLinkUrl: "/",
            },
          }}
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
