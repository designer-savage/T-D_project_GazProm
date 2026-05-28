import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ProfileProvider } from "@/context/ProfileContext"
import "./globals.css"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "T&D Platform — Газпром Нефть ИТ",
  description: "Корпоративная платформа обучения и развития",
  icons: {
    icon: "/icon.svg",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ProfileProvider>{children}</ProfileProvider>
      </body>
    </html>
  )
}
