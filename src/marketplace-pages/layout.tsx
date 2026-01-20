import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { LocationProvider } from "@/contexts/location-context"
import { BanWarningDialog } from "@/components/ban-warning-dialog"
import { AlertProvider, AlertContainer } from "@/components/alert-system"
import { ConfirmDialogProvider, ConfirmDialog } from "@/components/confirm-dialog"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MarketGuaira",
  description: "Compre e venda com segurança em Guaíra-SP! MarketGuaira é o marketplace local criado pelo Grupo RAVAL. Veículos, eletrônicos, moda e muito mais.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon-new.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const isAdmin = window.location.pathname.startsWith('/admin');
                  const storageKey = isAdmin ? 'theme-admin' : 'theme-site';
                  const theme = localStorage.getItem(storageKey) || 'system';
                  let effectiveTheme = theme;
                  
                  if (theme === 'system') {
                    effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  
                  document.documentElement.classList.add(effectiveTheme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <LocationProvider>
              <AlertProvider>
                <ConfirmDialogProvider>
                  <BanWarningDialog />
                  <AlertContainer />
                  <ConfirmDialog />
                  {children}
                </ConfirmDialogProvider>
              </AlertProvider>
            </LocationProvider>
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
