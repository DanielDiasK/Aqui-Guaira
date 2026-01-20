import { createClient } from '@supabase/supabase-js'
import empresasFallback from '@/data/empresas-fallback.json';

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
  limit?: number
}) {
  try {
    const params = new URLSearchParams();
    if (filtros?.categoria) params.append('categoria', filtros.categoria);
    if (filtros?.bairro) params.append('bairro', filtros.bairro);
    if (filtros?.busca) params.append('busca', filtros.busca);
    if (filtros?.destaque) params.append('destaque', 'true');
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

/**
 * Buscar empresas por uma lista de IDs (view empresas_completas)
 */
export async function buscarEmpresasPorIds(ids: string[]) {
  if (!ids || ids.length === 0) return []

  // Fallback / Local logic
  try {
    const found = (empresasFallback as any[]).filter(e => ids.includes(e.id));
    return found.map(e => ({
      ...e,
      subcategorias: e.subcategorias || [],
      categoria_nome: e.categoria_nome || 'Geral'
    })) as unknown as EmpresaCompleta[];
  } catch (err) {
    console.error('Erro ao buscar empresas por ids:', err)
    return []
  }
}

export async function criarEmpresa(empresa: Partial<Empresa>) {
  // TODO: Implementar criação no MongoDB
  console.warn('Criação de empresa ainda não migrada para MongoDB. Dados:', empresa);
  return null;
}

export async function incrementarVisualizacoesEmpresa(id: string) {
  // TODO: Implementar incremento no MongoDB via API
  console.log('Incrementar visualização (mock):', id);
}

// ============================================
// FUNÇÕES DE API - POSTS
// ============================================

export async function buscarPosts(limite = 50) {
  const { data, error } = await supabase
    .from('posts_aprovados')
    .select('*')
    .limit(limite)

  if (error) {
    console.error('Erro ao buscar posts:', error)
    return []
  }

  return data || []
}

export async function criarPost(post: {
  autor_nome: string
  autor_bairro: string
  autor_email?: string
  conteudo: string
  imagens?: string[]
}) {
  const { data, error } = await supabase
    .from('posts')
    .insert([{ ...post, status: 'pendente' }])
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar post:', error)
    return null
  }

  return data
}

export async function buscarComentarios(postId: string) {
  const { data, error } = await supabase
    .from('comentarios')
    .select('*')
    .eq('post_id', postId)
    .eq('status', 'aprovado')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Erro ao buscar comentários:', error)
    return []
  }

  return data || []
}

export async function criarComentario(comentario: {
  post_id: string
  autor_nome: string
  conteudo: string
}) {
  const { data, error } = await supabase
    .from('comentarios')
    .insert([{ ...comentario, status: 'aprovado' }])
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar comentário:', error)
    return null
  }

  return data
}

// ============================================
// FUNÇÕES DE API - LOCAIS TURÍSTICOS
// ============================================

export async function buscarLocaisTuristicos() {
  const { data, error } = await supabase
    .from('locais_turisticos')
    .select('*')
    .eq('status', 'ativo')
    .order('nome')

  if (error) {
    console.error('Erro ao buscar locais:', error)
    return []
  }

  return data || []
}

export async function buscarLocalPorSlug(slug: string) {
  const { data, error } = await supabase
    .from('locais_turisticos')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Erro ao buscar local:', error)
    return null
  }

  return data
}

// ============================================
// FUNÇÕES DE API - CATEGORIAS
// ============================================

export async function buscarCategorias() {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('ordem')

  if (error) {
    console.error('Erro ao buscar categorias:', error)
    return []
  }

  return data || []
}

// ============================================
// FUNÇÕES DE API - FAVORITOS
// ============================================

export async function buscarFavoritos(
  tipo?: 'empresa' | 'local' | 'post'
) {
  const userId = getUserIdentifier()
  let query = supabase
    .from('favoritos')
    .select('*')
    .eq('user_identifier', userId)

  if (tipo) {
    query = query.eq('tipo', tipo)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar favoritos:', error)
    return []
  }

  return data || []
}

export async function adicionarFavorito(
  tipo: 'empresa' | 'local' | 'post',
  itemId: string
) {
  const userId = getUserIdentifier()
  const { data, error } = await supabase
    .from('favoritos')
    .insert([{ tipo, item_id: itemId, user_identifier: userId }])
    .select()
    .single()

  if (error) {
    console.error('Erro ao adicionar favorito:', error)
    return null
  }

  return data
}

export async function removerFavorito(
  tipo: 'empresa' | 'local' | 'post',
  itemId: string
) {
  const userId = getUserIdentifier()
  const { error } = await supabase
    .from('favoritos')
    .delete()
    .eq('user_identifier', userId)
    .eq('tipo', tipo)
    .eq('item_id', itemId)

  if (error) {
    console.error('Erro ao remover favorito:', error)
    return false
  }

  return true
}

// ============================================
// FUNÇÕES DE API - HISTÓRICO
// ============================================

export async function adicionarAoHistorico(
  tipo: 'empresa' | 'local',
  itemId: string
) {
  const userId = getUserIdentifier()
  await supabase.from('historico_localizacao').insert([
    {
      user_identifier: userId,
      tipo,
      item_id: itemId,
    },
  ])
}

export async function buscarHistorico(limite = 20) {
  const userId = getUserIdentifier()
  const { data, error } = await supabase
    .from('historico_localizacao')
    .select('*')
    .eq('user_identifier', userId)
    .order('visualizado_em', { ascending: false })
    .limit(limite)

  if (error) {
    console.error('Erro ao buscar histórico:', error)
    return []
  }

  return data || []
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
  const { data, error } = await supabase
    .from('users')
    .update(dados)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar usuário:', error)
    throw error
  }

  // Atualizar localStorage
  localStorage.setItem('aqui_guaira_user', JSON.stringify(data))
  return data
}

// ============================================
// FUNÇÕES DE API - FAVORITOS (ATUALIZADO COM USER_ID)
// ============================================

/**
 * Buscar favoritos (prioriza user_id se logado, senão usa user_identifier)
 */
export async function buscarFavoritosUsuario(tipo?: 'empresa' | 'local' | 'post') {
  const user = getUsuarioLogado()

  console.log('🔍 Buscando favoritos:', { tipo, user: user?.email })

  let query = supabase.from('favoritos').select('*')

  if (user) {
    // Se logado, buscar por user_id
    console.log('✅ Buscando favoritos do usuário logado:', user.id)
    query = query.eq('user_id', user.id)
  } else {
    // Se não logado, buscar por user_identifier
    const userId = getUserIdentifier()
    console.log('⚠️ Buscando favoritos por user_identifier:', userId)
    query = query.eq('user_identifier', userId)
  }

  if (tipo) {
    query = query.eq('tipo', tipo)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('❌ Erro ao buscar favoritos:', error)
    return []
  }

  console.log(`✅ ${data?.length || 0} favoritos encontrados`)
  return data || []
}

/**
 * Adicionar favorito (com user_id se logado)
 */
export async function adicionarFavoritoUsuario(
  tipo: 'empresa' | 'local' | 'post',
  itemId: string
) {
  const user = getUsuarioLogado()
  const userId = getUserIdentifier()

  console.log('🔍 Adicionando favorito:', { tipo, itemId, user: user?.email, userId })

  // Criar novo favorito
  const favorito: any = {
    tipo,
    item_id: itemId,
    user_identifier: userId,
  }

  // Se logado, adicionar user_id
  if (user) {
    favorito.user_id = user.id
    console.log('✅ Usuário logado, adicionando user_id:', user.id)
  } else {
    console.log('⚠️ Usuário não logado, usando apenas user_identifier')
  }

  const { data, error } = await supabase
    .from('favoritos')
    .insert([favorito])
    .select()

  if (error) {
    // Se for erro de duplicata, buscar o favorito existente
    if (error.code === '23505') {
      console.log('ℹ️ Favorito já existe (duplicata)')
      return
    }
    console.error('❌ Erro ao adicionar favorito:', error)
    throw error
  }

  console.log('✅ Favorito adicionado com sucesso:', data)
}

/**
 * Remover favorito
 */
export async function removerFavoritoUsuario(
  tipo: 'empresa' | 'local' | 'post',
  itemId: string
) {
  const user = getUsuarioLogado()
  const userId = getUserIdentifier()

  let query = supabase
    .from('favoritos')
    .delete()
    .eq('tipo', tipo)
    .eq('item_id', itemId)

  if (user) {
    query = query.eq('user_id', user.id)
  } else {
    query = query.eq('user_identifier', userId)
  }

  const { error } = await query

  if (error) {
    console.error('Erro ao remover favorito:', error)
    throw error
  }
}
