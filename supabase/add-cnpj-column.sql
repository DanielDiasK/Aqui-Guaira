-- ============================================
-- ADICIONAR COLUNA CNPJ NA TABELA EMPRESAS
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Adicionar coluna CNPJ
alter table public.empresas 
add column if not exists cnpj varchar(18) unique;

-- Adicionar comentário
comment on column public.empresas.cnpj is 'CNPJ da empresa (formato: 00.000.000/0000-00)';

-- Criar índice para busca rápida por CNPJ
create index if not exists idx_empresas_cnpj on public.empresas(cnpj);

-- 2. Recriar a view empresas_completas para incluir CNPJ
drop view if exists empresas_completas;

create or replace view empresas_completas as
select 
  e.*,
  c.nome as categoria_nome,
  c.icone as categoria_icone,
  c.cor as categoria_cor
from public.empresas e
left join public.categorias c on c.id = e.categoria_id
where e.status = 'aprovado';

-- 3. Verificar se a coluna foi criada
select column_name, data_type, character_maximum_length, is_nullable
from information_schema.columns
where table_name = 'empresas' and column_name = 'cnpj';

-- 4. Ver empresas cadastradas (para debug)
select id, nome, cnpj, status, created_at 
from public.empresas 
order by created_at desc 
limit 10;

