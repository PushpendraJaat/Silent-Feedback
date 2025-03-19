import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/context/AuthProviders";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Silent Feedback - Share Feedback Anonymously",
  description:
    "Silent Feedback allows you to share anonymous feedback quickly and securely. Improve communication and get honest insights.",
  keywords: [
    "anonymous feedback",
    "feedback platform",
    "anonymous comments",
    "secure feedback",
    "honest feedback"
  ],
  robots: {
    index: true, // Allow indexing
    follow: true, // Allow crawling links
  },
  openGraph: {
    title: "Silent Feedback - Share Feedback Anonymously",
    description:
      "Silent Feedback allows you to share anonymous feedback quickly and securely. Improve communication and get honest insights.",
    url: "https://silent-feedback.pushpendrajaat.in",
    siteName: "Silent Feedback",
    images: [
      {
        url: "https://silent-feedback.pushpendrajaat.in/og-image.png", // Add an optimized image for social sharing
        width: 1200,
        height: 630,
        alt: "Silent Feedback - Share Feedback Anonymously",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@silentfeedback", // Your Twitter handle
    creator: "@pushpendrajaat", // Creator's Twitter handle
    title: "Silent Feedback - Share Feedback Anonymously",
    description:
      "Silent Feedback allows you to share anonymous feedback quickly and securely. Improve communication and get honest insights.",
    images: ["https://silent-feedback.pushpendrajaat.in/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico", // Path to favicon
    apple: "/apple-touch-icon.png", // Path to Apple Touch icon
  },
  alternates: {
    canonical: "https://silent-feedback.pushpendrajaat.in",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <AuthProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </AuthProvider>
    </html>
  );
}
