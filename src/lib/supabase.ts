import { createClient } from '@supabase/supabase-js'
import empresasFallback from '@/data/empresas-fallback.json';
import categoriasData from '@/data/categorias-empresas.json';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hihfnlbcantamcxpisef.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpaGZubGJjYW50YW1jeHBpc2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODIyMDMsImV4cCI6MjA3Nzg1ODIwM30._OevqLM5fIfxj_DCYapS30PoZIaEh63Iuq46Q6jdIz0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'aqui-guaira-web',
    },
  },
})

// ============================================
// TIPOS TYPESCRIPT
// ============================================

export interface User {
  id: string
  email: string
  senha_hash?: string // Hash da senha (não expor ao frontend normalmente)
  nome?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Categoria {
  id: string
  nome: string
  icone?: string
  cor?: string
  ordem: number
  created_at: string
  updated_at: string
}

export interface Empresa {
  id: string
  cnpj?: string // ← CNPJ adicionado
  nome: string
  slug: string
  descricao: string
  categoria_id?: string
  subcategorias?: string[] // ← Subcategorias adicionadas
  endereco?: string
  bairro: string
  cidade: string
  estado: string
  cep?: string
  latitude: number
  longitude: number
  telefone?: string
  whatsapp?: string
  email?: string
  site?: string
  instagram?: string
  facebook?: string
  link_google_maps?: string
  horarios?: Array<{ dia: string; abertura: string; fechamento: string }>
  imagens: string[]
  logo?: string
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'inativo'
  verificado: boolean
  destaque: boolean
  visualizacoes: number
  responsavel_nome?: string
  responsavel_email?: string
  responsavel_telefone?: string
  created_at: string
  updated_at: string
}

export interface EmpresaCompleta extends Empresa {
  categoria_nome?: string
  categoria_icone?: string
  categoria_cor?: string
}

export interface Post {
  id: string
  user_id?: string // ← ID do usuário logado (opcional)
  autor_anonimo: boolean // ← Se true, é post anônimo
  autor_nome?: string // ← Nome do autor (se anônimo ou de user)
  autor_bairro: string
  autor_email?: string
  conteudo: string
  imagens: string[]
  status: 'pendente' | 'aprovado' | 'rejeitado'
  moderado_por?: string
  moderado_em?: string
  motivo_rejeicao?: string
  curtidas: number
  comentarios: number
  created_at: string
  updated_at: string
}

export interface PostAprovado extends Post {
  autor_avatar?: string // ← Avatar do usuário (da view)
  total_comentarios: number
}

export interface Comentario {
  id: string
  post_id: string
  user_id?: string // ← ID do usuário logado (opcional)
  autor_anonimo: boolean // ← Se true, é comentário anônimo
  autor_nome: string
  conteudo: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  created_at: string
}

export interface LocalTuristico {
  id: string
  nome: string
  slug: string
  descricao: string
  categoria: string
  endereco?: string
  bairro?: string
  latitude: number
  longitude: number
  imagens: string[]
  horario_funcionamento?: string
  entrada_gratuita: boolean
  valor_entrada?: number
  acessibilidade: boolean
  estacionamento: boolean
  telefone?: string
  site?: string
  status: 'ativo' | 'inativo' | 'manutencao'
  destaque: boolean
  visualizacoes: number
  created_at: string
  updated_at: string
}

export interface Favorito {
  id: string
  tipo: 'empresa' | 'local' | 'post'
  item_id: string
  user_id?: string // ← ID do usuário logado (opcional)
  user_identifier: string // ← UUID anônimo (fallback se não logado)
  created_at: string
}

export interface HistoricoLocalizacao {
  id: string
  user_identifier: string
  tipo: 'empresa' | 'local'
  item_id: string
  visualizado_em: string
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Gera um identificador único para o usuário (para favoritos/histórico)
 * Usa localStorage para persistência
 */
export function getUserIdentifier(): string {
  const key = 'aqui_guaira_user_id'
  let userId = localStorage.getItem(key)
  if (!userId) {
    userId = crypto.randomUUID()
    localStorage.setItem(key, userId)
  }
  return userId
}

/**
 * Calcula distância entre dois pontos (Haversine)
 */
export function calcularDistancia(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Upload de imagem para o Supabase Storage
 */
export async function uploadImagem(
  bucket: 'empresas-images' | 'posts-images' | 'locais-images',
  file: File,
  pasta?: string
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = pasta ? `${pasta}/${fileName}` : fileName

    const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) throw error

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
    return data.publicUrl
  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    return null
  }
}

/**
 * Upload múltiplo de imagens
 */
export async function uploadImagens(
  bucket: 'empresas-images' | 'posts-images' | 'locais-images',
  files: File[],
  pasta?: string
): Promise<string[]> {
  const uploads = await Promise.all(
    files.map((file) => uploadImagem(bucket, file, pasta))
  )
  return uploads.filter((url): url is string => url !== null)
}

// ============================================
// FUNÇÕES DE API - EMPRESAS
// ============================================

export async function buscarEmpresas(filtros?: {
  categoria?: string
  bairro?: string
  busca?: string
  latitude?: number
  longitude?: number
  raioKm?: number
  destaque?: boolean
  responsavel_telefone?: string
  limit?: number
}) {
  try {
    const params = new URLSearchParams();
    if (filtros?.categoria) params.append('categoria', filtros.categoria);
    if (filtros?.bairro) params.append('bairro', filtros.bairro);
    if (filtros?.busca) params.append('busca', filtros.busca);
    if (filtros?.destaque) params.append('destaque', 'true');
    if (filtros?.responsavel_telefone) params.append('responsavel_telefone', filtros.responsavel_telefone);
    if (filtros?.limit) params.append('limit', filtros.limit.toString());

    // Chamada para nossa API (MongoDB)
    const res = await fetch(`/api/empresas?${params.toString()}`);

    if (!res.ok) {
      throw new Error(`Falha na API: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error('A resposta da API não é JSON valido. Certifique-se de estar rodando com "vercel dev" para acessar o MongoDB localmente.');
    }

    let data: EmpresaCompleta[] = await res.json();

    // Se tiver localização, calcular distâncias e filtrar por raio
    if (filtros?.latitude && filtros?.longitude && data) {
      const empresasComDistancia = data.map((emp) => ({
        ...emp,
        distancia: calcularDistancia(
          filtros.latitude!,
          filtros.longitude!,
          emp.latitude,
          emp.longitude
        ),
      }));

      const filtradas = filtros.raioKm
        ? empresasComDistancia.filter((emp) => emp.distancia <= filtros.raioKm!)
        : empresasComDistancia;

      return filtradas.sort((a, b) => a.distancia - b.distancia);
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar empresas (MongoDB):', error);
    // Retornar array vazio em caso de erro, ao invés de fallback
    return [];
  }
}

export async function buscarEmpresaPorSlug(slug: string) {
  try {
    const res = await fetch(`/api/empresas?slug=${slug}`);

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Falha na API: ' + res.status);
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error('A resposta da API não é JSON valido.');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar empresa (MongoDB):', error);
    return null;
  }
}

export async function buscarEmpresaPorId(id: string) {
  try {
    const res = await fetch(`/api/empresas?id=${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Erro ao buscar empresa por id:', error);
    return null;
  }
}

/**
 * Buscar empresas por uma lista de IDs (fallback local se necessário)
 */
export async function buscarEmpresasPorIds(ids: string[]) {
  if (!ids || ids.length === 0) return []

  try {
    // Tenta buscar as empresas uma a uma ou cria um endpoint bulk futuro
    const promises = ids.map(id => buscarEmpresaPorId(id));
    const results = await Promise.all(promises);
    return results.filter(Boolean) as EmpresaCompleta[];
  } catch (err) {
    console.error('Erro ao buscar empresas por ids:', err)
    return []
  }
}

export async function criarEmpresa(empresa: Partial<Empresa>) {
  try {
    const res = await fetch('/api/empresas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empresa)
    });

    if (!res.ok) throw new Error('Falha ao criar empresa');
    return await res.json();
  } catch (error) {
    console.error('Erro ao criar empresa (MongoDB):', error);
    return null;
  }
}

export async function atualizarEmpresa(id: string, dados: Partial<Empresa>) {
  try {
    const res = await fetch(`/api/empresas?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (!res.ok) throw new Error('Falha ao atualizar empresa');
    return true;
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    return false;
  }
}

export async function incrementarVisualizacoesEmpresa(id: string) {
  try {
    await fetch(`/api/empresas?id=${id}&action=increment_views`, {
      method: 'PATCH'
    });
  } catch (error) {
    console.error('Erro ao incrementar visualização:', error);
  }
}

// ============================================
// FUNÇÕES DE API - POSTS
// ============================================

export async function buscarPosts(limite = 50) {
  try {
    const res = await fetch(`/api/posts?limite=${limite}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Erro ao buscar posts (MongoDB):', error);
    return [];
  }
}

export async function criarPost(post: {
  autor_nome: string
  autor_bairro: string
  autor_email?: string
  conteudo: string
  imagens?: string[]
}) {
  try {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Erro ao criar post (MongoDB):', error);
    return null;
  }
}

export async function buscarComentarios(postId: string) {
  try {
    const res = await fetch(`/api/posts?action=comentarios&postId=${postId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Erro ao buscar comentários (MongoDB):', error);
    return [];
  }
}

export async function criarComentario(comentario: {
  post_id: string
  autor_nome: string
  conteudo: string
}) {
  try {
    const res = await fetch('/api/posts?action=comentario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comentario)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Erro ao criar comentário (MongoDB):', error);
    return null;
  }
}

// ============================================
// FUNÇÕES DE API - LOCAIS TURÍSTICOS
// ============================================

export async function buscarLocaisTuristicos() {
  try {
    const res = await fetch('/api/locais');
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Erro ao buscar locais (MongoDB):', error);
    return [];
  }
}

export async function buscarLocalPorSlug(slug: string) {
  try {
    const res = await fetch(`/api/locais?slug=${slug}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Erro ao buscar local (MongoDB):', error);
    return null;
  }
}

// ============================================
// FUNÇÕES DE API - CATEGORIAS
// ============================================

export async function buscarCategorias() {
  try {
    // Usar dados locais para categorias (mais rápido e resiliente)
    return categoriasData.categorias.map((c, index) => ({
      id: c.id,
      nome: c.nome,
      icone: c.icone,
      cor: c.cor,
      ordem: index,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })) as Categoria[];
  } catch (error) {
    console.error('Erro ao buscar categorias locais:', error);
    return [];
  }
}

// ============================================
// FUNÇÕES DE API - FAVORITOS
// ============================================

export async function buscarFavoritos(
  tipo?: 'empresa' | 'local' | 'post'
) {
  try {
    const userId = getUserIdentifier();
    const params = new URLSearchParams();
    params.append('user_identifier', userId);
    if (tipo) params.append('tipo', tipo);

    const res = await fetch(`/api/favoritos?${params.toString()}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Erro ao buscar favoritos (MongoDB):', error);
    return [];
  }
}

export async function adicionarFavorito(
  tipo: 'empresa' | 'local' | 'post',
  itemId: string
) {
  try {
    const userId = getUserIdentifier();
    const res = await fetch('/api/favoritos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, item_id: itemId, user_identifier: userId })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Erro ao adicionar favorito (MongoDB):', error);
    return null;
  }
}

export async function removerFavorito(
  tipo: 'empresa' | 'local' | 'post',
  itemId: string
) {
  try {
    const userId = getUserIdentifier();
    const res = await fetch(`/api/favoritos?user_identifier=${userId}&tipo=${tipo}&item_id=${itemId}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (error) {
    console.error('Erro ao remover favorito (MongoDB):', error);
    return false;
  }
}

// ============================================
// FUNÇÕES DE API - HISTÓRICO
// ============================================

export async function adicionarAoHistorico(
  tipo: 'empresa' | 'local',
  itemId: string
) {
  try {
    const userId = getUserIdentifier();
    const user = getUsuarioLogado();

    const item: any = {
      tipo,
      item_id: itemId,
      user_identifier: userId
    };

    if (user) {
      item.user_id = user.id;
    }

    await fetch('/api/historico', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
  } catch (error) {
    console.error('Erro ao adicionar ao histórico (MongoDB):', error);
  }
}

export async function buscarHistorico(limite = 20) {
  try {
    const userId = getUserIdentifier();
    const user = getUsuarioLogado();

    const params = new URLSearchParams();
    if (user) {
      params.append('user_id', user.id);
    } else {
      params.append('user_identifier', userId);
    }
    params.append('limite', limite.toString());

    const res = await fetch(`/api/historico?${params.toString()}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Erro ao buscar histórico (MongoDB):', error);
    return [];
  }
}

// ============================================
// FUNÇÕES DE API - USERS
// ============================================

/**
 * Hash de senha simples usando Web Crypto API (SHA-256)
 * Para produção, recomenda-se usar bcrypt no backend
 */
async function hashSenha(senha: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(senha)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Criar ou fazer login de usuário
 * @param email - Email do usuário
 * @param nome - Nome do usuário (apenas para registro)
 * @param senha - Senha do usuário
 * @param isRegistro - Se true, cria nova conta; se false, faz login
 */
export async function criarOuLogarUsuario(
  email: string,
  nome?: string,
  senha?: string,
  isRegistro: boolean = false
): Promise<User | null> {
  if (!senha) {
    throw new Error('Senha é obrigatória')
  }

  const endpoint = `/api/auth?action=${isRegistro ? 'register' : 'login'}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha, nome })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro na autenticação');
    }

    // Salvar no localStorage
    localStorage.setItem('aqui_guaira_user', JSON.stringify(data))
    return data as User;
  } catch (error: any) {
    console.error('Erro ao autenticar (MongoDB):', error);
    throw error;
  }
}

/**
 * Obter usuário logado do localStorage
 */
export function getUsuarioLogado(): User | null {
  const userStr = localStorage.getItem('aqui_guaira_user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr) as User
  } catch {
    return null
  }
}

/**
 * Fazer logout (limpar localStorage)
 */
export function logout() {
  localStorage.removeItem('aqui_guaira_user')
}

/**
 * Atualizar perfil do usuário
 */
export async function atualizarUsuario(userId: string, dados: Partial<User>) {
  try {
    const res = await fetch(`/api/auth?id=${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Falha ao atualizar usuário');
    }

    const updatedUser = await res.json();
    // Atualizar localStorage
    localStorage.setItem('aqui_guaira_user', JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error('Erro ao atualizar usuário (MongoDB):', error);
    throw error;
  }
}

// ============================================
// FUNÇÕES DE API - FAVORITOS (ATUALIZADO COM USER_ID)
// ============================================

/**
 * Buscar favoritos (prioriza user_id se logado, senão usa user_identifier)
 */
export async function buscarFavoritosUsuario(tipo?: 'empresa' | 'local' | 'post') {
  try {
    const user = getUsuarioLogado();
    const userId = getUserIdentifier();

    const params = new URLSearchParams();
    if (user) {
      params.append('user_id', user.id);
    } else {
      params.append('user_identifier', userId);
    }
    if (tipo) params.append('tipo', tipo);

    const res = await fetch(`/api/favoritos?${params.toString()}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Erro ao buscar favoritos de usuário (MongoDB):', error);
    return [];
  }
}

/**
 * Adicionar favorito (com user_id se logado)
 */
export async function adicionarFavoritoUsuario(
  tipo: 'empresa' | 'local' | 'post',
  itemId: string
) {
  try {
    const user = getUsuarioLogado();
    const userId = getUserIdentifier();

    const favorito: any = {
      tipo,
      item_id: itemId,
      user_identifier: userId,
    };

    if (user) {
      favorito.user_id = user.id;
    }

    const res = await fetch('/api/favoritos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(favorito)
    });

    if (!res.ok) {
      throw new Error('Falha ao adicionar favorito');
    }

    return await res.json();
  } catch (error) {
    console.error('Erro ao adicionar favorito de usuário (MongoDB):', error);
    throw error;
  }
}

/**
 * Remover favorito
 */
export async function removerFavoritoUsuario(
  tipo: 'empresa' | 'local' | 'post',
  itemId: string
) {
  try {
    const user = getUsuarioLogado();
    const userId = getUserIdentifier();

    const params = new URLSearchParams();
    if (user) {
      params.append('user_id', user.id);
    } else {
      params.append('user_identifier', userId);
    }
    params.append('tipo', tipo);
    params.append('item_id', itemId);

    const res = await fetch(`/api/favoritos?${params.toString()}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      throw new Error('Falha ao remover favorito');
    }
    return true;
  } catch (error) {
    console.error('Erro ao remover favorito de usuário (MongoDB):', error);
    throw error;
  }
}
