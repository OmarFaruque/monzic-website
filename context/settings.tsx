'use client'

import { createContext, useContext, ReactNode, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface Settings {
  siteName: string
  activeRedirection?: string
  redirectUrl?: string
  [key: string]: any
}

const SettingsContext = createContext<Settings | null>(null)

export function SettingsProvider({ children, settings }: { children: ReactNode; settings: Settings }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {

    if (settings?.general?.activeRedirection === "1" && settings?.general?.redirectUrl) {
      const isAdminPath = pathname.startsWith("/administrator") || pathname.startsWith("/admin-login")
      if (!isAdminPath) {
        router.replace(settings.redirectUrl)
      }
    }
  }, [settings, router, pathname])

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
