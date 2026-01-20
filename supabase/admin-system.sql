-- ============================================
-- SISTEMA DE ADMINISTRAÇÃO COMPLETO
-- ============================================

-- 0. Habilitar extensão pgcrypto (necessária para crypt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Criar tabela de admins com senha própria
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT NOW()
);

-- 2. Adicionar colunas de status nas empresas
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS ativa BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS data_cadastro TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS motivo_bloqueio TEXT;

-- 3. Criar tabela de posts do mural (se não existir)
CREATE TABLE IF NOT EXISTS mural_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  imagem TEXT,
  aprovado BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_aprovacao TIMESTAMP,
  admin_aprovador_id UUID REFERENCES users(id),
  motivo_rejeicao TEXT,
  visualizacoes INTEGER DEFAULT 0
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_empresas_ativa ON empresas(ativa);
CREATE INDEX IF NOT EXISTS idx_mural_aprovado ON mural_posts(aprovado);
CREATE INDEX IF NOT EXISTS idx_mural_empresa ON mural_posts(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresas_data_cadastro ON empresas(data_cadastro DESC);

-- 5. Criar tabela de logs de ações admin
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id) NOT NULL,
  acao TEXT NOT NULL, -- 'aprovar_post', 'rejeitar_post', 'bloquear_empresa', 'desbloquear_empresa', etc
  entidade_tipo TEXT NOT NULL, -- 'empresa', 'post', 'usuario'
  entidade_id UUID NOT NULL,
  detalhes JSONB,
  data_acao TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_data ON admin_logs(data_acao DESC);

-- 6. Criar view para estatísticas do admin
CREATE OR REPLACE VIEW admin_estatisticas AS
SELECT 
  (SELECT COUNT(*) FROM empresas WHERE ativa = TRUE) as empresas_ativas,
  (SELECT COUNT(*) FROM empresas WHERE ativa = FALSE) as empresas_bloqueadas,
  (SELECT COUNT(*) FROM empresas) as total_empresas,
  (SELECT COUNT(*) FROM mural_posts WHERE aprovado = FALSE) as posts_pendentes,
  (SELECT COUNT(*) FROM mural_posts WHERE aprovado = TRUE) as posts_aprovados,
  (SELECT COUNT(*) FROM users) as total_usuarios,
  (SELECT COUNT(*) FROM users WHERE is_admin = TRUE) as total_admins;

-- 7. Atualizar RLS (Row Level Security) para empresas
-- Apenas empresas ativas são visíveis publicamente
DROP POLICY IF EXISTS "Empresas ativas são visíveis para todos" ON empresas;
CREATE POLICY "Empresas ativas são visíveis para todos"
ON empresas FOR SELECT
USING (ativa = TRUE OR auth.uid() IN (SELECT id FROM users WHERE is_admin = TRUE));

-- Admins podem ver todas as empresas
DROP POLICY IF EXISTS "Admins podem ver todas empresas" ON empresas;
CREATE POLICY "Admins podem ver todas empresas"
ON empresas FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = TRUE));

-- Admins podem atualizar qualquer empresa
DROP POLICY IF EXISTS "Admins podem atualizar empresas" ON empresas;
CREATE POLICY "Admins podem atualizar empresas"
ON empresas FOR UPDATE
TO authenticated
USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = TRUE))
WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE is_admin = TRUE));

-- 8. RLS para posts do mural
ALTER TABLE mural_posts ENABLE ROW LEVEL SECURITY;

-- Posts aprovados são visíveis para todos
DROP POLICY IF EXISTS "Posts aprovados são públicos" ON mural_posts;
CREATE POLICY "Posts aprovados são públicos"
ON mural_posts FOR SELECT
USING (aprovado = TRUE);

-- Usuários podem ver seus próprios posts
DROP POLICY IF EXISTS "Usuários veem seus posts" ON mural_posts;
CREATE POLICY "Usuários veem seus posts"
ON mural_posts FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Usuários podem criar posts
DROP POLICY IF EXISTS "Usuários podem criar posts" ON mural_posts;
CREATE POLICY "Usuários podem criar posts"
ON mural_posts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Admins podem ver todos os posts
DROP POLICY IF EXISTS "Admins veem todos posts" ON mural_posts;
CREATE POLICY "Admins veem todos posts"
ON mural_posts FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = TRUE));

-- Admins podem atualizar posts (aprovar/rejeitar)
DROP POLICY IF EXISTS "Admins podem atualizar posts" ON mural_posts;
CREATE POLICY "Admins podem atualizar posts"
ON mural_posts FOR UPDATE
TO authenticated
USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = TRUE))
WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE is_admin = TRUE));

-- Admins podem deletar posts
DROP POLICY IF EXISTS "Admins podem deletar posts" ON mural_posts;
CREATE POLICY "Admins podem deletar posts"
ON mural_posts FOR DELETE
TO authenticated
USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = TRUE));

-- 9. RLS para admin_logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem ver logs" ON admin_logs;
CREATE POLICY "Admins podem ver logs"
ON admin_logs FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = TRUE));

DROP POLICY IF EXISTS "Admins podem criar logs" ON admin_logs;
CREATE POLICY "Admins podem criar logs"
ON admin_logs FOR INSERT
TO authenticated
WITH CHECK (admin_id = auth.uid() AND auth.uid() IN (SELECT id FROM users WHERE is_admin = TRUE));

-- 10. RLS para tabela admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins podem ver seus próprios dados
DROP POLICY IF EXISTS "Admins podem ver seus dados" ON admins;
CREATE POLICY "Admins podem ver seus dados"
ON admins FOR SELECT
USING (TRUE); -- Permitir leitura para verificar login

-- 11. Função para criar admin com senha
-- EXEMPLO: SELECT criar_admin('admin@email.com', 'senha123', 'Nome Admin');
CREATE OR REPLACE FUNCTION criar_admin(
  admin_email TEXT,
  admin_senha TEXT,
  admin_nome TEXT
)
RETURNS TEXT AS $$
DECLARE
  senha_hash TEXT;
BEGIN
  -- Criar hash da senha (usando crypt do pgcrypto)
  senha_hash := crypt(admin_senha, gen_salt('bf'));
  
  -- Inserir admin
  INSERT INTO admins (email, senha_hash, nome)
  VALUES (admin_email, senha_hash, admin_nome);
  
  RETURN 'Admin ' || admin_email || ' criado com sucesso!';
EXCEPTION
  WHEN unique_violation THEN
    RETURN 'Admin com este email já existe!';
  WHEN OTHERS THEN
    RETURN 'Erro ao criar admin: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Função para verificar login do admin
CREATE OR REPLACE FUNCTION verificar_admin_login(
  admin_email TEXT,
  admin_senha TEXT
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  nome TEXT,
  sucesso BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.email,
    a.nome,
    (a.senha_hash = crypt(admin_senha, a.senha_hash)) as sucesso
  FROM admins a
  WHERE a.email = admin_email AND a.ativo = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Função para aprovar post do mural
CREATE OR REPLACE FUNCTION aprovar_post_mural(
  post_id UUID,
  admin_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se é admin
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = admin_user_id AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Usuário não é administrador';
  END IF;
  
  -- Aprovar post
  UPDATE mural_posts 
  SET 
    aprovado = TRUE,
    data_aprovacao = NOW(),
    admin_aprovador_id = admin_user_id
  WHERE id = post_id;
  
  -- Registrar log
  INSERT INTO admin_logs (admin_id, acao, entidade_tipo, entidade_id, detalhes)
  VALUES (admin_user_id, 'aprovar_post', 'post', post_id, jsonb_build_object('aprovado', true));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Função para rejeitar post do mural
CREATE OR REPLACE FUNCTION rejeitar_post_mural(
  post_id UUID,
  admin_user_id UUID,
  motivo TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se é admin
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = admin_user_id AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Usuário não é administrador';
  END IF;
  
  -- Rejeitar post
  UPDATE mural_posts 
  SET 
    motivo_rejeicao = motivo
  WHERE id = post_id;
  
  -- Registrar log
  INSERT INTO admin_logs (admin_id, acao, entidade_tipo, entidade_id, detalhes)
  VALUES (admin_user_id, 'rejeitar_post', 'post', post_id, jsonb_build_object('motivo', motivo));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Função para bloquear empresa
CREATE OR REPLACE FUNCTION bloquear_empresa(
  empresa_id UUID,
  admin_user_id UUID,
  motivo TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se é admin
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = admin_user_id AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Usuário não é administrador';
  END IF;
  
  -- Bloquear empresa
  UPDATE empresas 
  SET 
    ativa = FALSE,
    motivo_bloqueio = motivo
  WHERE id = empresa_id;
  
  -- Registrar log
  INSERT INTO admin_logs (admin_id, acao, entidade_tipo, entidade_id, detalhes)
  VALUES (admin_user_id, 'bloquear_empresa', 'empresa', empresa_id, jsonb_build_object('motivo', motivo));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Função para desbloquear empresa
CREATE OR REPLACE FUNCTION desbloquear_empresa(
  empresa_id UUID,
  admin_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se é admin
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = admin_user_id AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Usuário não é administrador';
  END IF;
  
  -- Desbloquear empresa
  UPDATE empresas 
  SET 
    ativa = TRUE,
    motivo_bloqueio = NULL
  WHERE id = empresa_id;
  
  -- Registrar log
  INSERT INTO admin_logs (admin_id, acao, entidade_tipo, entidade_id, detalhes)
  VALUES (admin_user_id, 'desbloquear_empresa', 'empresa', empresa_id, jsonb_build_object('desbloqueado', true));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INSTRUÇÕES DE USO
-- ============================================
-- 
-- 1. Execute este script no Supabase SQL Editor
-- 
-- 2. Para tornar seu usuário admin, execute:
--    SELECT tornar_admin('seu_email@exemplo.com');
-- 
-- 3. As empresas agora têm status 'ativa' (true/false)
-- 
-- 4. Posts do mural precisam ser aprovados por admin
-- 
-- 5. Todas as ações ficam registradas na tabela admin_logs
-- 
-- ============================================

COMMENT ON TABLE admin_logs IS 'Registro de todas as ações administrativas';
COMMENT ON TABLE mural_posts IS 'Posts do mural que precisam aprovação admin';
COMMENT ON COLUMN empresas.ativa IS 'Se FALSE, empresa fica oculta do site';
COMMENT ON COLUMN users.is_admin IS 'Indica se usuário tem privilégios administrativos';
