
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/context/auth"
import { AdminAuthProvider } from "@/context/admin-auth"
import { ThemeProvider } from "@/components/theme-provider"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

import { getSettings } from "@/lib/database"
import { SettingsProvider } from "@/context/settings"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const generalSettings = await getSettings("general")
  const openaiSettings = await getSettings("openai")
  const bankSettings = await getSettings("bank")
  const stripeSettings = await getSettings("stripe")
  const squareSettings = await getSettings("square")
  const paymentSettings = await getSettings("payment")

  const settings = {
    ...generalSettings,
    openai: openaiSettings,
    bank: bankSettings,
    stripe: stripeSettings,
    square: squareSettings,
    paymentProvider: paymentSettings,
  }

  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <AuthProvider>
          <AdminAuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <SettingsProvider settings={settings}>
                {children}
              </SettingsProvider>
              <Toaster />
            </ThemeProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
