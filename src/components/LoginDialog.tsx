import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { criarOuLogarUsuario, getUsuarioLogado, logout } from '@/lib/supabase'
import { toast } from 'sonner'
import { Loader2, LogIn, LogOut, User as UserIcon, UserPlus } from 'lucide-react'

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess?: () => void
}

export function LoginDialog({ open, onOpenChange, onLoginSuccess }: LoginDialogProps) {
  // Estado do formulário de Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginSenha, setLoginSenha] = useState('')
  const [loadingLogin, setLoadingLogin] = useState(false)

  // Estado do formulário de Registro
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerNome, setRegisterNome] = useState('')
  const [registerSenha, setRegisterSenha] = useState('')
  const [registerConfirmarSenha, setRegisterConfirmarSenha] = useState('')
  const [loadingRegister, setLoadingRegister] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!loginEmail.trim() || !loginSenha.trim()) {
      toast.error('Preencha email e senha')
      return
    }

    setLoadingLogin(true)
    try {
      const user = await criarOuLogarUsuario(loginEmail, undefined, loginSenha)
      
      if (!user) {
        toast.error('Email ou senha incorretos')
        return
      }

      toast.success('Login realizado!', {
        description: `Bem-vindo de volta, ${user.nome || user.email}!`
      })
      
      setLoginEmail('')
      setLoginSenha('')
      onOpenChange(false)
      onLoginSuccess?.()
    } catch (error: any) {
      toast.error('Erro ao fazer login', {
        description: error.message || 'Verifique suas credenciais'
      })
    } finally {
      setLoadingLogin(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validações
    if (!registerEmail.trim()) {
      toast.error('Digite seu email')
      return
    }
    if (!registerNome.trim()) {
      toast.error('Digite seu nome')
      return
    }
    if (!registerSenha.trim()) {
      toast.error('Digite uma senha')
      return
    }
    if (registerSenha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }
    if (registerSenha !== registerConfirmarSenha) {
      toast.error('As senhas não coincidem')
      return
    }

    setLoadingRegister(true)
    try {
      await criarOuLogarUsuario(registerEmail, registerNome, registerSenha, true)
      
      toast.success('Conta criada com sucesso!', {
        description: 'Você já está logado e pode usar o sistema.'
      })
      
      setRegisterEmail('')
      setRegisterNome('')
      setRegisterSenha('')
      setRegisterConfirmarSenha('')
      onOpenChange(false)
      onLoginSuccess?.()
    } catch (error: any) {
      toast.error('Erro ao criar conta', {
        description: error.message || 'Tente novamente'
      })
    } finally {
      setLoadingRegister(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Entrar ou Criar Conta</DialogTitle>
          <DialogDescription>
            Faça login ou crie uma conta para salvar favoritos e postar no mural
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Criar Conta</TabsTrigger>
          </TabsList>

          {/* Tab de Login */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-senha">Senha</Label>
                <Input
                  id="login-senha"
                  type="password"
                  placeholder="••••••••"
                  value={loginSenha}
                  onChange={(e) => setLoginSenha(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loadingLogin}>
                {loadingLogin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Tab de Registro */}
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="register-nome">Nome Completo</Label>
                <Input
                  id="register-nome"
                  type="text"
                  placeholder="Seu nome"
                  value={registerNome}
                  onChange={(e) => setRegisterNome(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-senha">Senha</Label>
                <Input
                  id="register-senha"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={registerSenha}
                  onChange={(e) => setRegisterSenha(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirmar">Confirmar Senha</Label>
                <Input
                  id="register-confirmar"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={registerConfirmarSenha}
                  onChange={(e) => setRegisterConfirmarSenha(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loadingRegister}>
                {loadingRegister ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Criar Conta
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

interface UserButtonProps {
  onLoginRequired?: () => void
}

export function UserButton({ onLoginRequired }: UserButtonProps) {
  const [showLogin, setShowLogin] = useState(false)
  const user = getUsuarioLogado()

  const handleLogout = () => {
    logout()
    toast.success('Logout realizado')
    window.location.reload()
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{user.nome || user.email}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="h-8"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowLogin(true)}
        className="gap-2"
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Login</span>
      </Button>

      <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
        onLoginSuccess={onLoginRequired}
      />
    </>
  )
}
