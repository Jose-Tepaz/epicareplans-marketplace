import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { CartProvider } from "@/contexts/cart-context"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "Epicare Plans - Find the Right Health Insurance",
  description:
    "Compare coverages, prices, and benefits from top insurance providers. Get quotes, apply, and manage your policies all in one place.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <CartProvider>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          <Analytics />
          <Toaster position="top-right" richColors closeButton />
        </CartProvider>
      </body>
    </html>
  )
}
