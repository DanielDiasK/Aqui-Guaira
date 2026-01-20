"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email || !password) {
      setError("Por favor, preencha todos os campos")
      return
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres")
      return
    }

    setLoading(true)

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password)
        if (error) {
          console.log('Erro completo:', error)
          
          // Mensagens de erro mais específicas
          if (error.message.includes("Invalid login credentials")) {
            setError("Email ou senha incorretos")
          } else if (error.message.includes("Email not confirmed")) {
            setError("Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.")
          } else if (error.message.includes("User not found")) {
            setError("Usuário não encontrado. Verifique o email digitado.")
          } else {
            setError(error.message || "Erro ao fazer login. Tente novamente.")
          }
        } else {
          setSuccess("Login realizado com sucesso!")
          setTimeout(() => {
            onOpenChange(false)
            resetForm()
          }, 1000)
        }
      } else {
        const { error } = await signUp(email, password)
        if (error) {
          console.log('Erro no cadastro:', error)
          
          if (error.message.includes("already registered")) {
            setError("Este email já está cadastrado. Tente fazer login.")
          } else {
            setError(error.message || "Erro ao criar conta")
          }
        } else {
          setSuccess("Conta criada! Verifique seu email para confirmar.")
          setTimeout(() => {
            setMode("login")
            setEmail("")
            setPassword("")
            setConfirmPassword("")
            setSuccess("")
          }, 3000)
        }
      }
    } catch (err) {
      console.error('Erro na autenticação:', err)
      setError("Ocorreu um erro. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setError("")
    setSuccess("")
    setMode("login")
  }

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login")
    setError("")
    setSuccess("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {mode === "login" ? "Entrar" : "Criar Conta"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === "login"
              ? "Entre com sua conta para acessar o MarketGuaira"
              : "Crie sua conta e comece a vender hoje mesmo"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          {/* Confirmar Senha (apenas no cadastro) */}
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Mensagens de erro/sucesso */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Botão de Submit */}
          <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "login" ? "Entrando..." : "Criando conta..."}
              </>
            ) : mode === "login" ? (
              "Entrar"
            ) : (
              "Criar Conta"
            )}
          </Button>

          {/* Alternar modo */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={switchMode}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
            >
              {mode === "login" ? (
                <>
                  Não tem uma conta?{" "}
                  <span className="text-primary font-semibold">Cadastre-se</span>
                </>
              ) : (
                <>
                  Já tem uma conta?{" "}
                  <span className="text-primary font-semibold">Entre</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

