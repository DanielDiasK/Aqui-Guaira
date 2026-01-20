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
      
      const { data, error } = await supabase
        .rpc("verificar_admin_login", {
          admin_email: email,
          admin_senha: senha
        });

      console.log("📊 Resposta do login:", { data, error });

      if (error) {
        console.error("❌ Erro ao verificar login:", error);
        toast.error("Erro ao fazer login");
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.log("⚠️ Nenhum admin encontrado com este email");
        toast.error("Email ou senha incorretos");
        setLoading(false);
        return;
      }

      console.log("✅ Admin encontrado:", data[0]);

      if (!data[0].sucesso) {
        console.log("🔒 Senha incorreta");
        toast.error("Email ou senha incorretos");
        setLoading(false);
        return;
      }

      // Salvar dados do admin no localStorage
      localStorage.setItem("admin", JSON.stringify({
        id: data[0].id,
        email: data[0].email,
        nome: data[0].nome,
        loginTime: new Date().toISOString()
      }));

      toast.success(`Bem-vindo, ${data[0].nome}!`);
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">Painel Administrativo</CardTitle>
            <CardDescription>
              Faça login para acessar o painel de controle
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email do Administrador</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@aquiguaira.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar no Painel"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>Acesso restrito a administradores</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
