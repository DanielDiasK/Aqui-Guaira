-- ============================================
-- DEBUG - VERIFICAR EMPRESAS E FAVORITOS
-- Execute este SQL no Supabase SQL Editor para debug
-- ============================================

-- 1. Ver todas as empresas cadastradas (últimas 20)
select 
  id,
  nome,
  cnpj,
  status,
  categoria_id,
  created_at
from public.empresas 
order by created_at desc 
limit 20;

-- 2. Ver empresas com suas categorias
select 
  e.id,
  e.nome as empresa,
  e.status,
  c.nome as categoria,
  e.created_at
from public.empresas e
left join public.categorias c on c.id = e.categoria_id
order by e.created_at desc 
limit 20;

-- 3. Ver empresas aprovadas (que aparecem na view)
select 
  id,
  nome,
  categoria_nome,
  status,
  created_at
from empresas_completas
order by created_at desc
limit 20;

-- 4. Ver todos os favoritos
select 
  f.id,
  f.tipo,
  f.item_id,
  f.user_id,
  f.user_identifier,
  u.email as usuario_email,
  f.created_at
from public.favoritos f
left join public.users u on u.id = f.user_id
order by f.created_at desc
limit 20;

-- 5. Ver favoritos de um usuário específico (substitua o email)
-- select 
--   f.tipo,
--   f.item_id,
--   e.nome as empresa_nome,
--   f.created_at
-- from public.favoritos f
-- left join public.empresas e on e.id = f.item_id and f.tipo = 'empresa'
-- left join public.users u on u.id = f.user_id
-- where u.email = 'seu@email.com'
-- order by f.created_at desc;

-- 6. Contar empresas por status
select status, count(*) as total
from public.empresas
group by status;

-- 7. Ver categorias disponíveis
select id, nome, icone, cor, ordem
from public.categorias
order by ordem, nome;

-- 8. Ver usuários cadastrados (sem senha)
select id, email, nome, created_at
from public.users
order by created_at desc
limit 10;
