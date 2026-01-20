-- ============================================
-- ADICIONAR COLUNA SENHA_HASH NA TABELA USERS
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Adicionar coluna senha_hash (caso não exista)
alter table public.users 
add column if not exists senha_hash text;

-- 2. Tornar a coluna obrigatória após migração
-- (Se você já tem usuários sem senha, migre-os primeiro antes de rodar esta linha)
-- alter table public.users 
-- alter column senha_hash set not null;

-- 3. Verificar estrutura
select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'users' and table_schema = 'public'
order by ordinal_position;

-- 4. Ver usuários (sem mostrar senha)
select id, email, nome, avatar_url, created_at 
from public.users 
order by created_at desc 
limit 10;
