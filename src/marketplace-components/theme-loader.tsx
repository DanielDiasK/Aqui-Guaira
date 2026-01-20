"use client"

import { useEffect } from "react"

export function ThemeLoader() {
  useEffect(() => {
    // Carregar tema salvo do localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    const theme = savedTheme || "system"
    
    const root = document.documentElement
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.toggle("dark", systemTheme === "dark")
    } else {
      root.classList.toggle("dark", theme === "dark")
    }
  }, [])

  return null
}
