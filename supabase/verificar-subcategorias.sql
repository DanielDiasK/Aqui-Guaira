-- ============================================
-- VERIFICAR SUBCATEGORIAS DAS EMPRESAS
-- ============================================
-- Execute este script para ver se as subcategorias estão sendo salvas

-- Ver todas as empresas com suas subcategorias
SELECT 
  id,
  nome,
  categoria_id,
  subcategorias,
  array_length(subcategorias, 1) as qtd_subcategorias,
  status
FROM public.empresas
ORDER BY nome;

-- Ver especificamente empresas com subcategorias cadastradas
SELECT 
  nome,
  subcategorias,
  status
FROM public.empresas
WHERE subcategorias IS NOT NULL 
  AND array_length(subcategorias, 1) > 0
ORDER BY nome;

-- Contar empresas com e sem subcategorias
SELECT 
  CASE 
    WHEN subcategorias IS NULL OR array_length(subcategorias, 1) = 0 THEN 'Sem subcategorias'
    ELSE 'Com subcategorias'
  END as status,
  COUNT(*) as total
FROM public.empresas
GROUP BY 
  CASE 
    WHEN subcategorias IS NULL OR array_length(subcategorias, 1) = 0 THEN 'Sem subcategorias'
    ELSE 'Com subcategorias'
  END;

-- Buscar empresa específica (All Import)
SELECT 
  nome,
  categoria_id,
  subcategorias,
  status
FROM public.empresas
WHERE nome ILIKE '%all%import%' OR nome ILIKE '%allimport%'
ORDER BY nome;
