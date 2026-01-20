-- ============================================
-- CRIAR ADMIN DE TESTE E DEBUG
-- ============================================
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se pgcrypto está habilitado
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Verificar estrutura da tabela admins
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admins' 
ORDER BY ordinal_position;

-- 3. Ver admins existentes (sem mostrar senha_hash por segurança)
SELECT id, email, nome, ativo, data_criacao
FROM admins;

-- 4. CRIAR ADMIN DE TESTE
-- Execute esta linha para criar um admin:
SELECT criar_admin('admin@test.com', '123456', 'Admin Teste');

-- 5. TESTAR LOGIN MANUALMENTE
-- Teste se a função de login funciona:
SELECT * FROM verificar_admin_login('admin@test.com', '123456');

-- 6. Se precisar DELETAR todos os admins e recomeçar:
-- DELETE FROM admins;

-- 7. VERIFICAR HASH DA SENHA
-- Para debug: ver se o hash está sendo criado corretamente
SELECT 
  email, 
  nome,
  (senha_hash = crypt('123456', senha_hash)) as senha_correta,
  length(senha_hash) as tamanho_hash
FROM admins
WHERE email = 'admin@test.com';
