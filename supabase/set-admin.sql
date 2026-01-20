-- IMPORTANTE: Execute o arquivo admin-system.sql PRIMEIRO!
-- Depois execute este arquivo

-- Ativar extensão pgcrypto (necessária para criptografia de senha)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar admin padrão: admin@admin.com / senha: admin
SELECT criar_admin('admin@admin.com', 'admin', 'Administrador');

-- Verificar se foi criado
SELECT id, email, nome, ativo, data_criacao 
FROM admins 
WHERE email = 'admin@admin.com';
