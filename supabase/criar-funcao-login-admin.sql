-- Criar função de verificação de login do admin
-- Esta função é necessária para o sistema de autenticação

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Deletar função antiga (se existir)
DROP FUNCTION IF EXISTS verificar_admin_login(text, text);

-- Função para verificar login do admin
CREATE OR REPLACE FUNCTION verificar_admin_login(
  admin_email TEXT,
  admin_senha TEXT
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  nome TEXT,
  ativo BOOLEAN,
  sucesso BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.email,
    a.nome,
    a.ativo,
    (a.senha_hash = crypt(admin_senha, a.senha_hash) AND a.ativo = TRUE) as sucesso
  FROM public.admins a
  WHERE a.email = admin_email
  LIMIT 1;
  
  -- Se não encontrou nenhum admin
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      NULL::UUID as id,
      NULL::TEXT as email,
      NULL::TEXT as nome,
      FALSE as ativo,
      FALSE as sucesso;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Testar a função
SELECT * FROM verificar_admin_login('admin@admin.com', 'admin');
