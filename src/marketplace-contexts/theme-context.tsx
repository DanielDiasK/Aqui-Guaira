"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
    resolvedTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [theme, setThemeState] = useState<Theme>("system")
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

    // Verificar se está na área admin
    const isAdminRoute = pathname?.startsWith("/admin")

    useEffect(() => {
        // Usar chaves diferentes para admin e site
        const storageKey = isAdminRoute ? "theme-admin" : "theme-site"
        const savedTheme = localStorage.getItem(storageKey) as Theme | null
        if (savedTheme) {
            setThemeState(savedTheme)
        } else {
            // Se não tiver tema salvo, usar padrão
            setThemeState("system")
        }
    }, [isAdminRoute])

    useEffect(() => {
        const root = window.document.documentElement

        // Remover classes anteriores
        root.classList.remove("light", "dark")

        // Aplicar o tema escolhido em todo o site
        let effectiveTheme: "light" | "dark" = "light"

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
            effectiveTheme = systemTheme
        } else {
            effectiveTheme = theme
        }

        root.classList.add(effectiveTheme)
        setResolvedTheme(effectiveTheme)
    }, [theme, isAdminRoute])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
        // Salvar com chave específica dependendo da área
        const storageKey = pathname?.startsWith("/admin") ? "theme-admin" : "theme-site"
        localStorage.setItem(storageKey, newTheme)
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
}
