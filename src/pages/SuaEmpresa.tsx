import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCNPJ, formatPhone, isValidCNPJ } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/sonner";
import { Building2, ArrowLeft, Lock, PlusCircle, UploadCloud, Image as ImageIcon, X, Loader2, Home } from "lucide-react";
import { criarEmpresa, buscarCategorias, uploadImagens, supabase } from "@/lib/supabase";
import { BAIRROS_GUAIRA } from "@/data/bairros";
import categoriasData from "@/data/categorias-empresas.json";

// Schema de cadastro
const cadastroSchema = z.object({
  cnpj: z.string().min(18, "CNPJ incompleto"),
  razaoSocial: z.string().min(3, "Mínimo 3 caracteres"),
  nomeFantasia: z.string().min(2, "Mínimo 2 caracteres"),
  celular: z.string().min(15, "Celular incompleto"),
  email: z.string().email("Email inválido"),
  categoria: z.string().min(1, "Selecione uma categoria"),
  subcategorias: z.array(z.string()).min(1, "Selecione ao menos 1 subcategoria").max(3, "Máximo 3 subcategorias"),
  bairro: z.string().min(1, "Informe o bairro"),
  endereco: z.string().min(5, "Endereço muito curto"),
  whatsapp: z.string().min(15, "WhatsApp incompleto"),
  site: z.string().url("URL inválida").optional().or(z.literal("")),
  descricao: z.string().min(10, "Descreva com mais detalhes (mín. 10)"),
  logoFile: z.instanceof(File).optional(),
  bannerFile: z.instanceof(File).optional(),
  cep: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  link_google_maps: z.string().url("URL inválida").optional().or(z.literal("")),
});

const loginSchema = z.object({
  cnpj: z.string().min(18, "Informe seu CNPJ"),
  celular: z.string().min(15, "Informe seu celular"),
});

const SuaEmpresa = () => {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"login" | "cadastro">("cadastro");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [dragLogo, setDragLogo] = useState(false);
  const [dragBanner, setDragBanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("");
  const [subcategoriasSelecionadas, setSubcategoriasSelecionadas] = useState<string[]>([]);

  // Carregar categorias do Supabase
  useEffect(() => {
    buscarCategorias().then(cats => {
      setCategorias(cats.map(c => c.nome));
    });
  }, []);

  const cadastroForm = useForm<z.infer<typeof cadastroSchema>>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      cnpj: "",
      razaoSocial: "",
      nomeFantasia: "",
      celular: "",
      email: "",
      categoria: "",
      subcategorias: [],
      bairro: "",
      endereco: "",
      whatsapp: "",
      site: "",
      descricao: "",
    },
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { cnpj: "", celular: "" },
  });

  const handleCadastro = async (data: z.infer<typeof cadastroSchema>) => {
    if (!isValidCNPJ(data.cnpj)) {
      toast("CNPJ inválido", { description: "Verifique o CNPJ digitado", duration: 2000 });
      return;
    }

    setLoading(true);
    try {
      // Upload de imagens (opcional - se buckets não existirem, usa placeholders)
      const imagens: string[] = [];
      let logoUrl: string | undefined;

      // Tentar upload, mas não falhar se bucket não existir
      if (data.bannerFile) {
        try {
          const [bannerUrl] = await uploadImagens('empresas-images', [data.bannerFile], 'banners');
          if (bannerUrl) imagens.push(bannerUrl);
        } catch (error) {
          console.warn('Upload de banner falhou, continuando sem imagem', error);
          // Usar placeholder
          imagens.push('https://images.unsplash.com/photo-1497366216548-37526070297c?w=800');
        }
      }

      if (data.logoFile) {
        try {
          const [url] = await uploadImagens('empresas-images', [data.logoFile], 'logos');
          logoUrl = url;
        } catch (error) {
          console.warn('Upload de logo falhou, continuando sem logo', error);
          // Usar placeholder
          logoUrl = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400';
        }
      }

      // Buscar ID da categoria
      const { data: categoriaData } = await supabase
        .from('categorias')
        .select('id')
        .eq('nome', data.categoria)
        .single();

      // Criar slug
      const slug = data.nomeFantasia
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Criar empresa no Supabase
      const empresaData = {
        cnpj: data.cnpj, // ← CNPJ adicionado
        nome: data.nomeFantasia,
        slug,
        descricao: data.descricao,
        categoria_id: categoriaData?.id,
        subcategorias: data.subcategorias, // ← Subcategorias adicionadas
        endereco: data.endereco,
        bairro: data.bairro,
        cidade: 'Guaíra',
        estado: 'SP',
        cep: data.cep,
        latitude: -20.3167, // Coordenadas padrão de Guaíra
        longitude: -48.3167,
        telefone: data.celular,
        whatsapp: data.whatsapp,
        email: data.email,
        site: data.site || undefined,
        instagram: data.instagram,
        facebook: data.facebook,
        link_google_maps: data.link_google_maps || undefined,
        imagens,
        logo: logoUrl,
        status: 'aprovado' as const, // ← Mudei para 'aprovado' para aparecer na listagem
        verificado: false,
        destaque: false,
        responsavel_nome: data.razaoSocial,
        responsavel_email: data.email,
        responsavel_telefone: data.celular,
      };

      const resultado = await criarEmpresa(empresaData);

      // Salvar credenciais no localStorage para login
      localStorage.setItem('empresa_auth', JSON.stringify({
        cnpj: data.cnpj,
        celular: data.celular,
        empresaId: resultado.id
      }));

      toast("Cadastro realizado!", {
        description: `${data.nomeFantasia} cadastrado com sucesso! Aguarde aprovação.`,
        duration: 3000
      });

      // Redirecionar para dashboard
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);

      // Mensagem de erro mais específica
      let mensagem = "Tente novamente mais tarde";

      if (error?.message?.includes('row-level security') || error?.code === '42501') {
        mensagem = "❌ Permissão negada. Execute o arquivo 'supabase/fix-rls.sql' no Supabase SQL Editor.";
      } else if (error?.message?.includes('Bucket not found')) {
        mensagem = "❌ Buckets de storage não configurados. Veja SETUP_RAPIDO.md";
      } else if (error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
        mensagem = "❌ Tabela não existe. Execute o arquivo 'supabase/schema.sql' no Supabase SQL Editor primeiro.";
      } else if (error?.code === '23505') {
        mensagem = "❌ Esta empresa já está cadastrada (CNPJ duplicado).";
      } else if (error?.message) {
        mensagem = `❌ Erro: ${error.message}`;
      }

      toast("Erro ao cadastrar", {
        description: mensagem,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      // Buscar empresa pelo CNPJ e verificar celular (autenticação simples)
      // Nota: Em produção, use Supabase Auth ou similar
      const cnpjLimpo = data.cnpj.replace(/\D/g, '');
      const celularLimpo = data.celular.replace(/\D/g, '');

      const { data: empresa, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('responsavel_telefone', data.celular)
        .single();

      if (error || !empresa) {
        toast("Login falhou", {
          description: "CNPJ ou celular incorretos",
          duration: 2000
        });
        return;
      }

      // Salvar sessão
      localStorage.setItem('empresa_auth', JSON.stringify({
        cnpj: data.cnpj,
        celular: data.celular,
        empresaId: empresa.id
      }));

      toast("Login realizado!", {
        description: `Bem-vindo, ${empresa.nome}`,
        duration: 2000
      });

      // Redirecionar para dashboard
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      console.error('Erro no login:', error);
      toast("Erro ao fazer login", {
        description: "Tente novamente",
        duration: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  // Helpers de formatação onChange
  const onMaskCNPJ = (e: React.ChangeEvent<HTMLInputElement>, formType: "login" | "cadastro") => {
    const masked = formatCNPJ(e.target.value);
    if (formType === "cadastro") cadastroForm.setValue("cnpj", masked);
    else loginForm.setValue("cnpj", masked);
  };

  const onMaskPhone = (e: React.ChangeEvent<HTMLInputElement>, field: "celular" | "whatsapp", formType: "login" | "cadastro") => {
    const masked = formatPhone(e.target.value);
    if (formType === "cadastro") cadastroForm.setValue(field as any, masked);
    else loginForm.setValue(field as any, masked);
  };

  const fileToDataUrl = (file: File, cb: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => cb(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onLogoSelect = (file?: File) => {
    console.log('📸 onLogoSelect chamado:', file);
    if (!file) return;
    cadastroForm.setValue("logoFile", file);
    fileToDataUrl(file, (url) => {
      console.log('✅ Logo preview gerado:', url?.substring(0, 50) + '...');
      setLogoPreview(url);
    });
  };

  const onBannerSelect = (file?: File) => {
    console.log('🖼️ onBannerSelect chamado:', file);
    if (!file) return;
    cadastroForm.setValue("bannerFile", file);
    fileToDataUrl(file, (url) => {
      console.log('✅ Banner preview gerado:', url?.substring(0, 50) + '...');
      setBannerPreview(url);
    });
  };

  const handleLogoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 handleLogoInput:', e.target.files);
    onLogoSelect(e.target.files?.[0]);
  };
  const handleBannerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 handleBannerInput:', e.target.files);
    onBannerSelect(e.target.files?.[0]);
  };

  const handleDropGeneric = (e: React.DragEvent<HTMLDivElement>, type: "logo" | "banner") => {
    e.preventDefault();
    if (type === "logo") setDragLogo(false); else setDragBanner(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (type === "logo") onLogoSelect(file); else onBannerSelect(file);
  };

  const removeLogo = () => { cadastroForm.setValue("logoFile", undefined); setLogoPreview(null); };
  const removeBanner = () => { cadastroForm.setValue("bannerFile", undefined); setBannerPreview(null); };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow relative">
        {/* Fundo decorativo */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container mx-auto px-4 py-12 relative space-y-10">
          {/* Botões de Navegação */}
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => navigate(-1)}
              className="gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg px-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg px-6"
            >
              <Home className="w-4 h-4" />
              Início
            </Button>
          </div>

          <div className="flex flex-col gap-4 max-w-3xl">
            <h2 className="text-3xl font-bold gradient-text flex items-center gap-3"><Building2 className="h-8 w-8 text-primary" /> Sua Empresa</h2>
            <p className="text-sm text-muted-foreground max-w-xl">Cadastre seu negócio no diretório local ou acesse para ajustar suas informações. Todos os campos principais são obrigatórios para garantir qualidade dos dados exibidos.</p>
            <div className="flex gap-3">
              <Button variant={modo === "cadastro" ? "default" : "outline"} size="sm" onClick={() => setModo("cadastro")} className="gap-2"><PlusCircle className="h-4 w-4" /> Cadastro</Button>
              <Button variant={modo === "login" ? "default" : "outline"} size="sm" onClick={() => setModo("login")} className="gap-2"><Lock className="h-4 w-4" /> Login</Button>
            </div>
          </div>

          {modo === "cadastro" && (
            <Card className="glass-card border-2 max-w-5xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Cadastro de Empresa</CardTitle>
                <CardDescription>Preencha os dados obrigatórios. Após análise, seu negócio poderá aparecer na listagem.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <form className="space-y-8" onSubmit={cadastroForm.handleSubmit(handleCadastro)}>
                  {/* Identificação */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Identificação</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">CNPJ *</label>
                        <Input value={cadastroForm.watch("cnpj")} onChange={(e) => onMaskCNPJ(e, "cadastro")} placeholder="00.000.000/0000-00" />
                        {cadastroForm.formState.errors.cnpj && <p className="text-xs text-destructive">{cadastroForm.formState.errors.cnpj.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Razão Social *</label>
                        <Input {...cadastroForm.register("razaoSocial")} />
                        {cadastroForm.formState.errors.razaoSocial && <p className="text-xs text-destructive">{cadastroForm.formState.errors.razaoSocial.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Nome Fantasia *</label>
                        <Input {...cadastroForm.register("nomeFantasia")} />
                        {cadastroForm.formState.errors.nomeFantasia && <p className="text-xs text-destructive">{cadastroForm.formState.errors.nomeFantasia.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Email *</label>
                        <Input type="email" {...cadastroForm.register("email")} />
                        {cadastroForm.formState.errors.email && <p className="text-xs text-destructive">{cadastroForm.formState.errors.email.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Contato */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Contato</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Celular (login) *</label>
                        <Input value={cadastroForm.watch("celular")} onChange={(e) => onMaskPhone(e, "celular", "cadastro")} placeholder="(11) 90000-0000" />
                        {cadastroForm.formState.errors.celular && <p className="text-xs text-destructive">{cadastroForm.formState.errors.celular.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">WhatsApp *</label>
                        <Input value={cadastroForm.watch("whatsapp")} onChange={(e) => onMaskPhone(e, "whatsapp", "cadastro")} placeholder="(11) 90000-0000" />
                        {cadastroForm.formState.errors.whatsapp && <p className="text-xs text-destructive">{cadastroForm.formState.errors.whatsapp.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Site</label>
                        <Input {...cadastroForm.register("site")} placeholder="https://" />
                        {cadastroForm.formState.errors.site && <p className="text-xs text-destructive">{cadastroForm.formState.errors.site.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Link Google Maps</label>
                        <Input {...cadastroForm.register("link_google_maps")} placeholder="https://maps.google.com/..." />
                        {cadastroForm.formState.errors.link_google_maps && <p className="text-xs text-destructive">{cadastroForm.formState.errors.link_google_maps.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Localização */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Localização</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Categoria Principal *</label>
                        <Select
                          value={categoriaSelecionada}
                          onValueChange={(v) => {
                            setCategoriaSelecionada(v);
                            cadastroForm.setValue("categoria", v);
                            setSubcategoriasSelecionadas([]);
                            cadastroForm.setValue("subcategorias", []);
                          }}
                        >
                          <SelectTrigger className="w-full"><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {categoriasData.categorias.map(c => (
                              <SelectItem key={c.id} value={c.nome}>
                                {c.icone} {c.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {cadastroForm.formState.errors.categoria && <p className="text-xs text-destructive">{cadastroForm.formState.errors.categoria.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Bairro *</label>
                        <Select value={cadastroForm.watch("bairro")} onValueChange={(v) => cadastroForm.setValue("bairro", v)}>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Selecione o bairro" /></SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {BAIRROS_GUAIRA.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {cadastroForm.formState.errors.bairro && <p className="text-xs text-destructive">{cadastroForm.formState.errors.bairro.message}</p>}
                      </div>
                    </div>

                    {/* Subcategorias */}
                    {categoriaSelecionada && (
                      <div className="space-y-3">
                        <label className="text-xs font-medium">Subcategorias * (escolha de 1 a 3)</label>
                        <div className="grid md:grid-cols-2 gap-3 p-4 border rounded-lg bg-muted/30">
                          {categoriasData.categorias
                            .find(c => c.nome === categoriaSelecionada)
                            ?.subcategorias.map((sub) => {
                              const isSelected = subcategoriasSelecionadas.includes(sub);
                              const canAdd = subcategoriasSelecionadas.length < 3;

                              return (
                                <div
                                  key={sub}
                                  onClick={() => {
                                    if (isSelected) {
                                      const novas = subcategoriasSelecionadas.filter(s => s !== sub);
                                      setSubcategoriasSelecionadas(novas);
                                      cadastroForm.setValue("subcategorias", novas);
                                    } else if (canAdd) {
                                      const novas = [...subcategoriasSelecionadas, sub];
                                      setSubcategoriasSelecionadas(novas);
                                      cadastroForm.setValue("subcategorias", novas);
                                    }
                                  }}
                                  className={`p-3 rounded-md border-2 cursor-pointer transition-all text-sm ${isSelected
                                    ? 'border-primary bg-primary/10 text-primary font-medium'
                                    : canAdd
                                      ? 'border-border hover:border-primary/50 hover:bg-accent/50'
                                      : 'border-border/50 opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                  {sub}
                                  {isSelected && <span className="ml-2 text-primary">✓</span>}
                                </div>
                              );
                            })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {subcategoriasSelecionadas.length} de 3 selecionadas
                          </Badge>
                          {subcategoriasSelecionadas.map(sub => (
                            <Badge key={sub} variant="default" className="gap-1">
                              {sub}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  const novas = subcategoriasSelecionadas.filter(s => s !== sub);
                                  setSubcategoriasSelecionadas(novas);
                                  cadastroForm.setValue("subcategorias", novas);
                                }}
                              />
                            </Badge>
                          ))}
                        </div>
                        {cadastroForm.formState.errors.subcategorias && (
                          <p className="text-xs text-destructive">{cadastroForm.formState.errors.subcategorias.message}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-medium">Endereço Completo *</label>
                      <Input {...cadastroForm.register("endereco")} placeholder="Rua / nº / complemento" />
                      {cadastroForm.formState.errors.endereco && <p className="text-xs text-destructive">{cadastroForm.formState.errors.endereco.message}</p>}
                    </div>
                  </div>

                  {/* Mídia / Descrição */}
                  <div className="space-y-8">
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Mídia & Descrição</h3>
                    <div className="space-y-6">
                      {/* Banner */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium flex items-center gap-2">Banner da Empresa <span className="text-muted-foreground">(largura grande, exibição h-40)</span></label>
                        <div
                          className={`relative rounded-xl border-2 border-dashed overflow-hidden group transition-all cursor-pointer ${dragBanner ? 'border-primary bg-primary/5' : 'border-border/70 hover:border-primary/60 bg-muted/30 hover:bg-accent/30'}`}
                          onDragOver={(e) => { e.preventDefault(); setDragBanner(true); }}
                          onDragLeave={() => setDragBanner(false)}
                          onDrop={(e) => handleDropGeneric(e, 'banner')}
                          onClick={() => document.getElementById('banner-input')?.click()}
                        >
                          <input id="banner-input" type="file" accept="image/*" className="hidden" onChange={handleBannerInput} />
                          {bannerPreview ? (
                            <div className="h-40 w-full relative">
                              <img src={bannerPreview} alt="Banner preview" className="h-full w-full object-cover" />
                              <button type="button" onClick={(e) => { e.stopPropagation(); removeBanner(); }} className="absolute top-2 right-2 bg-background/70 backdrop-blur-sm rounded-full p-2 shadow hover:bg-destructive hover:text-destructive-foreground transition-colors" aria-label="Remover banner">
                                <X className="h-4 w-4" />
                              </button>
                              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/60 to-transparent" />
                            </div>
                          ) : (
                            <div className="h-40 w-full flex flex-col items-center justify-center gap-3">
                              <UploadCloud className="h-8 w-8 text-primary" />
                              <p className="text-xs text-muted-foreground">Arraste ou clique para enviar (JPG/PNG)</p>
                              <p className="text-[10px] text-muted-foreground/70">Ideal ~1200x480 ou similar</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Logo & Descrição */}
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-medium">Descrição *</label>
                          <Textarea {...cadastroForm.register("descricao")} rows={6} placeholder="Fale sobre produtos, diferenciais, horário, formas de pagamento..." />
                          {cadastroForm.formState.errors.descricao && <p className="text-xs text-destructive">{cadastroForm.formState.errors.descricao.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium flex items-center gap-2">Logo <span className="text-muted-foreground">(quadrada)</span></label>
                          <div
                            className={`relative border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${dragLogo ? 'border-primary bg-primary/5' : 'border-border/70 hover:border-primary/60 bg-muted/30 hover:bg-accent/30'}`}
                            onDragOver={(e) => { e.preventDefault(); setDragLogo(true); }}
                            onDragLeave={() => setDragLogo(false)}
                            onDrop={(e) => handleDropGeneric(e, 'logo')}
                            onClick={() => document.getElementById('logo-input')?.click()}
                          >
                            <input id="logo-input" type="file" accept="image/*" className="hidden" onChange={handleLogoInput} />
                            {logoPreview ? (
                              <div className="relative">
                                <img src={logoPreview} alt="Logo preview" className="h-24 w-24 object-cover rounded-md shadow-sm" />
                                <button type="button" onClick={(e) => { e.stopPropagation(); removeLogo(); }} className="absolute -top-2 -right-2 bg-background/80 backdrop-blur-sm rounded-full p-1 shadow hover:bg-destructive hover:text-destructive-foreground" aria-label="Remover logo">
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <ImageIcon className="h-10 w-10 text-primary" />
                                <p className="text-xs text-muted-foreground">PNG/JPG até 2MB</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="secondary">Todos os campos com * são obrigatórios</Badge>
                    {cadastroForm.watch("cnpj") && !isValidCNPJ(cadastroForm.watch("cnpj")) && (
                      <Badge variant="destructive">CNPJ inválido</Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-end gap-3 pt-4">
                    {bannerPreview && <Badge variant="secondary">Banner ok</Badge>}
                    {logoPreview && <Badge variant="secondary">Logo ok</Badge>}
                    <Button type="submit" variant="default" className="gap-2" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                      {loading ? "Enviando..." : "Enviar Cadastro"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {modo === "login" && (
            <Card className="glass-card border-2 max-w-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Login</CardTitle>
                <CardDescription>Informe seu CNPJ e celular usados no cadastro.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form className="space-y-6" onSubmit={loginForm.handleSubmit(handleLogin)}>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">CNPJ *</label>
                    <Input value={loginForm.watch("cnpj")} onChange={(e) => onMaskCNPJ(e, "login")} placeholder="00.000.000/0000-00" />
                    {loginForm.formState.errors.cnpj && <p className="text-xs text-destructive">{loginForm.formState.errors.cnpj.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Celular *</label>
                    <Input value={loginForm.watch("celular")} onChange={(e) => onMaskPhone(e, "celular", "login")} placeholder="(11) 90000-0000" />
                    {loginForm.formState.errors.celular && <p className="text-xs text-destructive">{loginForm.formState.errors.celular.message}</p>}
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="submit" variant="default" className="gap-2" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                      {loading ? "Entrando..." : "Entrar"}
                    </Button>
                  </div>
                </form>
                <p className="text-xs text-muted-foreground">Caso tenha esquecido seus dados, envie uma nova solicitação de cadastro.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SuaEmpresa;
