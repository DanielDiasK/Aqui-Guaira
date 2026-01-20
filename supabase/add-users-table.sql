-- ============================================
-- CRIAR TABELA USERS E ATUALIZAR FAVORITOS
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 0. CRIAR FUNÇÃO DE TRIGGER PARA UPDATED_AT (se não existir)
create or replace function trigger_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 1. CRIAR TABELA USERS
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email varchar(255) unique not null,
  senha_hash text not null,
  nome varchar(255),
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Comentários
comment on table public.users is 'Usuários do sistema para login e favoritos';
comment on column public.users.email is 'Email único do usuário';
comment on column public.users.senha_hash is 'Hash bcrypt da senha';
comment on column public.users.nome is 'Nome de exibição do usuário';
comment on column public.users.avatar_url is 'URL do avatar do usuário';

-- Índices
create index if not exists idx_users_email on public.users(email);

-- RLS: Desabilitar para permitir cadastro público
alter table public.users disable row level security;

-- Trigger para atualizar updated_at
create trigger set_users_updated_at
  before update on public.users
  for each row
  execute function trigger_set_updated_at();

-- 2. ATUALIZAR TABELA FAVORITOS
-- Adicionar coluna user_id (opcional, para usuários logados)
alter table public.favoritos 
add column if not exists user_id uuid references public.users(id) on delete cascade;

-- Comentário
comment on column public.favoritos.user_id is 'ID do usuário logado (opcional, se não tiver usa user_identifier)';

-- Índice
create index if not exists idx_favoritos_user_id on public.favoritos(user_id);

-- 3. ATUALIZAR TABELA POSTS
-- Adicionar colunas para autor
alter table public.posts 
add column if not exists user_id uuid references public.users(id) on delete set null,
add column if not exists autor_anonimo boolean default false;

-- Comentários
comment on column public.posts.user_id is 'ID do usuário que criou o post (null se anônimo)';
comment on column public.posts.autor_anonimo is 'Se true, o post foi feito de forma anônima';

-- Índice
create index if not exists idx_posts_user_id on public.posts(user_id);

-- 4. ATUALIZAR TABELA COMENTARIOS
-- Adicionar colunas para autor
alter table public.comentarios 
add column if not exists user_id uuid references public.users(id) on delete set null,
add column if not exists autor_anonimo boolean default false;

-- Comentários
comment on column public.comentarios.user_id is 'ID do usuário que criou o comentário (null se anônimo)';
comment on column public.comentarios.autor_anonimo is 'Se true, o comentário foi feito de forma anônima';

-- Índice
create index if not exists idx_comentarios_user_id on public.comentarios(user_id);

-- 5. ATUALIZAR VIEW POSTS_APROVADOS
drop view if exists posts_aprovados;

create or replace view posts_aprovados as
select 
  p.*,
  coalesce(u.nome, p.autor_nome) as autor_nome_final,
  u.avatar_url as autor_avatar,
  (select count(*) from public.comentarios where post_id = p.id and status = 'aprovado') as total_comentarios
from public.posts p
left join public.users u on u.id = p.user_id
where p.status = 'aprovado'
order by p.created_at desc;

-- 6. CRIAR FUNÇÃO PARA BUSCAR FAVORITOS DE USUÁRIO
create or replace function buscar_favoritos_usuario(p_user_id uuid, p_tipo text default null)
returns table (
  id uuid,
  tipo text,
  item_id uuid,
  created_at timestamp with time zone
) as $$
begin
  return query
  select f.id, f.tipo, f.item_id, f.created_at
  from public.favoritos f
  where f.user_id = p_user_id
    and (p_tipo is null or f.tipo = p_tipo)
  order by f.created_at desc;
end;
$$ language plpgsql;

-- 7. SEED DATA - Inserir algumas categorias se não existirem
insert into public.categorias (nome, icone, cor)
values 
  ('Restaurantes', 'utensils', '#FF6B6B'),
  ('Serviços', 'wrench', '#4ECDC4'),
  ('Comércio', 'shopping-bag', '#45B7D1'),
  ('Saúde', 'heart-pulse', '#96CEB4'),
  ('Educação', 'graduation-cap', '#FFEAA7'),
  ('Entretenimento', 'ticket', '#DFE6E9')
on conflict (nome) do nothing;

-- 8. VERIFICAÇÕES
-- Ver tabela users
select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'users' and table_schema = 'public'
order by ordinal_position;

-- Ver alterações em favoritos
select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'favoritos' and table_schema = 'public' and column_name = 'user_id';

-- Ver alterações em posts
select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'posts' and table_schema = 'public' and column_name in ('user_id', 'autor_anonimo');

-- Ver view posts_aprovados
select * from posts_aprovados limit 1;
