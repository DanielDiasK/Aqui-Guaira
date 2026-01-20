import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !senha) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      console.log("🔐 Tentando login admin:", { email });

      const response = await fetch('/api/auth?action=admin_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Erro ao verificar login:", data.message);
        toast.error(data.message || "Erro ao fazer login");
        setLoading(false);
        return;
      }

      console.log("✅ Admin encontrado:", data);

      // Salvar dados do admin no localStorage
      localStorage.setItem("admin", JSON.stringify({
        id: data.id,
        email: data.email,
        nome: data.nome,
        loginTime: new Date().toISOString()
      }));

      toast.success(`Bem-vindo, ${data.nome}!`);
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-zinc-950 p-4 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-none rounded-[40px] overflow-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl animate-in fade-in zoom-in duration-700">
        <CardHeader className="space-y-6 text-center pt-12 pb-8">
          <div className="mx-auto w-24 h-24 bg-white dark:bg-zinc-800 rounded-[32px] shadow-2xl flex items-center justify-center p-4 border border-zinc-100 dark:border-zinc-700 transform hover:rotate-6 transition-transform duration-500">
            <img src="/images/logo.png" alt="Aqui Guaíra" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Portal Admin</CardTitle>
            <CardDescription className="text-zinc-500 font-medium px-8">
              Autenticação segura para o núcleo de gerenciamento do Aqui Guaíra.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-10 pb-12">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-widest text-zinc-400 pl-1">E-mail Corporativo</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@aquiguaira.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 transition-all font-medium"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="senha" className="text-[10px] uppercase font-black tracking-widest text-zinc-400 pl-1">Senha de Acesso</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-12 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 transition-all font-medium"
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Acessar Dashboard</span>
                  <Shield className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <Lock className="w-3 h-3" /> Sistema Criptografado Multi-Camadas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
