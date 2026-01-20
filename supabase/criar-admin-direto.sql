-- Criar admin direto no banco de dados
-- Email: admin@admin.com
-- Senha: admin

-- Ativar extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Inserir admin diretamente
INSERT INTO public.admins (email, senha_hash, nome, ativo)
VALUES (
  'admin@admin.com',
  crypt('admin', gen_salt('bf')),
  'Administrador',
  TRUE
)
ON CONFLICT (email) DO UPDATE SET
  senha_hash = crypt('admin', gen_salt('bf')),
  nome = 'Administrador',
  ativo = TRUE;

-- Verificar se foi criado
SELECT id, email, nome, ativo, data_criacao 
FROM public.admins 
WHERE email = 'admin@admin.com';
