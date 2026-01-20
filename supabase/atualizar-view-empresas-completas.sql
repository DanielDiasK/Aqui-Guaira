-- ============================================
-- ATUALIZAR VIEW EMPRESAS_COMPLETAS COM SUBCATEGORIAS
-- ============================================
-- Execute este script para garantir que a view inclui subcategorias

-- Recriar a view empresas_completas incluindo TODAS as colunas
DROP VIEW IF EXISTS empresas_completas;

CREATE OR REPLACE VIEW empresas_completas AS
SELECT 
  e.id,
  e.cnpj,
  e.nome,
  e.slug,
  e.descricao,
  e.categoria_id,
  e.subcategorias,  -- ← CAMPO SUBCATEGORIAS
  e.endereco,
  e.bairro,
  e.cidade,
  e.estado,
  e.cep,
  e.latitude,
  e.longitude,
  e.location,
  e.telefone,
  e.whatsapp,
  e.email,
  e.site,
  e.instagram,
  e.facebook,
  e.horarios,
  e.imagens,
  e.logo,
  e.status,
  e.verificado,
  e.destaque,
  e.visualizacoes,
  e.responsavel_nome,
  e.responsavel_email,
  e.responsavel_telefone,
  e.created_at,
  e.updated_at,
  c.nome as categoria_nome,
  c.icone as categoria_icone,
  c.cor as categoria_cor
FROM public.empresas e
LEFT JOIN public.categorias c ON c.id = e.categoria_id
WHERE e.status = 'aprovado';

-- Verificar se a view foi criada corretamente
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'empresas_completas' 
  AND column_name IN ('subcategorias', 'categoria_nome')
ORDER BY column_name;

-- Testar a view com a empresa All-Import
SELECT 
  nome,
  categoria_nome,
  subcategorias,
  array_length(subcategorias, 1) as qtd_subcategorias
FROM empresas_completas
WHERE nome ILIKE '%all%import%'
ORDER BY nome;
