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
  MessageCircle,
  Sparkles,
  User,
  PawPrint
} from "lucide-react";
import { toast } from "sonner";
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
  { value: "outro", label: "🐾 Outro", icon: PawPrint }
];

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
    // setUser(usuarioLogado);
  };

  const carregarPets = async () => {
    setLoading(true);
    // Dados serão carregados de uma fonte externa futuramente
    setLoading(false);
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
    toast.info("Funcionalidade em desenvolvimento");
  };

  const marcarComoResolvido = async (petId: string) => {
    toast.info("Funcionalidade em desenvolvimento");
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

  const getCategoriaInfo = (categoria: string) => {
    switch (categoria) {
      case "perdido":
        return { color: "bg-red-500", icon: AlertCircle, text: "Perdido" };
      case "encontrado":
        return { color: "bg-green-500", icon: CheckCircle, text: "Encontrado" };
      case "adocao":
        return { color: "bg-blue-500", icon: Heart, text: "Adoção" };
      default:
        return { color: "bg-gray-500", icon: Heart, text: categoria };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow">
        {/* Premium Hero Section */}
        <section className="relative pt-12 pb-20 overflow-hidden bg-background border-b border-border/50">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />

          <div className="container mx-auto px-4 relative z-10">
            {/* Navegação */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
              <div className="flex gap-2">
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

            </div>

            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-2">
                <PawPrint className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Pets Perdidos e <br />
                <span className="gradient-text">Adoção</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                Ajude a reunir pets com suas famílias ou encontre um novo melhor amigo para adotar em Guaíra-SP.
              </p>
            </div>

            <div className="flex justify-center">
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button size="lg" className="rounded-xl px-8 py-7 bg-primary hover:bg-primary/90 text-lg font-bold gap-2">
                    <PlusCircle className="w-6 h-6" />
                    Cadastrar Pet
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                      <PawPrint className="w-6 h-6 text-primary" />
                      Novo Cadastro de Pet
                    </DialogTitle>
                    <DialogDescription className="font-medium">
                      {user ? "Preencha as informações do animalzinho. Fotos ajudam muito!" : "Acesse sua conta para publicar."}
                    </DialogDescription>
                  </DialogHeader>

                  {!user ? (
                    <div className="py-8 text-center bg-gray-50 rounded-2xl">
                      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                      <div className="space-y-2">
                        <Label className="font-bold">Categoria do Anúncio *</Label>
                        <Select value={categoria} onValueChange={(value: "perdido" | "encontrado" | "adocao") => setCategoria(value)}>
                          <SelectTrigger className="py-6 rounded-xl border-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="perdido" className="py-3">
                              <div className="flex items-center gap-2 font-bold text-red-600">
                                <AlertCircle className="w-4 h-4" /> Meu pet está perdido
                              </div>
                            </SelectItem>
                            <SelectItem value="encontrado" className="py-3">
                              <div className="flex items-center gap-2 font-bold text-green-600">
                                <CheckCircle className="w-4 h-4" /> Encontrei um pet
                              </div>
                            </SelectItem>
                            <SelectItem value="adocao" className="py-3">
                              <div className="flex items-center gap-2 font-bold text-blue-600">
                                <Heart className="w-4 h-4" /> Pet para adoção
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold">Nome do Pet (ou apelido) *</Label>
                          <Input
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: Rex, Mel, Pipoca"
                            className="py-6 rounded-xl border-2"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold">Espécie *</Label>
                          <Select value={tipo} onValueChange={(value: "cachorro" | "gato" | "outro") => setTipo(value)}>
                            <SelectTrigger className="py-6 rounded-xl border-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {tiposPet.map(t => (
                                <SelectItem key={t.value} value={t.value} className="py-2.5">
                                  <span className="flex items-center gap-2">{t.label}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold">Raça</Label>
                          <Input
                            value={raca}
                            onChange={(e) => setRaca(e.target.value)}
                            placeholder="Ex: Labrador, SRD"
                            className="py-6 rounded-xl border-2"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold">Cor Dominante *</Label>
                          <Select value={cor} onValueChange={setCor}>
                            <SelectTrigger className="py-6 rounded-xl border-2">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {cores.map(c => (
                                <SelectItem key={c} value={c} className="py-2">{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold">Porte</Label>
                          <Select value={porte} onValueChange={setPorte}>
                            <SelectTrigger className="py-6 rounded-xl border-2">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="pequeno">Pequeno</SelectItem>
                              <SelectItem value="medio">Médio</SelectItem>
                              <SelectItem value="grande">Grande</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold">Descrição e Comportamento *</Label>
                        <Textarea
                          value={descricao}
                          onChange={(e) => setDescricao(e.target.value)}
                          placeholder="Descreva detalhes que ajudem a identificar, temperamento, etc."
                          rows={3}
                          className="rounded-xl border-2 p-4"
                          required
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold">Bairro *</Label>
                          <Input
                            value={bairro}
                            onChange={(e) => setBairro(e.target.value)}
                            placeholder="Onde foi visto pela última vez?"
                            className="py-6 rounded-xl border-2"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold">Data da Ocorrência *</Label>
                          <Input
                            type="date"
                            value={dataOcorrencia}
                            onChange={(e) => setDataOcorrencia(e.target.value)}
                            className="py-6 rounded-xl border-2"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold">Seu Nome *</Label>
                          <Input
                            value={nomeContato}
                            onChange={(e) => setNomeContato(e.target.value)}
                            placeholder="Responsável"
                            className="py-6 rounded-xl border-2"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">Telefone *</Label>
                          <Input
                            value={telefoneContato}
                            onChange={(e) => setTelefoneContato(e.target.value)}
                            placeholder="Fixo ou Celular"
                            className="py-6 rounded-xl border-2"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">WhatsApp</Label>
                          <Input
                            value={whatsappContato}
                            onChange={(e) => setWhatsappContato(e.target.value)}
                            placeholder="WhatsApp"
                            className="py-6 rounded-xl border-2"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold">Foto do Pet (Imprescindível)</Label>
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('pet-image-upload')?.click()}
                            className="gap-2 py-8 px-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary transition-colors"
                          >
                            <ImagePlus className="w-5 h-5" />
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
                            <div className="relative group">
                              <img src={imagemPreview} alt="Preview" className="w-24 h-24 object-cover rounded-2xl border-2 border-primary/20 shadow-lg" />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 w-7 h-7 rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform"
                                onClick={() => { setImagemFile(null); setImagemPreview(""); }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <DialogFooter className="pt-6">
                        <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)} className="rounded-xl font-bold">
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting} className="rounded-xl px-12 font-bold py-6 h-auto">
                          {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publicando...</> : 'Publicar Anúncio'}
                        </Button>
                      </DialogFooter>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        {/* Filtros e Resultados */}
        <section className="container mx-auto px-4 py-8 space-y-12">
          {/* Barra de Filtros Premium */}
          <Card className="bg-card border border-border/50 shadow-xl rounded-[2.5rem] p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest pl-1">Busca Rápida</Label>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors w-4 h-4" />
                  <Input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Nome, raça ou local..."
                    className="pl-10 py-5 rounded-xl border-border/50 focus:border-primary transition-all bg-muted/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest pl-1">Categoria</Label>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="py-5 rounded-xl border-border/50 font-bold bg-muted/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-medium">
                    <SelectItem value="todos">Todos (Perdidos/Adoção)</SelectItem>
                    <SelectItem value="perdido">Apenas Perdidos</SelectItem>
                    <SelectItem value="encontrado">Apenas Encontrados</SelectItem>
                    <SelectItem value="adocao">Apenas Adoção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest pl-1">Espécie</Label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="py-5 rounded-xl border-border/50 font-bold bg-muted/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-medium">
                    <SelectItem value="todos">Todas Espécies</SelectItem>
                    <SelectItem value="cachorro">Cachorros</SelectItem>
                    <SelectItem value="gato">Gatos</SelectItem>
                    <SelectItem value="outro">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest pl-1">Status</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="py-5 rounded-xl border-border/50 font-bold bg-muted/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-medium">
                    <SelectItem value="ativo">Apenas Ativos</SelectItem>
                    <SelectItem value="resolvido">Apenas Resolvidos</SelectItem>
                    <SelectItem value="todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Listagem de Resultados */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <Loader2 className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground font-bold">Procurando pets...</p>
            </div>
          ) : petsFiltrados.length === 0 ? (
            <div className="text-center py-24 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-border/50 flex flex-col items-center gap-4">
              <PawPrint className="w-20 h-20 text-muted-foreground/30" />
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground">Nenhum pet localizado</h3>
                <p className="text-muted-foreground font-medium">Tente ajustar seus filtros ou publique um novo anúncio.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {petsFiltrados.map((pet) => {
                const info = getCategoriaInfo(pet.categoria);
                const IconeTipo = tiposPet.find(t => t.value === pet.tipo)?.icon || PawPrint;

                return (
                  <Card key={pet.id} className="group bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl p-0 flex flex-col rounded-[2rem]">
                    {/* Imagem */}
                    <div className="relative h-72 overflow-hidden bg-muted/20">
                      {pet.imagem ? (
                        <img
                          src={pet.imagem}
                          alt={pet.nome}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="relative w-full h-full bg-gradient-to-br from-muted/20 to-muted flex items-center justify-center">
                          <IconeTipo className="w-24 h-24 text-muted-foreground/30" />
                        </div>
                      )}

                      {/* Floating Badge */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        <Badge className={`${info.color} text-white px-4 py-1.5 rounded-xl border-none font-black text-[10px] uppercase shadow-lg`}>
                          <info.icon className="w-3 h-3 mr-1.5" />
                          {info.text}
                        </Badge>
                        {pet.status === "resolvido" && (
                          <Badge className="bg-blue-600 text-white px-4 py-1.5 rounded-xl border-none font-black text-[10px] uppercase shadow-lg">
                            <CheckCircle className="w-3 h-3 mr-1.5" /> Resolvido
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="p-6 flex-grow flex flex-col gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 p-2 bg-muted rounded-lg">
                            <IconeTipo className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black text-muted-foreground border-l border-border pl-2 uppercase tracking-widest leading-none">{pet.tipo}</span>
                          </div>
                        </div>
                        <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors mt-2">{pet.nome}</h3>
                        {pet.raca && <p className="text-sm font-bold text-primary/70">{pet.raca}</p>}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-muted text-muted-foreground font-bold border-none">{pet.cor}</Badge>
                        {pet.porte && <Badge variant="secondary" className="bg-muted text-muted-foreground font-bold border-none">Porte {pet.porte}</Badge>}
                      </div>

                      <p className="text-sm text-muted-foreground font-medium line-clamp-2 italic leading-relaxed">
                        "{pet.descricao}"
                      </p>

                      <div className="mt-auto space-y-4">
                        <div className="space-y-2 pt-4 border-t border-border/50 text-sm font-bold text-foreground">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                              <MapPin className="w-4 h-4 text-primary" />
                            </div>
                            <span className="truncate">{pet.bairro} {pet.local_referencia && <span className="text-muted-foreground font-medium">• {pet.local_referencia}</span>}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                              <Calendar className="w-4 h-4 text-primary" />
                            </div>
                            <span>{formatarData(pet.data_ocorrencia)}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {pet.telefone_contato && (
                            <Button
                              variant="outline"
                              className="rounded-xl border-2 font-black text-xs py-6 h-auto transition-all active:scale-95"
                              onClick={() => window.location.href = `tel:${pet.telefone_contato}`}
                            >
                              <Phone className="w-4 h-4 mr-2 text-primary" />
                              LIGAR
                            </Button>
                          )}
                          {pet.whatsapp_contato && (
                            <Button
                              className="bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-xs py-6 h-auto shadow-lg shadow-green-100 transition-all active:scale-95"
                              onClick={() => window.open(`https://wa.me/55${pet.whatsapp_contato?.replace(/\D/g, '')}`, '_blank')}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              ZAP
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3 h-3" /> Por: {pet.users?.nome || 'Comunidade'}
                          </span>
                        </div>

                        {user?.id === pet.user_id && pet.status === "ativo" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full rounded-xl py-5 font-bold border-none transition-all gap-2"
                            onClick={() => marcarComoResolvido(pet.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Marcar como Resolvido
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
