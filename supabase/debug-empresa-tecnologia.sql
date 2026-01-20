-- ================================================
-- VERIFICAR EMPRESA DE TECNOLOGIA
-- ================================================
-- Verificar todas as empresas e suas categorias

SELECT 
  e.id,
  e.nome as empresa,
  e.categoria_id,
  c.nome as categoria_tabela,
  c.icone
FROM empresas e
LEFT JOIN categorias c ON e.categoria_id = c.id
ORDER BY c.nome, e.nome;

-- Verificar especificamente categoria de Tecnologia
SELECT 
  e.id,
  e.nome as empresa,
  e.categoria_id,
  c.nome as categoria_nome,
  c.icone
FROM empresas e
JOIN categorias c ON e.categoria_id = c.id
WHERE c.nome LIKE '%Tecnologia%';

-- Verificar a view empresas_completas
SELECT 
  id,
  nome,
  categoria_id,
  categoria_nome,
  categoria_icone
FROM empresas_completas
WHERE categoria_nome LIKE '%Tecnologia%';
