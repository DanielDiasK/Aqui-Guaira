-- ============================================
-- ADICIONAR COLUNA SUBCATEGORIAS NA TABELA EMPRESAS
-- ============================================
-- Esta coluna armazena até 3 subcategorias que a empresa escolhe no cadastro
-- Exemplo: ["Farmácias / Drogarias", "Produtos naturais", "Perfumaria"]

-- Adicionar coluna subcategorias como array de texto
ALTER TABLE public.empresas 
ADD COLUMN IF NOT EXISTS subcategorias text[] DEFAULT array[]::text[];

-- Criar índice para busca em subcategorias
CREATE INDEX IF NOT EXISTS empresas_subcategorias_idx ON public.empresas USING GIN(subcategorias);

-- Comentário na coluna
COMMENT ON COLUMN public.empresas.subcategorias IS 'Array com 1 a 3 subcategorias escolhidas pela empresa no cadastro';

-- Recriar view empresas_completas incluindo subcategorias
CREATE OR REPLACE VIEW empresas_completas AS
SELECT 
  e.*,
  c.nome as categoria_nome,
  c.icone as categoria_icone,
  c.cor as categoria_cor
FROM public.empresas e
LEFT JOIN public.categorias c ON c.id = e.categoria_id
WHERE e.status = 'aprovado';

-- Verificar resultado
SELECT 
  table_name, 
  column_name, 
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'empresas' 
  AND column_name = 'subcategorias';

