import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  PlusCircle, 
  MapPin, 
  Calendar, 
  Phone, 
  Heart, 
  AlertCircle, 
  CheckCircle,
  Dog,
  Cat,
  ArrowLeft, 
  Home, 
  Loader2, 
  X, 
  ImagePlus,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase, getUsuarioLogado, uploadImagens } from "@/lib/supabase";
import { LoginDialog } from "@/components/LoginDialog";

interface Pet {
  id: string;
  nome: string;
  tipo: "cachorro" | "gato" | "outro";
  raca?: string;
  cor: string;
  porte?: "pequeno" | "medio" | "grande";
  idade_aproximada?: string;
  descricao: string;
  categoria: "perdido" | "encontrado" | "adocao";
  status: "ativo" | "resolvido";
  bairro: string;
  local_referencia?: string;
  data_ocorrencia: string;
  telefone_contato: string;
  whatsapp_contato?: string;
  nome_contato: string;
  caracteristicas_especiais?: string;
  imagem?: string;
  user_id: string;
  criado_em: string;
  users?: {
    nome: string;
  };
}

const tiposPet = [
  { value: "cachorro", label: "🐕 Cachorro", icon: Dog },
  { value: "gato", label: "🐱 Gato", icon: Cat },
  { value: "outro", label: "🐾 Outro", icon: Heart }
];

const portes = ["pequeno", "medio", "grande"];
const cores = [
  "Preto", "Branco", "Marrom", "Caramelo", "Cinza", 
  "Rajado", "Malhado", "Tricolor", "Dourado", "Outro"
];

export default function PetsPerdidos() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("ativo");

  // Formulário
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<"cachorro" | "gato" | "outro">("cachorro");
  const [raca, setRaca] = useState("");
  const [cor, setCor] = useState("");
  const [porte, setPorte] = useState<string>("");
  const [idadeAproximada, setIdadeAproximada] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<"perdido" | "encontrado" | "adocao">("perdido");
  const [bairro, setBairro] = useState("");
  const [localReferencia, setLocalReferencia] = useState("");
  const [dataOcorrencia, setDataOcorrencia] = useState("");
  const [telefoneContato, setTelefoneContato] = useState("");
  const [whatsappContato, setWhatsappContato] = useState("");
  const [nomeContato, setNomeContato] = useState("");
  const [caracteristicasEspeciais, setCaracteristicasEspeciais] = useState("");
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string>("");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    carregarUsuario();
    carregarPets();
  }, []);

  const carregarUsuario = async () => {
    const usuarioLogado = await getUsuarioLogado();
    setUser(usuarioLogado);
  };

  const carregarPets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pets_perdidos')
        .select(`
          *,
          users!user_id(nome)
        `)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Erro ao carregar pets:', error);
      toast.error("Erro ao carregar pets");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 5MB");
        return;
      }
      setImagemFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagemPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const limparFormulario = () => {
    setNome("");
    setTipo("cachorro");
    setRaca("");
    setCor("");
    setPorte("");
    setIdadeAproximada("");
    setDescricao("");
    setCategoria("perdido");
    setBairro("");
    setLocalReferencia("");
    setDataOcorrencia("");
    setTelefoneContato("");
    setWhatsappContato("");
    setNomeContato("");
    setCaracteristicasEspeciais("");
    setImagemFile(null);
    setImagemPreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    if (!nome || !tipo || !cor || !descricao || !bairro || !dataOcorrencia || !telefoneContato || !nomeContato) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setSubmitting(true);

    try {
      let imagemUrl = null;

      if (imagemFile) {
        const urls = imagemFile ? await uploadImagens('posts-images', [imagemFile], 'pets') : [];
        imagemUrl = urls[0];
      }

      const { error } = await supabase
        .from('pets_perdidos')
        .insert({
          nome,
          tipo,
          raca: raca || null,
          cor,
          porte: porte || null,
          idade_aproximada: idadeAproximada || null,
          descricao,
          categoria,
          status: 'ativo',
          bairro,
          local_referencia: localReferencia || null,
          data_ocorrencia: dataOcorrencia,
          telefone_contato: telefoneContato,
          whatsapp_contato: whatsappContato || null,
          nome_contato: nomeContato,
          caracteristicas_especiais: caracteristicasEspeciais || null,
          imagem: imagemUrl,
          user_id: user.id
        });

      if (error) throw error;

      const mensagem = categoria === "perdido" ? "Pet perdido cadastrado!" :
                      categoria === "encontrado" ? "Pet encontrado cadastrado!" :
                      "Pet disponível para adoção cadastrado!";
      
      toast.success(mensagem);
      limparFormulario();
      setOpenDialog(false);
      carregarPets();
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      toast.error("Erro ao cadastrar pet");
    } finally {
      setSubmitting(false);
    }
  };

  const marcarComoResolvido = async (petId: string) => {
    try {
      const { error } = await supabase
        .from('pets_perdidos')
        .update({ status: 'resolvido' })
        .eq('id', petId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success("Pet marcado como resolvido!");
      carregarPets();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error("Erro ao atualizar status");
    }
  };

  const petsFiltrados = pets.filter(pet => {
    const matchBusca = pet.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       pet.descricao.toLowerCase().includes(busca.toLowerCase()) ||
                       pet.bairro.toLowerCase().includes(busca.toLowerCase()) ||
                       (pet.raca && pet.raca.toLowerCase().includes(busca.toLowerCase()));
    const matchCategoria = filtroCategoria === "todos" || pet.categoria === filtroCategoria;
    const matchTipo = filtroTipo === "todos" || pet.tipo === filtroTipo;
    const matchStatus = filtroStatus === "todos" || pet.status === filtroStatus;

    return matchBusca && matchCategoria && matchTipo && matchStatus;
  });

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getCategoriaBadge = (categoria: string) => {
    switch(categoria) {
      case "perdido":
        return { color: "bg-red-600", icon: AlertCircle, text: "Perdido" };
      case "encontrado":
        return { color: "bg-green-600", icon: CheckCircle, text: "Encontrado" };
      case "adocao":
        return { color: "bg-blue-600", icon: Heart, text: "Adoção" };
      default:
        return { color: "bg-gray-600", icon: Heart, text: categoria };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 space-y-8">
        {/* Botões de Navegação */}
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(-1)}
            className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="gap-2 bg-green-500 hover:bg-green-600 text-white"
          >
            <Home className="w-4 h-4" />
            Página Inicial
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
              <Heart className="w-10 h-10 text-primary" />
              Pets Perdidos e Adoção
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Ajude a reunir pets com suas famílias ou encontre um novo amigo para adotar.
            </p>
          </div>
          
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button variant="animated" className="gap-2">
                <PlusCircle className="w-5 h-5" />
                Cadastrar Pet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Cadastrar Pet
                </DialogTitle>
                <DialogDescription>
                  {user ? (
                    <>Preencha os dados do pet. Quanto mais informações, melhor!</>
                  ) : (
                    <>Você precisa estar logado para cadastrar pets.</>
                  )}
                </DialogDescription>
              </DialogHeader>

              {!user ? (
                <div className="py-8 text-center">
                  <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Categoria */}
                  <div className="space-y-2">
                    <Label>Categoria *</Label>
                    <Select value={categoria} onValueChange={(value: "perdido" | "encontrado" | "adocao") => setCategoria(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="perdido">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            Meu pet está perdido
                          </div>
                        </SelectItem>
                        <SelectItem value="encontrado">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Encontrei um pet
                          </div>
                        </SelectItem>
                        <SelectItem value="adocao">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-blue-500" />
                            Pet para adoção
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Nome */}
                    <div className="space-y-2">
                      <Label>Nome do Pet *</Label>
                      <Input
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Rex, Mimi"
                        required
                      />
                    </div>

                    {/* Tipo */}
                    <div className="space-y-2">
                      <Label>Tipo *</Label>
                      <Select value={tipo} onValueChange={(value: "cachorro" | "gato" | "outro") => setTipo(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposPet.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Raça */}
                    <div className="space-y-2">
                      <Label>Raça</Label>
                      <Input
                        value={raca}
                        onChange={(e) => setRaca(e.target.value)}
                        placeholder="Ex: Vira-lata, SRD"
                      />
                    </div>

                    {/* Cor */}
                    <div className="space-y-2">
                      <Label>Cor *</Label>
                      <Select value={cor} onValueChange={setCor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {cores.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Porte */}
                    <div className="space-y-2">
                      <Label>Porte</Label>
                      <Select value={porte} onValueChange={setPorte}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pequeno">Pequeno</SelectItem>
                          <SelectItem value="medio">Médio</SelectItem>
                          <SelectItem value="grande">Grande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Idade */}
                  <div className="space-y-2">
                    <Label>Idade Aproximada</Label>
                    <Input
                      value={idadeAproximada}
                      onChange={(e) => setIdadeAproximada(e.target.value)}
                      placeholder="Ex: 2 anos, 6 meses, filhote"
                    />
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label>Descrição *</Label>
                    <Textarea
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Descreva o pet, comportamento, onde foi visto..."
                      rows={3}
                      required
                    />
                  </div>

                  {/* Características Especiais */}
                  <div className="space-y-2">
                    <Label>Características Especiais</Label>
                    <Textarea
                      value={caracteristicasEspeciais}
                      onChange={(e) => setCaracteristicasEspeciais(e.target.value)}
                      placeholder="Coleira, manchas, cicatrizes, comportamento único..."
                      rows={2}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Bairro */}
                    <div className="space-y-2">
                      <Label>Bairro *</Label>
                      <Input
                        value={bairro}
                        onChange={(e) => setBairro(e.target.value)}
                        placeholder="Ex: Centro"
                        required
                      />
                    </div>

                    {/* Local de Referência */}
                    <div className="space-y-2">
                      <Label>Local de Referência</Label>
                      <Input
                        value={localReferencia}
                        onChange={(e) => setLocalReferencia(e.target.value)}
                        placeholder="Ex: Próximo à praça"
                      />
                    </div>
                  </div>

                  {/* Data */}
                  <div className="space-y-2">
                    <Label>Data {categoria === "adocao" ? "do Anúncio" : "da Ocorrência"} *</Label>
                    <Input
                      type="date"
                      value={dataOcorrencia}
                      onChange={(e) => setDataOcorrencia(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Nome para Contato */}
                    <div className="space-y-2">
                      <Label>Seu Nome *</Label>
                      <Input
                        value={nomeContato}
                        onChange={(e) => setNomeContato(e.target.value)}
                        placeholder="Nome completo"
                        required
                      />
                    </div>

                    {/* Telefone */}
                    <div className="space-y-2">
                      <Label>Telefone *</Label>
                      <Input
                        value={telefoneContato}
                        onChange={(e) => setTelefoneContato(e.target.value)}
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-2">
                      <Label>WhatsApp</Label>
                      <Input
                        value={whatsappContato}
                        onChange={(e) => setWhatsappContato(e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  {/* Upload de Imagem */}
                  <div className="space-y-2">
                    <Label>Foto do Pet (Recomendado)</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('pet-image-upload')?.click()}
                        className="gap-2"
                      >
                        <ImagePlus className="w-4 h-4" />
                        Escolher Foto
                      </Button>
                      <input
                        id="pet-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      {imagemPreview && (
                        <div className="relative">
                          <img src={imagemPreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 w-6 h-6"
                            onClick={() => {
                              setImagemFile(null);
                              setImagemPreview("");
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Cadastrando...
                        </>
                      ) : (
                        'Cadastrar'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Filtros de Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Nome, raça, local..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="perdido">Perdidos</SelectItem>
                    <SelectItem value="encontrado">Encontrados</SelectItem>
                    <SelectItem value="adocao">Adoção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Animal</Label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="cachorro">Cachorros</SelectItem>
                    <SelectItem value="gato">Gatos</SelectItem>
                    <SelectItem value="outro">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="resolvido">Resolvidos</SelectItem>
                    <SelectItem value="todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Carregando pets...</span>
          </div>
        ) : petsFiltrados.length === 0 ? (
          <Card className="py-20 text-center">
            <CardContent>
              <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum pet encontrado</h3>
              <p className="text-muted-foreground">
                {busca || filtroCategoria !== "todos" || filtroTipo !== "todos"
                  ? "Tente ajustar os filtros de busca"
                  : "Seja o primeiro a cadastrar um pet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {petsFiltrados.map((pet) => {
              const badge = getCategoriaBadge(pet.categoria);
              const IconeTipo = tiposPet.find(t => t.value === pet.tipo)?.icon || Heart;
              
              return (
                <Card key={pet.id} className="hover:shadow-xl transition-all overflow-hidden">
                  {pet.imagem ? (
                    <div className="relative w-full h-56 overflow-hidden">
                      <img
                        src={pet.imagem}
                        alt={pet.nome}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className={`${badge.color} text-white`}>
                          <badge.icon className="w-3 h-3 mr-1" />
                          {badge.text}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-56 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <IconeTipo className="w-24 h-24 text-muted-foreground/30" />
                      <div className="absolute top-3 right-3">
                        <Badge className={`${badge.color} text-white`}>
                          <badge.icon className="w-3 h-3 mr-1" />
                          {badge.text}
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <IconeTipo className="w-5 h-5" />
                        {pet.nome}
                      </CardTitle>
                    </div>
                    {pet.raca && (
                      <p className="text-sm text-muted-foreground">{pet.raca}</p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{pet.cor}</Badge>
                      {pet.porte && <Badge variant="secondary">Porte {pet.porte}</Badge>}
                      {pet.idade_aproximada && <Badge variant="secondary">{pet.idade_aproximada}</Badge>}
                    </div>

                    <CardDescription className="line-clamp-2">{pet.descricao}</CardDescription>

                    {pet.caracteristicas_especiais && (
                      <div className="text-sm bg-yellow-50 border border-yellow-200 rounded p-2">
                        <p className="font-semibold text-yellow-800 text-xs mb-1">Características:</p>
                        <p className="text-yellow-700 text-xs">{pet.caracteristicas_especiais}</p>
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{pet.bairro}</span>
                        {pet.local_referencia && <span className="text-xs">• {pet.local_referencia}</span>}
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{formatarData(pet.data_ocorrencia)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                        <a href={`tel:${pet.telefone_contato}`} className="text-primary hover:underline text-sm">
                          {pet.telefone_contato}
                        </a>
                      </div>
                      
                      {pet.whatsapp_contato && (
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <a 
                            href={`https://wa.me/55${pet.whatsapp_contato.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline text-sm"
                          >
                            WhatsApp
                          </a>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        Contato: {pet.nome_contato}
                      </div>
                    </div>

                    {pet.status === "resolvido" && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 w-full justify-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolvido
                      </Badge>
                    )}

                    {user?.id === pet.user_id && pet.status === "ativo" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => marcarComoResolvido(pet.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar como Resolvido
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
