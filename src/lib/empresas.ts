export interface Empresa {
  id: string;
  nome: string;
  categoria: string;
  bairro: string;
  descricao: string;
  imagens: string[];
  lat: number;
  lng: number;
  telefone?: string;
  whatsapp?: string; // número no formato internacional para link wa.me
  email?: string;
  site?: string;
  endereco?: string;
}

export const EMPRESAS: Empresa[] = [
  {
    id: "1",
    nome: "Supermercado Central",
    categoria: "Supermercado",
    bairro: "Centro",
    descricao: "Produtos variados, hortifruti fresco e açougue completo.",
    imagens: ["https://images.unsplash.com/photo-1583912268184-0403e937d925?q=80&w=800"],
    lat: -20.3192,
    lng: -48.3105,
    telefone: "(17) 3333-1000",
    whatsapp: "+5517999991000",
    email: "contato@supercentral.com.br",
    site: "https://supercentral.example.com",
    endereco: "Av. Principal, 120 - Centro",
  },
  {
    id: "2",
    nome: "Farmácia Bem Viver",
    categoria: "Farmácia",
    bairro: "Vila Aparecida",
    descricao: "Medicamentos, perfumaria e atendimento personalizado.",
    imagens: ["https://images.unsplash.com/photo-1584824486509-10d9a6a3bba3?q=80&w=800"],
    lat: -20.3178,
    lng: -48.3142,
    telefone: "(17) 3333-4555",
    whatsapp: "+5517988884555",
    email: "bemviver@farmacias.com",
    site: "https://bemviver.example.com",
    endereco: "Rua das Palmeiras, 45 - Vila Aparecida",
  },
  {
    id: "3",
    nome: "Restaurante Sabor da Terra",
    categoria: "Restaurante",
    bairro: "Centro",
    descricao: "Comida caseira, pratos típicos e marmitas.",
    imagens: ["https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800"],
    lat: -20.3211,
    lng: -48.3129,
    telefone: "(17) 3333-9090",
    whatsapp: "+5517977779090",
    email: "reservas@saborterra.com",
    site: "https://saborterra.example.com",
    endereco: "Praça Central, 22 - Centro",
  },
  {
    id: "4",
    nome: "Tech Assistência",
    categoria: "Serviço",
    bairro: "Bairro Industrial",
    descricao: "Reparo de celulares, computadores e eletrônicos.",
    imagens: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800"],
    lat: -20.3224,
    lng: -48.3087,
    telefone: "(17) 3333-7007",
    whatsapp: "+5517966667007",
    email: "suporte@techassist.com",
    site: "https://techassist.example.com",
    endereco: "Av. Industrial, 500 - Bairro Industrial",
  },
  {
    id: "5",
    nome: "Padaria Doce Trigo",
    categoria: "Padaria",
    bairro: "Centro",
    descricao: "Pães artesanais, confeitaria e cafés especiais.",
    imagens: ["https://images.unsplash.com/photo-1549931319-a545dcf3e159?q=80&w=800"],
    lat: -20.3205,
    lng: -48.3114,
    telefone: "(17) 3333-1212",
    whatsapp: "+5517955551212",
    email: "contato@docetrigo.com",
    site: "https://docetrigo.example.com",
    endereco: "Rua das Flores, 88 - Centro",
  },
  {
    id: "6",
    nome: "Clínica Vida Plena",
    categoria: "Clínica",
    bairro: "Jardim Primavera",
    descricao: "Atendimento médico multiprofissional e exames básicos.",
    imagens: ["https://images.unsplash.com/photo-1580281657521-47f249e5d2f0?q=80&w=800"],
    lat: -20.3184,
    lng: -48.3161,
    telefone: "(17) 3333-3030",
    whatsapp: "+5517944443030",
    email: "saude@vidaplena.com",
    site: "https://vidaplena.example.com",
    endereco: "Alameda Primavera, 210 - Jardim Primavera",
  },
];
