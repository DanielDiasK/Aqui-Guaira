-- ============================================================================
-- ADICIONAR CAMPO LINK DO GOOGLE MAPS
-- ============================================================================
-- Este script adiciona o campo para salvar o link do Google Maps da empresa
-- Execute no SQL Editor do Supabase
-- ============================================================================

-- Adicionar coluna link_google_maps
ALTER TABLE public.empresas 
ADD COLUMN IF NOT EXISTS link_google_maps TEXT;

-- Comentário na coluna
COMMENT ON COLUMN public.empresas.link_google_maps IS 'Link da localização da empresa no Google Maps';

-- Atualizar a view empresas_completas para incluir o novo campo
DROP VIEW IF EXISTS empresas_completas;

CREATE OR REPLACE VIEW empresas_completas AS
SELECT 
  e.id,
  e.cnpj,
  e.nome,
  e.slug,
  e.descricao,
  e.categoria_id,
  e.subcategorias,
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
  e.link_google_maps,  -- ← NOVO CAMPO
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

-- Verificar se a coluna foi adicionada
SELECT 
  column_name, 
  data_type,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'empresas' 
  AND column_name = 'link_google_maps';

SELECT '✅ Campo link_google_maps adicionado com sucesso!' AS status;
