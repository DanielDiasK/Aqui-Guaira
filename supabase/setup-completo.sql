-- ============================================
-- AQUI GUAÍRA - SETUP COMPLETO DO BANCO DE DADOS
-- Execute este arquivo no Supabase SQL Editor
-- Versão: 1.0.0
-- Data: 11/01/2026
-- ============================================

-- ============================================
-- 1. EXTENSÕES NECESSÁRIAS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- 2. TABELAS PRINCIPAIS
-- ============================================

-- CATEGORIAS DE EMPRESAS
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL UNIQUE,
  icone TEXT,
  cor TEXT DEFAULT '#10b981',
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USUÁRIOS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  nome VARCHAR(255),
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ADMINISTRADORES
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT NOW()
);

-- EMPRESAS
CREATE TABLE IF NOT EXISTS public.empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cnpj TEXT,
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descricao TEXT NOT NULL,
  categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
  
  -- Localização
  endereco TEXT,
  bairro TEXT NOT NULL,
  cidade TEXT DEFAULT 'Guaíra',
  estado TEXT DEFAULT 'SP',
  cep TEXT,
  latitude DECIMAL(10, 8) NOT NULL DEFAULT -20.3167,
  longitude DECIMAL(11, 8) NOT NULL DEFAULT -48.3167,
  location GEOGRAPHY(Point, 4326),
  
  -- Contato
  telefone TEXT,
  whatsapp TEXT,
  email TEXT,
  site TEXT,
  instagram TEXT,
  facebook TEXT,
  
  -- Horários (JSON array)
  horarios JSONB DEFAULT '[]'::JSONB,
  
  -- Imagens
  imagens TEXT[] DEFAULT ARRAY[]::TEXT[],
  logo TEXT,
  
  -- Status e metadata
  status TEXT DEFAULT 'aprovado' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'inativo')),
  verificado BOOLEAN DEFAULT FALSE,
  destaque BOOLEAN DEFAULT FALSE,
  visualizacoes INTEGER DEFAULT 0,
  ativa BOOLEAN DEFAULT TRUE,
  motivo_bloqueio TEXT,
  
  -- Responsável
  responsavel_nome TEXT,
  responsavel_email TEXT,
  responsavel_telefone TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_cadastro TIMESTAMP DEFAULT NOW()
);

-- POSTS DO MURAL
CREATE TABLE IF NOT EXISTS public.mural_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  imagem TEXT,
  bairro TEXT,
  logradouro TEXT,
  aprovado BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_aprovacao TIMESTAMP,
  motivo_rejeicao TEXT,
  visualizacoes INTEGER DEFAULT 0
);

-- COMENTÁRIOS
CREATE TABLE IF NOT EXISTS public.comentarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.mural_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  autor_nome TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  autor_anonimo BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'aprovado' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LOCAIS TURÍSTICOS
CREATE TABLE IF NOT EXISTS public.locais_turisticos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  
  -- Localização
  endereco TEXT,
  bairro TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location GEOGRAPHY(Point, 4326),
  
  -- Informações
  imagens TEXT[] DEFAULT ARRAY[]::TEXT[],
  horario_funcionamento TEXT,
  entrada_gratuita BOOLEAN DEFAULT TRUE,
  valor_entrada DECIMAL(10, 2),
  acessibilidade BOOLEAN DEFAULT FALSE,
  estacionamento BOOLEAN DEFAULT FALSE,
  
  -- Contato
  telefone TEXT,
  site TEXT,
  
  -- Status
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'manutencao')),
  destaque BOOLEAN DEFAULT FALSE,
  visualizacoes INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAVORITOS
CREATE TABLE IF NOT EXISTS public.favoritos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo TEXT NOT NULL CHECK (tipo IN ('empresa', 'local', 'post')),
  item_id UUID NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HISTÓRICO DE LOCALIZAÇÃO
CREATE TABLE IF NOT EXISTS public.historico_localizacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_identifier TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('empresa', 'local')),
  item_id UUID NOT NULL,
  visualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LOGS DE ADMIN
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  acao TEXT NOT NULL,
  entidade_tipo TEXT NOT NULL,
  entidade_id UUID NOT NULL,
  detalhes JSONB,
  data_acao TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS empresas_categoria_idx ON public.empresas(categoria_id);
CREATE INDEX IF NOT EXISTS empresas_bairro_idx ON public.empresas(bairro);
CREATE INDEX IF NOT EXISTS empresas_status_idx ON public.empresas(status);
CREATE INDEX IF NOT EXISTS empresas_slug_idx ON public.empresas(slug);
CREATE INDEX IF NOT EXISTS empresas_location_idx ON public.empresas USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_empresas_ativa ON public.empresas(ativa);
CREATE INDEX IF NOT EXISTS idx_empresas_data_cadastro ON public.empresas(data_cadastro DESC);

CREATE INDEX IF NOT EXISTS mural_posts_aprovado_idx ON public.mural_posts(aprovado);
CREATE INDEX IF NOT EXISTS mural_posts_user_idx ON public.mural_posts(user_id);
CREATE INDEX IF NOT EXISTS mural_posts_empresa_idx ON public.mural_posts(empresa_id);
CREATE INDEX IF NOT EXISTS mural_posts_created_at_idx ON public.mural_posts(data_criacao DESC);

CREATE INDEX IF NOT EXISTS comentarios_post_idx ON public.comentarios(post_id);
CREATE INDEX IF NOT EXISTS comentarios_user_idx ON public.comentarios(user_id);
CREATE INDEX IF NOT EXISTS comentarios_created_at_idx ON public.comentarios(created_at);

CREATE INDEX IF NOT EXISTS locais_categoria_idx ON public.locais_turisticos(categoria);
CREATE INDEX IF NOT EXISTS locais_status_idx ON public.locais_turisticos(status);
CREATE INDEX IF NOT EXISTS locais_location_idx ON public.locais_turisticos USING GIST(location);

CREATE INDEX IF NOT EXISTS favoritos_user_idx ON public.favoritos(user_identifier);
CREATE INDEX IF NOT EXISTS favoritos_user_id_idx ON public.favoritos(user_id);
CREATE INDEX IF NOT EXISTS favoritos_item_idx ON public.favoritos(item_id);
CREATE UNIQUE INDEX IF NOT EXISTS favoritos_unique_idx ON public.favoritos(user_identifier, tipo, item_id);

CREATE INDEX IF NOT EXISTS historico_user_idx ON public.historico_localizacao(user_identifier);
CREATE INDEX IF NOT EXISTS historico_visualizado_idx ON public.historico_localizacao(visualizado_em DESC);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_data ON public.admin_logs(data_acao DESC);

-- ============================================
-- 4. TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categorias_updated_at 
  BEFORE UPDATE ON public.categorias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empresas_updated_at 
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locais_updated_at 
  BEFORE UPDATE ON public.locais_turisticos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para location baseado em lat/lng
CREATE OR REPLACE FUNCTION update_empresa_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::GEOGRAPHY;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER empresa_location_trigger
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_empresa_location();

-- ============================================
-- 5. VIEWS ÚTEIS
-- ============================================

-- View de empresas completas
CREATE OR REPLACE VIEW empresas_completas AS
SELECT 
  e.*,
  c.nome AS categoria_nome,
  c.icone AS categoria_icone,
  c.cor AS categoria_cor
FROM public.empresas e
LEFT JOIN public.categorias c ON c.id = e.categoria_id
WHERE e.status = 'aprovado' AND e.ativa = TRUE;

-- View de estatísticas admin
CREATE OR REPLACE VIEW admin_estatisticas AS
SELECT 
  (SELECT COUNT(*) FROM public.empresas WHERE ativa = TRUE) AS empresas_ativas,
  (SELECT COUNT(*) FROM public.empresas WHERE ativa = FALSE) AS empresas_bloqueadas,
  (SELECT COUNT(*) FROM public.empresas) AS total_empresas,
  (SELECT COUNT(*) FROM public.mural_posts WHERE aprovado = FALSE AND motivo_rejeicao IS NULL) AS posts_pendentes,
  (SELECT COUNT(*) FROM public.mural_posts WHERE aprovado = TRUE) AS posts_aprovados,
  (SELECT COUNT(*) FROM public.mural_posts) AS total_posts,
  (SELECT COUNT(*) FROM public.users) AS total_usuarios,
  (SELECT COUNT(*) FROM public.users WHERE is_admin = TRUE) AS total_admins;

-- ============================================
-- 6. FUNÇÕES ÚTEIS
-- ============================================

-- Incrementar visualizações
CREATE OR REPLACE FUNCTION incrementar_visualizacoes(
  tabela TEXT,
  item_id UUID
)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE public.%I SET visualizacoes = visualizacoes + 1 WHERE id = $1', tabela)
  USING item_id;
END;
$$ LANGUAGE plpgsql;

-- Buscar empresas próximas
CREATE OR REPLACE FUNCTION buscar_empresas_proximas(
  lat DECIMAL,
  lng DECIMAL,
  raio_metros INTEGER DEFAULT 5000
)
RETURNS TABLE (
  id UUID,
  nome TEXT,
  distancia_metros DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.nome,
    ST_Distance(
      e.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::GEOGRAPHY
    ) AS distancia_metros
  FROM public.empresas e
  WHERE 
    e.status = 'aprovado'
    AND e.ativa = TRUE
    AND ST_DWithin(
      e.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::GEOGRAPHY,
      raio_metros
    )
  ORDER BY distancia_metros;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. DESABILITAR RLS (Sistema usa autenticação própria)
-- ============================================
ALTER TABLE public.categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mural_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.locais_turisticos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_localizacao DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. PERMISSÕES
-- ============================================
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- 9. DADOS INICIAIS - CATEGORIAS
-- ============================================
INSERT INTO public.categorias (nome, icone, cor, ordem) VALUES 
  ('Alimentação', 'utensils', '#FF6B6B', 1),
  ('Restaurantes', 'utensils', '#FF6B6B', 2),
  ('Padarias', 'croissant', '#FFA94D', 3),
  ('Lanchonetes', 'coffee', '#FFD93D', 4),
  ('Bares', 'beer', '#95E1D3', 5),
  ('Serviços', 'wrench', '#4ECDC4', 10),
  ('Salão de Beleza', 'scissors', '#FF85A2', 11),
  ('Barbearia', 'scissors', '#A8DADC', 12),
  ('Mecânica', 'wrench', '#457B9D', 13),
  ('Eletricista', 'zap', '#F4A261', 14),
  ('Encanador', 'droplet', '#2A9D8F', 15),
  ('Pedreiro', 'hammer', '#E76F51', 16),
  ('Marcenaria', 'hammer', '#8B4513', 17),
  ('Comércio', 'shopping-bag', '#45B7D1', 20),
  ('Supermercado', 'shopping-cart', '#3A86FF', 21),
  ('Farmácia', 'pill', '#06D6A0', 22),
  ('Lotérica', 'ticket', '#FFB703', 23),
  ('Papelaria', 'pen', '#8338EC', 24),
  ('Loja de Roupas', 'shirt', '#FF006E', 25),
  ('Calçados', 'footprints', '#FB5607', 26),
  ('Pet Shop', 'paw-print', '#06FFA5', 27),
  ('Saúde', 'heart-pulse', '#96CEB4', 30),
  ('Clínica Médica', 'stethoscope', '#48CAE4', 31),
  ('Odontologia', 'smile', '#00B4D8', 32),
  ('Fisioterapia', 'activity', '#0077B6', 33),
  ('Psicologia', 'brain', '#90E0EF', 34),
  ('Academia', 'dumbbell', '#FF4D6D', 35),
  ('Educação', 'graduation-cap', '#FFEAA7', 40),
  ('Escola', 'school', '#FFD60A', 41),
  ('Curso de Idiomas', 'languages', '#FFC300', 42),
  ('Curso Técnico', 'book-open', '#FFB700', 43),
  ('Reforço Escolar', 'book', '#FFAA00', 44),
  ('Entretenimento', 'ticket', '#DFE6E9', 50),
  ('Cinema', 'film', '#6C5CE7', 51),
  ('Teatro', 'theater', '#A29BFE', 52),
  ('Esporte', 'trophy', '#00B894', 53),
  ('Eventos', 'calendar', '#FDCB6E', 54),
  ('Tecnologia', 'smartphone', '#74B9FF', 60),
  ('Assistência Técnica', 'laptop', '#0984E3', 61),
  ('Informática', 'monitor', '#6C5CE7', 62),
  ('Automotivo', 'car', '#636E72', 70),
  ('Auto Peças', 'cog', '#2D3436', 71),
  ('Lava Rápido', 'droplets', '#00CEC9', 72),
  ('Estacionamento', 'square-parking', '#636E72', 73),
  ('Construção', 'hammer', '#E17055', 80),
  ('Material de Construção', 'brick-wall', '#D63031', 81),
  ('Pintura', 'paintbrush', '#FD79A8', 82),
  ('Imóveis', 'home', '#00B894', 90),
  ('Imobiliária', 'building', '#00CEC9', 91),
  ('Turismo', 'plane', '#A29BFE', 100),
  ('Hotel', 'bed', '#6C5CE7', 101),
  ('Pousada', 'house', '#74B9FF', 102),
  ('Outros', 'more-horizontal', '#B2BEC3', 999)
ON CONFLICT (nome) DO UPDATE SET
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ============================================
-- 10. DADOS INICIAIS - LOCAIS TURÍSTICOS
-- ============================================
INSERT INTO public.locais_turisticos (nome, slug, descricao, categoria, endereco, bairro, latitude, longitude, imagens, horario_funcionamento, entrada_gratuita) VALUES
  (
    'Lago Maracá',
    'lago-maraca',
    'Complexo de esporte e lazer com pistas de caminhada/ciclismo, quadras de areia e pesca.',
    'parque',
    'Av. Principal, s/n',
    'Centro',
    -20.3167,
    -48.3167,
    ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    '6h - 18h (todos os dias)',
    TRUE
  ),
  (
    'Praça São Sebastião (Jardim Japonês)',
    'jardim-japones',
    'Bela praça com jardim japonês, ideal para caminhadas e momentos de contemplação.',
    'praça',
    'Rua Central',
    'Centro',
    -20.3165,
    -48.3165,
    ARRAY['https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800'],
    '24h',
    TRUE
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- FIM DO SETUP
-- ============================================

-- Verificar criação das tabelas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') AS colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar categorias inseridas
SELECT COUNT(*) AS total_categorias FROM public.categorias;

-- Mensagem final
SELECT '✅ Setup completo! Banco de dados Aqui Guaíra configurado com sucesso!' AS status;
