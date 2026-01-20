-- ============================================
-- SCHEMA AQUI GUAÍRA - Supabase Database
-- ============================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- ============================================
-- CATEGORIAS DE EMPRESAS
-- ============================================
create table public.categorias (
  id uuid primary key default uuid_generate_v4(),
  nome text not null unique,
  icone text,
  cor text default '#10b981',
  ordem integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- EMPRESAS
-- ============================================
create table public.empresas (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  slug text unique not null,
  descricao text not null,
  categoria_id uuid references public.categorias(id) on delete set null,
  
  -- Localização
  endereco text,
  bairro text not null,
  cidade text default 'Guaíra',
  estado text default 'SP',
  cep text,
  latitude decimal(10, 8) not null,
  longitude decimal(11, 8) not null,
  location geography(Point, 4326),
  
  -- Contato
  telefone text,
  whatsapp text,
  email text,
  site text,
  instagram text,
  facebook text,
  
  -- Horários (JSON array: [{"dia": "Segunda", "abertura": "08:00", "fechamento": "18:00"}])
  horarios jsonb default '[]'::jsonb,
  
  -- Imagens (array de URLs)
  imagens text[] default array[]::text[],
  logo text,
  
  -- Status e metadata
  status text default 'pendente' check (status in ('pendente', 'aprovado', 'rejeitado', 'inativo')),
  verificado boolean default false,
  destaque boolean default false,
  visualizacoes integer default 0,
  
  -- Dono/responsável
  responsavel_nome text,
  responsavel_email text,
  responsavel_telefone text,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para performance
create index empresas_categoria_idx on public.empresas(categoria_id);
create index empresas_bairro_idx on public.empresas(bairro);
create index empresas_status_idx on public.empresas(status);
create index empresas_location_idx on public.empresas using gist(location);
create index empresas_slug_idx on public.empresas(slug);

-- Trigger para atualizar location baseado em lat/lng
create or replace function update_empresa_location()
returns trigger as $$
begin
  new.location := st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography;
  return new;
end;
$$ language plpgsql;

create trigger empresa_location_trigger
  before insert or update of latitude, longitude on public.empresas
  for each row
  execute function update_empresa_location();

-- ============================================
-- POSTS DO MURAL COMUNITÁRIO
-- ============================================
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  autor_nome text not null,
  autor_bairro text not null,
  autor_email text,
  conteudo text not null,
  imagens text[] default array[]::text[],
  
  -- Moderação
  status text default 'pendente' check (status in ('pendente', 'aprovado', 'rejeitado')),
  moderado_por text,
  moderado_em timestamp with time zone,
  motivo_rejeicao text,
  
  -- Engajamento
  curtidas integer default 0,
  comentarios integer default 0,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index posts_status_idx on public.posts(status);
create index posts_created_at_idx on public.posts(created_at desc);
create index posts_bairro_idx on public.posts(autor_bairro);

-- ============================================
-- COMENTÁRIOS NOS POSTS
-- ============================================
create table public.comentarios (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade not null,
  autor_nome text not null,
  conteudo text not null,
  status text default 'aprovado' check (status in ('pendente', 'aprovado', 'rejeitado')),
  created_at timestamp with time zone default now()
);

create index comentarios_post_idx on public.comentarios(post_id);
create index comentarios_created_at_idx on public.comentarios(created_at);

-- ============================================
-- LOCAIS TURÍSTICOS
-- ============================================
create table public.locais_turisticos (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  slug text unique not null,
  descricao text not null,
  categoria text not null, -- 'parque', 'museu', 'praça', 'monumento', etc
  
  -- Localização
  endereco text,
  bairro text,
  latitude decimal(10, 8) not null,
  longitude decimal(11, 8) not null,
  location geography(Point, 4326),
  
  -- Informações adicionais
  imagens text[] default array[]::text[],
  horario_funcionamento text,
  entrada_gratuita boolean default true,
  valor_entrada decimal(10, 2),
  acessibilidade boolean default false,
  estacionamento boolean default false,
  
  -- Contato
  telefone text,
  site text,
  
  -- Status
  status text default 'ativo' check (status in ('ativo', 'inativo', 'manutencao')),
  destaque boolean default false,
  visualizacoes integer default 0,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index locais_categoria_idx on public.locais_turisticos(categoria);
create index locais_status_idx on public.locais_turisticos(status);
create index locais_location_idx on public.locais_turisticos using gist(location);

-- ============================================
-- FAVORITOS DOS USUÁRIOS (localStorage backup)
-- ============================================
create table public.favoritos (
  id uuid primary key default uuid_generate_v4(),
  tipo text not null check (tipo in ('empresa', 'local', 'post')),
  item_id uuid not null,
  user_identifier text not null, -- pode ser email, IP hash, ou UUID de sessão
  created_at timestamp with time zone default now()
);

create index favoritos_user_idx on public.favoritos(user_identifier);
create index favoritos_item_idx on public.favoritos(item_id);
create unique index favoritos_unique_idx on public.favoritos(user_identifier, tipo, item_id);

-- ============================================
-- HISTÓRICO DE LOCALIZAÇÃO (para "Recentes")
-- ============================================
create table public.historico_localizacao (
  id uuid primary key default uuid_generate_v4(),
  user_identifier text not null,
  tipo text not null check (tipo in ('empresa', 'local')),
  item_id uuid not null,
  visualizado_em timestamp with time zone default now()
);

create index historico_user_idx on public.historico_localizacao(user_identifier);
create index historico_visualizado_idx on public.historico_localizacao(visualizado_em desc);

-- ============================================
-- STORAGE BUCKETS (imagens)
-- ============================================
-- Execute no painel Supabase Storage:
-- Bucket: empresas-images (public)
-- Bucket: posts-images (public)
-- Bucket: locais-images (public)

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Categorias: leitura pública
alter table public.categorias enable row level security;
create policy "Categorias são públicas"
  on public.categorias for select
  to anon, authenticated
  using (true);

-- Empresas: leitura pública (apenas aprovadas), inserção autenticada
alter table public.empresas enable row level security;
create policy "Empresas aprovadas são públicas"
  on public.empresas for select
  to anon, authenticated
  using (status = 'aprovado');

create policy "Usuários autenticados podem inserir empresas"
  on public.empresas for insert
  to authenticated
  with check (true);

-- Posts: leitura pública (apenas aprovados), inserção pública
alter table public.posts enable row level security;
create policy "Posts aprovados são públicos"
  on public.posts for select
  to anon, authenticated
  using (status = 'aprovado');

create policy "Qualquer um pode criar posts (moderação posterior)"
  on public.posts for insert
  to anon, authenticated
  with check (true);

-- Comentários: leitura pública, inserção pública
alter table public.comentarios enable row level security;
create policy "Comentários aprovados são públicos"
  on public.comentarios for select
  to anon, authenticated
  using (status = 'aprovado');

create policy "Qualquer um pode comentar"
  on public.comentarios for insert
  to anon, authenticated
  with check (true);

-- Locais turísticos: leitura pública
alter table public.locais_turisticos enable row level security;
create policy "Locais ativos são públicos"
  on public.locais_turisticos for select
  to anon, authenticated
  using (status = 'ativo');

-- Favoritos: acesso completo autenticado/anônimo
alter table public.favoritos enable row level security;
create policy "Usuários podem gerenciar seus favoritos"
  on public.favoritos for all
  to anon, authenticated
  using (true)
  with check (true);

-- Histórico: acesso completo
alter table public.historico_localizacao enable row level security;
create policy "Usuários podem gerenciar seu histórico"
  on public.historico_localizacao for all
  to anon, authenticated
  using (true)
  with check (true);

-- ============================================
-- FUNCTIONS ÚTEIS
-- ============================================

-- Busca empresas próximas (raio em metros)
create or replace function buscar_empresas_proximas(
  lat decimal,
  lng decimal,
  raio_metros integer default 5000
)
returns table (
  id uuid,
  nome text,
  distancia_metros double precision
) as $$
begin
  return query
  select 
    e.id,
    e.nome,
    st_distance(
      e.location,
      st_setsrid(st_makepoint(lng, lat), 4326)::geography
    ) as distancia_metros
  from public.empresas e
  where 
    e.status = 'aprovado'
    and st_dwithin(
      e.location,
      st_setsrid(st_makepoint(lng, lat), 4326)::geography,
      raio_metros
    )
  order by distancia_metros;
end;
$$ language plpgsql;

-- Incrementar visualizações
create or replace function incrementar_visualizacoes(
  tabela text,
  item_id uuid
)
returns void as $$
begin
  execute format('update public.%I set visualizacoes = visualizacoes + 1 where id = $1', tabela)
  using item_id;
end;
$$ language plpgsql;

-- ============================================
-- SEED DATA INICIAL
-- ============================================

-- Categorias padrão
insert into public.categorias (nome, icone, cor, ordem) values
  ('Alimentação', 'utensils', '#10b981', 1),
  ('Saúde', 'heart-pulse', '#3b82f6', 2),
  ('Serviços', 'wrench', '#f59e0b', 3),
  ('Comércio', 'shopping-bag', '#ec4899', 4),
  ('Educação', 'graduation-cap', '#8b5cf6', 5),
  ('Lazer', 'sparkles', '#06b6d4', 6),
  ('Automotivo', 'car', '#ef4444', 7),
  ('Construção', 'hard-hat', '#d97706', 8)
on conflict (nome) do nothing;

-- Locais turísticos padrão
insert into public.locais_turisticos (nome, slug, descricao, categoria, endereco, bairro, latitude, longitude, imagens, horario_funcionamento, entrada_gratuita) values
  (
    'Lago Maracá',
    'lago-maraca',
    'Complexo de esporte e lazer com pistas de caminhada/ciclismo, quadras de areia e pesca.',
    'parque',
    'Av. Principal, s/n',
    'Centro',
    -20.3167,
    -48.3167,
    array['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    '6h - 18h (todos os dias)',
    true
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
    array['https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800'],
    '24h',
    true
  ),
  (
    'Casa de Cultura',
    'casa-de-cultura',
    'Espaço cultural com exposições, eventos e atividades artísticas.',
    'museu',
    'Rua Cultural, 123',
    'Centro',
    -20.3170,
    -48.3170,
    array['https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800'],
    'Ter-Dom: 9h - 17h',
    true
  ),
  (
    'Escultura de Tomie Ohtake',
    'escultura-tomie-ohtake',
    'Monumento artístico em homenagem à renomada artista plástica.',
    'monumento',
    'Praça das Artes',
    'Centro',
    -20.3168,
    -48.3168,
    array['https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800'],
    '24h',
    true
  )
on conflict (slug) do nothing;

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_categorias_updated_at before update on public.categorias
  for each row execute function update_updated_at_column();

create trigger update_empresas_updated_at before update on public.empresas
  for each row execute function update_updated_at_column();

create trigger update_posts_updated_at before update on public.posts
  for each row execute function update_updated_at_column();

create trigger update_locais_updated_at before update on public.locais_turisticos
  for each row execute function update_updated_at_column();

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View de empresas com categoria
create or replace view empresas_completas as
select 
  e.*,
  c.nome as categoria_nome,
  c.icone as categoria_icone,
  c.cor as categoria_cor
from public.empresas e
left join public.categorias c on c.id = e.categoria_id
where e.status = 'aprovado';

-- View de posts aprovados com contagem
create or replace view posts_aprovados as
select 
  p.*,
  (select count(*) from public.comentarios where post_id = p.id and status = 'aprovado') as total_comentarios
from public.posts p
where p.status = 'aprovado'
order by p.created_at desc;
