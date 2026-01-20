-- ================================================
-- INSERIR TODAS AS 20 CATEGORIAS E SUBCATEGORIAS
-- ================================================
-- Este script LIMPA categorias antigas e insere apenas as 20 principais
-- ATENÇÃO: Empresas com categorias antigas precisarão ser recategorizadas!

-- ================================================
-- PASSO 1: LIMPAR CATEGORIAS ANTIGAS (EXCETO AS 20 PRINCIPAIS)
-- ================================================
-- Remove todas categorias que NÃO são as 20 principais
DELETE FROM categorias 
WHERE nome NOT IN (
  'Alimentação e Bebidas',
  'Varejo Alimentar (Mercados)',
  'Saúde e Bem-Estar',
  'Beleza, Estética e Cuidados Pessoais',
  'Moda e Acessórios',
  'Casa, Construção e Decoração',
  'Serviços Residenciais e Manutenção',
  'Automotivo, Transporte e Peças',
  'Tecnologia, Eletrônicos e Celulares',
  'Educação e Cursos',
  'Esportes, Fitness e Lazer',
  'Hotelaria, Turismo e Eventos',
  'Pets e Agro',
  'Serviços Profissionais e B2B',
  'Finanças e Atendimento ao Público',
  'Comunicação, Mídia e Produção',
  'Utilidades e Serviços do Dia a Dia',
  'Comércio de Atacado e Distribuição',
  'Indústria Local e Produção',
  'Serviços Públicos e Comunitários'
);

-- ================================================
-- PASSO 2: MIGRAR EMPRESAS DE CATEGORIAS ANTIGAS
-- ================================================
-- Atualizar empresas que estão em "Farmácia" para "Saúde e Bem-Estar"
UPDATE empresas 
SET categoria_id = (SELECT id FROM categorias WHERE nome = 'Saúde e Bem-Estar')
WHERE categoria_id = (SELECT id FROM categorias WHERE nome = 'Farmácia');

-- Atualizar empresas que estão em "Assistência Técnica" para "Tecnologia"
UPDATE empresas 
SET categoria_id = (SELECT id FROM categorias WHERE nome = 'Tecnologia, Eletrônicos e Celulares')
WHERE categoria_id = (SELECT id FROM categorias WHERE nome = 'Assistência Técnica');

-- ================================================
-- PASSO 3: INSERIR/ATUALIZAR AS 20 CATEGORIAS PRINCIPAIS
-- ================================================

-- ================================================
-- 1. ALIMENTAÇÃO E BEBIDAS
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Alimentação e Bebidas', '🍽️', 'from-orange-500 to-red-500', 1)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 2. VAREJO ALIMENTAR (MERCADOS)
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Varejo Alimentar (Mercados)', '🛒', 'from-green-500 to-emerald-500', 2)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 3. SAÚDE E BEM-ESTAR
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Saúde e Bem-Estar', '⚕️', 'from-blue-500 to-cyan-500', 3)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 4. BELEZA, ESTÉTICA E CUIDADOS PESSOAIS
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Beleza, Estética e Cuidados Pessoais', '💅', 'from-pink-500 to-rose-500', 4)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 5. MODA E ACESSÓRIOS
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Moda e Acessórios', '👗', 'from-purple-500 to-pink-500', 5)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 6. CASA, CONSTRUÇÃO E DECORAÇÃO
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Casa, Construção e Decoração', '🏠', 'from-amber-500 to-orange-500', 6)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 7. SERVIÇOS RESIDENCIAIS E MANUTENÇÃO
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Serviços Residenciais e Manutenção', '🔧', 'from-gray-600 to-gray-700', 7)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 8. AUTOMOTIVO, TRANSPORTE E PEÇAS
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Automotivo, Transporte e Peças', '🚗', 'from-slate-600 to-slate-700', 8)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 9. TECNOLOGIA, ELETRÔNICOS E CELULARES
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Tecnologia, Eletrônicos e Celulares', '💻', 'from-indigo-500 to-blue-500', 9)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 10. EDUCAÇÃO E CURSOS
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Educação e Cursos', '📚', 'from-teal-500 to-green-500', 10)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 11. ESPORTES, FITNESS E LAZER
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Esportes, Fitness e Lazer', '⚽', 'from-lime-500 to-green-600', 11)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 12. HOTELARIA, TURISMO E EVENTOS
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Hotelaria, Turismo e Eventos', '🎉', 'from-fuchsia-500 to-pink-500', 12)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 13. PETS E AGRO
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Pets e Agro', '🐾', 'from-yellow-600 to-amber-600', 13)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 14. SERVIÇOS PROFISSIONAIS E B2B
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Serviços Profissionais e B2B', '💼', 'from-blue-600 to-indigo-600', 14)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 15. FINANÇAS E ATENDIMENTO AO PÚBLICO
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Finanças e Atendimento ao Público', '💰', 'from-emerald-600 to-teal-600', 15)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 16. COMUNICAÇÃO, MÍDIA E PRODUÇÃO
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Comunicação, Mídia e Produção', '📺', 'from-red-600 to-pink-600', 16)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 17. UTILIDADES E SERVIÇOS DO DIA A DIA
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Utilidades e Serviços do Dia a Dia', '🔑', 'from-cyan-600 to-blue-600', 17)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 18. COMÉRCIO DE ATACADO E DISTRIBUIÇÃO
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Comércio de Atacado e Distribuição', '📦', 'from-orange-600 to-red-600', 18)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 19. INDÚSTRIA LOCAL E PRODUÇÃO
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Indústria Local e Produção', '🏭', 'from-gray-700 to-slate-800', 19)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- 20. SERVIÇOS PÚBLICOS E COMUNITÁRIOS
-- ================================================
INSERT INTO categorias (nome, icone, cor, ordem) 
VALUES ('Serviços Públicos e Comunitários', '🏛️', 'from-sky-600 to-blue-700', 20)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem;

-- ================================================
-- VERIFICAÇÃO FINAL
-- ================================================
SELECT 
  id,
  nome,
  icone,
  (SELECT COUNT(*) FROM empresas WHERE categoria_id = categorias.id) as total_empresas
FROM categorias 
ORDER BY nome;
