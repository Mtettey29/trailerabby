import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BRAND_ICON_SIZES, BRAND_LOGO_CLERK_URL, BRAND_LOGO_URL, brandIconUrl } from "@/lib/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trailer Abby",
  description: "Shared trailer tracking board for Little Abby dispatch",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: BRAND_ICON_SIZES.filter((s) => s !== 180).map((size) => ({
      url: brandIconUrl(size),
      sizes: `${size}x${size}`,
      type: "image/png",
    })),
    apple: [{ url: brandIconUrl(180), sizes: "180x180", type: "image/png" }],
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
              logoImageUrl: BRAND_LOGO_CLERK_URL,
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
