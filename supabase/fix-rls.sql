-- ============================================
-- CORREÇÃO DE POLÍTICAS RLS - PERMITIR INSERÇÃO PÚBLICA
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- OPÇÃO 1: DESABILITAR RLS COMPLETAMENTE (para testes)
-- ⚠️ Use isso apenas para desenvolvimento/testes
alter table public.empresas disable row level security;

-- OPÇÃO 2: Se preferir manter RLS ativo com política permissiva, comente a linha acima e descomente abaixo:
-- drop policy if exists "Usuários autenticados podem inserir empresas" on public.empresas;
-- drop policy if exists "Permitir leitura pública de empresas aprovadas" on public.empresas;
-- 
-- create policy "Qualquer um pode cadastrar empresas"
--   on public.empresas for insert
--   with check (true);
-- 
-- create policy "Qualquer um pode ler empresas"
--   on public.empresas for select
--   using (true);
-- 
-- create policy "Qualquer um pode atualizar empresas"
--   on public.empresas for update
--   using (true)
--   with check (true);

-- Verificar se a política foi criada corretamente
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where tablename = 'empresas';

-- ============================================
-- CRIAR BUCKETS DE STORAGE (se ainda não existirem)
-- ============================================

-- Nota: Execute estes comandos um por vez no painel Storage do Supabase
-- Ou via SQL (se tiver permissões):

insert into storage.buckets (id, name, public)
values 
  ('empresas-images', 'empresas-images', true),
  ('posts-images', 'posts-images', true),
  ('locais-images', 'locais-images', true)
on conflict (id) do nothing;

-- ============================================
-- POLÍTICAS DE STORAGE - PERMITIR UPLOAD E LEITURA PÚBLICA
-- ============================================

-- Remover políticas antigas se existirem
drop policy if exists "Upload público de imagens de empresas" on storage.objects;
drop policy if exists "Leitura pública de imagens de empresas" on storage.objects;
drop policy if exists "Atualização de imagens de empresas" on storage.objects;
drop policy if exists "Deletar imagens de empresas" on storage.objects;
drop policy if exists "Upload público de imagens de posts" on storage.objects;
drop policy if exists "Leitura pública de imagens de posts" on storage.objects;
drop policy if exists "Upload público de imagens de locais" on storage.objects;
drop policy if exists "Leitura pública de imagens de locais" on storage.objects;

-- Bucket: empresas-images
create policy "Upload público de imagens de empresas"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'empresas-images');

create policy "Leitura pública de imagens de empresas"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'empresas-images');

create policy "Atualização de imagens de empresas"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'empresas-images')
with check (bucket_id = 'empresas-images');

create policy "Deletar imagens de empresas"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'empresas-images');

-- Bucket: posts-images
create policy "Upload público de imagens de posts"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'posts-images');

create policy "Leitura pública de imagens de posts"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'posts-images');

-- Bucket: locais-images
create policy "Upload público de imagens de locais"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'locais-images');

create policy "Leitura pública de imagens de locais"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'locais-images');

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Ver todas as políticas da tabela empresas
select * from pg_policies where tablename = 'empresas';

-- Ver todos os buckets
select * from storage.buckets;
