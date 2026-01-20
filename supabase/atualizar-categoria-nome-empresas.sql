-- ================================================
-- ATUALIZAR categoria_nome DAS EMPRESAS
-- ================================================
-- Este script sincroniza o campo categoria_nome das empresas
-- com o nome real da categoria na tabela categorias

-- Verificar empresas com categoria_nome desatualizado
SELECT 
  e.id,
  e.nome as empresa,
  e.categoria_nome as categoria_atual,
  c.nome as categoria_correta
FROM empresas e
LEFT JOIN categorias c ON e.categoria_id = c.id
WHERE e.categoria_nome != c.nome OR e.categoria_nome IS NULL;

-- Atualizar todas as empresas para terem o categoria_nome correto
UPDATE empresas e
SET categoria_nome = c.nome
FROM categorias c
WHERE e.categoria_id = c.id;

-- Verificação final
SELECT 
  e.id,
  e.nome as empresa,
  e.categoria_nome,
  c.nome as categoria_tabela
FROM empresas e
LEFT JOIN categorias c ON e.categoria_id = c.id
ORDER BY c.nome, e.nome;
