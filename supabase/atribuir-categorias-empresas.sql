-- ================================================
-- ATRIBUIR CATEGORIAS ÀS EMPRESAS
-- ================================================

-- 1. Atualizar TODAS as farmácias para categoria "Saúde e Bem-Estar"
UPDATE empresas 
SET categoria_id = (SELECT id FROM categorias WHERE nome = 'Saúde e Bem-Estar' LIMIT 1)
WHERE nome ILIKE '%farmácia%' 
   OR nome ILIKE '%droga%' 
   OR nome ILIKE '%drogaria%';

-- 2. Atualizar "Assistência All-Import" para categoria "Tecnologia, Eletrônicos e Celulares"
UPDATE empresas 
SET categoria_id = (SELECT id FROM categorias WHERE nome = 'Tecnologia, Eletrônicos e Celulares' LIMIT 1)
WHERE nome ILIKE '%assistência%';

-- 3. Verificar resultado
SELECT 
  e.nome as empresa,
  c.nome as categoria,
  c.icone
FROM empresas e
JOIN categorias c ON e.categoria_id = c.id
ORDER BY c.nome, e.nome;

-- 4. Contar empresas por categoria
SELECT 
  c.nome as categoria,
  c.icone,
  COUNT(e.id) as total_empresas
FROM categorias c
LEFT JOIN empresas e ON e.categoria_id = c.id
GROUP BY c.id, c.nome, c.icone
ORDER BY c.nome;
