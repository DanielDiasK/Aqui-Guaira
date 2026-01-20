-- ============================================
-- REMOVER COLUNA ultimo_acesso DA TABELA ADMINS
-- ============================================
-- Execute este script no Supabase SQL Editor para corrigir o erro
-- "column ultimo_acesso of relation admins does not exist"

-- Remover coluna ultimo_acesso se existir
ALTER TABLE admins 
DROP COLUMN IF EXISTS ultimo_acesso;

-- Verificar estrutura da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admins' 
ORDER BY ordinal_position;
