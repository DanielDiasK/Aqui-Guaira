-- ============================================
-- VERIFICAR FAVORITOS - DEBUG COMPLETO
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Ver estrutura da tabela favoritos
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_name = 'favoritos' and table_schema = 'public'
order by ordinal_position;

-- 2. Ver todos os índices e constraints da tabela favoritos
select 
  indexname,
  indexdef
from pg_indexes
where tablename = 'favoritos' and schemaname = 'public';

-- 3. Ver constraints (incluindo unique)
select 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.favoritos'::regclass;

-- 4. Ver todos os favoritos existentes
select 
  id,
  tipo,
  item_id,
  user_id,
  user_identifier,
  created_at
from public.favoritos
order by created_at desc;

-- 5. Contar favoritos por tipo
select tipo, count(*) as total
from public.favoritos
group by tipo;

-- 6. Ver usuários e seus favoritos
select 
  u.email,
  count(f.id) as total_favoritos
from public.users u
left join public.favoritos f on f.user_id = u.id
group by u.email;

-- 7. Verificar se existe índice único bloqueando
-- Este é provavelmente o problema
select 
  i.relname as index_name,
  a.attname as column_name
from pg_index ix
join pg_class i on i.oid = ix.indexrelid
join pg_class t on t.oid = ix.indrelid
join pg_attribute a on a.attrelid = t.oid and a.attnum = any(ix.indkey)
where t.relname = 'favoritos'
  and i.relname like '%unique%';
