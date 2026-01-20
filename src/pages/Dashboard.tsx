import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Building2, 
  LogOut, 
  Eye, 
  Edit, 
  Save, 
  X, 
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Globe,
  Loader2
} from "lucide-react";
import { supabase, uploadImagem, buscarCategorias, type Empresa } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import categoriasData from "@/data/categorias-empresas.json";

const Dashboard = () => {
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [subcategoriasSelecionadas, setSubcategoriasSelecionadas] = useState<string[]>([]);

  // Dados editáveis
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [site, setSite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkGoogleMaps, setLinkGoogleMaps] = useState("");

  useEffect(() => {
    verificarAutenticacao();
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    const cats = await buscarCategorias();
    setCategorias(cats.map(c => c.nome));
  };

  const verificarAutenticacao = async () => {
    const auth = localStorage.getItem('empresa_auth');
    
    if (!auth) {
      toast("Acesso negado", { description: "Faça login primeiro" });
      navigate('/sua-empresa');
      return;
    }

    try {
      const { empresaId } = JSON.parse(auth);
      
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', empresaId)
        .single();

      if (error || !data) {
        throw new Error('Empresa não encontrada');
      }

      setEmpresa(data);
      setNome(data.nome);
      setDescricao(data.descricao);
      setSubcategoriasSelecionadas(data.subcategorias || []);
      
      // Debug: verificar subcategorias carregadas
      console.log('📦 Subcategorias carregadas do banco:', data.subcategorias);
      
      // Buscar nome da categoria
      if (data.categoria_id) {
        const { data: catData } = await supabase
          .from('categorias')
          .select('nome')
          .eq('id', data.categoria_id)
          .single();
        setCategoria(catData?.nome || "");
      }
      
      setTelefone(data.telefone || "");
      setWhatsapp(data.whatsapp || "");
      setEmail(data.email || "");
      setSite(data.site || "");
      setInstagram(data.instagram || "");
      setFacebook(data.facebook || "");
      setLinkGoogleMaps(data.link_google_maps || "");
    } catch (error) {
      console.error('Erro ao carregar empresa:', error);
      toast("Erro ao carregar dados", { description: "Tente novamente" });
      localStorage.removeItem('empresa_auth');
      navigate('/sua-empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('empresa_auth');
    toast("Logout realizado", { duration: 1500 });
    navigate('/sua-empresa');
  };

  const handleSalvar = async () => {
    if (!empresa) return;

    setSalvando(true);
    try {
      // Buscar ID da categoria se mudou
      let categoriaId = empresa.categoria_id;
      if (categoria && categoria !== empresa.categoria_id) {
        const { data: catData } = await supabase
          .from('categorias')
          .select('id')
          .eq('nome', categoria)
          .single();
        categoriaId = catData?.id;
      }

      const { error } = await supabase
        .from('empresas')
        .update({
          nome,
          descricao,
          categoria_id: categoriaId,
          subcategorias: subcategoriasSelecionadas,
          telefone,
          whatsapp,
          email,
          site: site || null,
          instagram: instagram || null,
          facebook: facebook || null,
          link_google_maps: linkGoogleMaps || null,
        })
        .eq('id', empresa.id);

      // Debug: verificar o que está sendo salvo
      console.log('💾 Salvando subcategorias:', subcategoriasSelecionadas);

      if (error) throw error;

      toast("Dados atualizados!", { description: "Alterações salvas com sucesso", duration: 2000 });
      setEditando(false);
      
      // Recarregar dados
      verificarAutenticacao();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast("Erro ao salvar", { description: "Tente novamente", duration: 2000 });
    } finally {
      setSalvando(false);
    }
  };

  const handleUploadImagem = async (file: File) => {
    if (!empresa) return;

    try {
      toast("Fazendo upload do banner...", { duration: 1000 });
      
      const url = await uploadImagem('empresas-images', file, `banner-${empresa.id}`);
      
      if (!url) throw new Error('Falha no upload');

      // Substituir o banner (sempre será a primeira posição)
      const novasImagens = [url];

      const { error } = await supabase
        .from('empresas')
        .update({ imagens: novasImagens })
        .eq('id', empresa.id);

      if (error) throw error;

      toast.success("Banner atualizado!");
      setEmpresa({ ...empresa, imagens: novasImagens });
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error("Erro ao enviar banner");
    }
  };

  const handleUploadLogo = async (file: File) => {
    console.log('📸 handleUploadLogo chamado', { file, empresa });
    
    if (!empresa) {
      console.error('❌ Empresa não encontrada');
      return;
    }

    try {
      console.log('⬆️ Iniciando upload da logo...');
      toast("Fazendo upload da logo...", { duration: 1000 });
      
      const url = await uploadImagem('empresas-images', file, `logo-${empresa.id}`);
      console.log('✅ URL retornada:', url);
      
      if (!url) throw new Error('Falha no upload');

      console.log('💾 Atualizando database...');
      const { error } = await supabase
        .from('empresas')
        .update({ logo: url })
        .eq('id', empresa.id);

      if (error) throw error;

      console.log('✅ Logo salva com sucesso!');
      toast.success("Logo atualizada com sucesso!");
      setEmpresa({ ...empresa, logo: url });
    } catch (error) {
      console.error('❌ Erro no upload da logo:', error);
      toast.error("Erro ao enviar logo");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Aprovado</Badge>;
      case 'pendente':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
      case 'rejeitado':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground">Carregando dashboard...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!empresa) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-6">
        {/* Header do Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">Gerencie as informações da sua empresa</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2 w-full sm:w-auto">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        {/* Status da Empresa */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-xl">{empresa.nome}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  {empresa.endereco}, {empresa.bairro}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(empresa.status)}
                {empresa.verificado && <Badge variant="secondary">Verificado</Badge>}
                {empresa.destaque && <Badge className="bg-yellow-500">Destaque</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Visualizações
                </p>
                <p className="text-2xl font-bold">{empresa.visualizacoes || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Categoria</p>
                <Badge variant="outline">{empresa.categoria_id || 'Não definida'}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Cadastro</p>
                <p className="text-sm">{new Date(empresa.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Atualização</p>
                <p className="text-sm">{new Date(empresa.updated_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Gerenciamento */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full sm:w-auto grid-cols-2 sm:flex">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="imagens">Imagens</TabsTrigger>
          </TabsList>

          {/* Aba de Informações */}
          <TabsContent value="info" className="space-y-6">
            <Card className="border-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Dados da Empresa</CardTitle>
                  {!editando ? (
                    <Button variant="outline" size="sm" onClick={() => setEditando(true)} className="gap-2">
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditando(false)} className="gap-2">
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                      <Button variant="default" size="sm" onClick={handleSalvar} disabled={salvando} className="gap-2">
                        {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Salvar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nome */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nome da Empresa</Label>
                  {editando ? (
                    <Input 
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Nome da empresa"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{nome}</p>
                  )}
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Descrição</Label>
                  {editando ? (
                    <Textarea 
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      rows={5}
                      className="resize-none"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground leading-relaxed">{descricao}</p>
                  )}
                </div>

                {/* Categoria */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Categoria</Label>
                  {editando ? (
                    <Select value={categoria} onValueChange={(v) => {
                      setCategoria(v);
                      setSubcategoriasSelecionadas([]);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {categoriasData.categorias.map((cat) => (
                          <SelectItem key={cat.id} value={cat.nome}>
                            {cat.icone} {cat.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">{categoria || 'Não definida'}</p>
                  )}
                </div>

                {/* Subcategorias */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Subcategorias (até 3)</Label>
                  {editando && categoria ? (
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-3 p-4 border rounded-lg bg-muted/30 max-h-[400px] overflow-y-auto">
                        {categoriasData.categorias
                          .find(c => c.nome === categoria)
                          ?.subcategorias.map((sub) => {
                            const isSelected = subcategoriasSelecionadas.includes(sub);
                            const canAdd = subcategoriasSelecionadas.length < 3;
                            
                            return (
                              <div
                                key={sub}
                                onClick={() => {
                                  if (isSelected) {
                                    setSubcategoriasSelecionadas(subcategoriasSelecionadas.filter(s => s !== sub));
                                  } else if (canAdd) {
                                    setSubcategoriasSelecionadas([...subcategoriasSelecionadas, sub]);
                                  }
                                }}
                                className={`p-3 rounded-md border-2 cursor-pointer transition-all text-sm ${
                                  isSelected 
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
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {subcategoriasSelecionadas.length} de 3 selecionadas
                        </Badge>
                        {subcategoriasSelecionadas.map(sub => (
                          <Badge key={sub} variant="default" className="gap-1">
                            {sub}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => setSubcategoriasSelecionadas(subcategoriasSelecionadas.filter(s => s !== sub))}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {subcategoriasSelecionadas.length > 0 ? (
                        subcategoriasSelecionadas.map(sub => (
                          <Badge key={sub} variant="secondary">{sub}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhuma subcategoria selecionada</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Contatos */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      Telefone
                    </label>
                    {editando ? (
                      <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} />
                    ) : (
                      <p className="text-sm text-muted-foreground">{telefone || "Não informado"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      WhatsApp
                    </label>
                    {editando ? (
                      <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                    ) : (
                      <p className="text-sm text-muted-foreground">{whatsapp || "Não informado"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Email
                    </label>
                    {editando ? (
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    ) : (
                      <p className="text-sm text-muted-foreground">{email || "Não informado"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      Site
                    </label>
                    {editando ? (
                      <Input value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://" />
                    ) : (
                      <p className="text-sm text-muted-foreground">{site || "Não informado"}</p>
                    )}
                  </div>
                </div>

                {/* Redes Sociais */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Instagram</label>
                    {editando ? (
                      <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@usuario" />
                    ) : (
                      <p className="text-sm text-muted-foreground">{instagram || "Não informado"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Facebook</label>
                    {editando ? (
                      <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="@pagina" />
                    ) : (
                      <p className="text-sm text-muted-foreground">{facebook || "Não informado"}</p>
                    )}
                  </div>
                </div>

                {/* Google Maps */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Link Google Maps
                  </label>
                  {editando ? (
                    <Input value={linkGoogleMaps} onChange={(e) => setLinkGoogleMaps(e.target.value)} placeholder="https://maps.google.com/..." />
                  ) : (
                    <p className="text-sm text-muted-foreground">{linkGoogleMaps || "Não informado"}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Imagens */}
          <TabsContent value="imagens" className="space-y-6">
            {/* Logo */}
            <Card className="border-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Logo da Empresa</CardTitle>
                <CardDescription>Imagem que representa sua marca</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {empresa.logo ? (
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group">
                      <img 
                        src={empresa.logo} 
                        alt="Logo da empresa"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-primary/20"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Badge variant="secondary">Logo Atual</Badge>
                      </div>
                    </div>
                    <div className="space-y-3 flex-1 text-center sm:text-left">
                      <p className="text-sm text-muted-foreground">Logo configurada com sucesso</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          console.log('📁 Input onChange:', e.target.files);
                          if (e.target.files?.[0]) {
                            handleUploadLogo(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                        id="upload-logo"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('upload-logo')?.click()}
                      >
                        Alterar Logo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4 hover:border-primary/60 transition-colors">
                    <Building2 className="h-12 w-12 text-primary mx-auto" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Adicionar logo</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG até 5MB (recomendado: 400x400px)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        console.log('📁 Input onChange (sem logo):', e.target.files);
                        if (e.target.files?.[0]) {
                          handleUploadLogo(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      id="upload-logo"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('upload-logo')?.click()}
                    >
                      Selecionar Logo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Banner */}
            <Card className="border-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Banner da Empresa</CardTitle>
                <CardDescription>Imagem de destaque que aparece no topo do seu perfil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {empresa.imagens && empresa.imagens.length > 0 ? (
                  <>
                    {/* Banner Atual */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Banner Atual</Label>
                        <Badge variant="secondary">Ativo</Badge>
                      </div>
                      <div className="relative group rounded-xl overflow-hidden border-2 border-primary/20">
                        <img 
                          src={empresa.imagens[0]} 
                          alt="Banner da empresa"
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                            <span className="text-white text-sm font-medium">Banner de Destaque</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botão Trocar Banner */}
                    <div className="border-2 border-dashed rounded-lg p-4 text-center space-y-3 hover:border-primary/60 hover:bg-accent/30 transition-all cursor-pointer"
                      onClick={() => document.getElementById('upload-imagem')?.click()}
                    >
                      <Upload className="h-8 w-8 text-primary mx-auto" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Trocar Banner</p>
                        <p className="text-xs text-muted-foreground">
                          Clique para selecionar uma nova imagem
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleUploadImagem(e.target.files[0])}
                        className="hidden"
                        id="upload-imagem"
                      />
                    </div>
                  </>
                ) : (
                  /* Sem Banner - Upload Inicial */
                  <div className="border-2 border-dashed rounded-xl p-12 text-center space-y-4 hover:border-primary/60 hover:bg-accent/20 transition-all">
                    <div className="space-y-3">
                      <Upload className="h-16 w-16 text-primary mx-auto" />
                      <div className="space-y-2">
                        <p className="text-lg font-semibold">Adicione o banner da sua empresa</p>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          Mostre seu estabelecimento! Esta imagem aparecerá como destaque no seu perfil.
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleUploadImagem(e.target.files[0])}
                      className="hidden"
                      id="upload-imagem"
                    />
                    <Button 
                      variant="default"
                      size="lg"
                      onClick={() => document.getElementById('upload-imagem')?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-5 w-5" />
                      Adicionar Banner
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG até 5MB (recomendado: 1200x400px)</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
