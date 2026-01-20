-- ============================================
-- CORRIGIR ÍNDICE ÚNICO DE FAVORITOS
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. REMOVER índice único antigo (que está causando o conflito)
drop index if exists public.favoritos_unique_idx;

-- 2. CRIAR novo índice único correto
-- Permite mesma empresa favorita por usuários diferentes
-- Mas NÃO permite duplicata do mesmo usuário
create unique index if not exists favoritos_user_item_unique 
on public.favoritos (user_id, tipo, item_id) 
where user_id is not null;

-- Índice para usuários anônimos (por user_identifier)
create unique index if not exists favoritos_identifier_item_unique 
on public.favoritos (user_identifier, tipo, item_id) 
where user_id is null;

-- 3. Criar índices normais para performance
create index if not exists idx_favoritos_user_id on public.favoritos(user_id);
create index if not exists idx_favoritos_user_identifier on public.favoritos(user_identifier);
create index if not exists idx_favoritos_tipo on public.favoritos(tipo);
create index if not exists idx_favoritos_item_id on public.favoritos(item_id);

-- 4. Verificar índices criados
select 
  indexname,
  indexdef
from pg_indexes
where tablename = 'favoritos' and schemaname = 'public';

-- 5. Testar inserção (substitua os valores)
-- delete from public.favoritos where tipo = 'empresa' and item_id = 'seu-empresa-id';
-- insert into public.favoritos (tipo, item_id, user_id, user_identifier)
-- values ('empresa', 'seu-empresa-id', 'seu-user-id', 'seu-identifier');
