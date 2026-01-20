"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Sun, Moon, Monitor, Palette } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AdminConfigPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const { theme, setTheme, resolvedTheme } = useTheme()

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login")
        }
    }, [user, authLoading])

    const themeOptions = [
        {
            value: "light" as const,
            label: "Claro",
            icon: Sun,
            description: "Tema claro sempre ativo"
        },
        {
            value: "dark" as const,
            label: "Escuro",
            icon: Moon,
            description: "Tema escuro sempre ativo"
        },
        {
            value: "system" as const,
            label: "Sistema",
            icon: Monitor,
            description: "Segue o tema do sistema"
        }
    ]

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto p-8 space-y-8">
                {/* Header */}
                <div>
                    <Button variant="ghost" onClick={() => router.push("/admin")} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar ao Painel
                    </Button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Palette className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
                            <p className="text-muted-foreground">Personalize a aparência do painel administrativo</p>
                        </div>
                    </div>
                </div>

                {/* Tema */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-1">Aparência</h2>
                            <p className="text-sm text-muted-foreground">
                                Escolha como o painel administrativo deve aparecer
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                            {themeOptions.map((option) => {
                                const Icon = option.icon
                                const isActive = theme === option.value

                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => setTheme(option.value)}
                                        className={`relative p-6 rounded-lg border-2 transition-all text-left ${isActive
                                                ? "border-primary bg-primary/5 shadow-md"
                                                : "border-border hover:border-primary/50 hover:bg-accent/50"
                                            }`}
                                    >
                                        <div className="flex flex-col items-center text-center space-y-3">
                                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                }`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className={`font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                                                    {option.label}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {option.description}
                                                </p>
                                            </div>
                                        </div>
                                        {isActive && (
                                            <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                                <svg className="h-3 w-3 text-primary-foreground" fill="currentColor" viewBox="0 0 12 12">
                                                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Preview */}
                        <div className="mt-6 p-4 rounded-lg border border-border bg-card">
                            <p className="text-sm font-medium text-foreground mb-3">Preview do tema atual:</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <div className="h-8 rounded bg-background border border-border"></div>
                                    <div className="h-8 rounded bg-primary"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-8 rounded bg-muted"></div>
                                    <div className="h-8 rounded bg-accent"></div>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                Tema ativo: <span className="font-semibold text-foreground capitalize">{resolvedTheme}</span>
                                {theme === "system" && " (automático)"}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Informações */}
                <Card className="p-6 bg-muted/50">
                    <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Monitor className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground mb-1">Modo Automático</h3>
                            <p className="text-sm text-muted-foreground">
                                Quando você escolhe "Sistema", o tema muda automaticamente baseado nas preferências do seu sistema operacional.
                                Isso significa que o painel ficará escuro à noite e claro durante o dia, se você tiver essa configuração ativada no seu dispositivo.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
