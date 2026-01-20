"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Verificar se já está logado
    useEffect(() => {
        const adminData = localStorage.getItem('marketguaira_admin')
        if (adminData) {
            try {
                const admin = JSON.parse(adminData)
                // Verificar se o token ainda é válido (menos de 24h)
                const loginTime = new Date(admin.loginTime).getTime()
                const now = new Date().getTime()
                const hoursDiff = (now - loginTime) / (1000 * 60 * 60)
                
                if (hoursDiff < 24) {
                    router.push('/admin')
                } else {
                    localStorage.removeItem('marketguaira_admin')
                }
            } catch (err) {
                localStorage.removeItem('marketguaira_admin')
            }
        }
    }, [router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            // Validações básicas
            if (!email.trim() || !password.trim()) {
                setError("Preencha todos os campos")
                setLoading(false)
                return
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                setError("Email inválido")
                setLoading(false)
                return
            }

            // Chamar função RPC do Supabase
            const { data, error: rpcError } = await supabase
                .rpc('verify_admin_credentials', {
                    admin_email: email.toLowerCase().trim(),
                    admin_password: password
                })

            console.log("Resposta completa:", { data, rpcError })

            if (rpcError) {
                console.error("Erro RPC:", rpcError)
                setError(`Erro: ${rpcError.message || 'Função não encontrada'}`)
                setLoading(false)
                return
            }

            // Verificar se a função retornou dados
            if (!data) {
                setError("Erro: Nenhum dado retornado. Execute o SQL supabase-admin-auth.sql primeiro.")
                setLoading(false)
                return
            }

            console.log("Dados recebidos:", data)

            // A função pode retornar um array ou um objeto único
            const adminData = Array.isArray(data) ? data[0] : data

            if (adminData && adminData.is_valid) {
                // Salvar dados do admin no localStorage
                const adminInfo = {
                    id: adminData.id,
                    email: adminData.email,
                    name: adminData.name,
                    loginTime: new Date().toISOString()
                }
                
                localStorage.setItem('marketguaira_admin', JSON.stringify(adminInfo))
                
                // Redirecionar para admin
                router.push('/admin')
            } else {
                setError("Email ou senha incorretos")
            }
        } catch (err) {
            console.error("Erro ao fazer login:", err)
            setError("Erro inesperado ao fazer login")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
            {/* Background decorativo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md relative z-10 shadow-2xl border-2">
                <div className="p-8">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
                            <Shield className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Painel Admin
                        </h1>
                        <p className="text-muted-foreground">
                            MarketGuaira
                        </p>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@marketguaira.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 h-12 border-2"
                                    disabled={loading}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Senha */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Senha
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10 h-12 border-2"
                                    disabled={loading}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    disabled={loading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Mensagem de erro */}
                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-sm text-red-800 animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        {/* Botão de login */}
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    <Shield className="mr-2 h-5 w-5" />
                                    Entrar no Painel
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t text-center">
                        <p className="text-xs text-muted-foreground">
                            Acesso restrito a administradores
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            © 2025 MarketGuaira - Grupo RAVAL
                        </p>
                    </div>
                </div>
            </Card>

            {/* Info de desenvolvimento (remover em produção) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="fixed bottom-4 right-4 bg-muted border-2 border-border rounded-lg p-3 text-xs max-w-xs">
                    <p className="font-semibold mb-1">Credenciais Padrão:</p>
                    <p className="text-muted-foreground">Email: admin@marketguaira.com</p>
                    <p className="text-muted-foreground">Senha: Admin@2025</p>
                </div>
            )}
        </div>
    )
}
