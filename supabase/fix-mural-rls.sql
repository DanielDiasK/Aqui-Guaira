-- Fix RLS para mural_posts e outras tabelas
-- Como o sistema usa autenticação customizada (não Supabase Auth),
-- desabilitamos RLS e usamos a role anon com permissões controladas

-- DESABILITAR RLS completamente (já que não usamos Supabase Auth)
ALTER TABLE mural_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas antigas de mural_posts
DROP POLICY IF EXISTS "Usuários podem criar posts" ON mural_posts;
DROP POLICY IF EXISTS "Posts aprovados são públicos" ON mural_posts;
DROP POLICY IF EXISTS "Usuários veem seus posts" ON mural_posts;
DROP POLICY IF EXISTS "Admins veem todos posts" ON mural_posts;
DROP POLICY IF EXISTS "Admins podem atualizar posts" ON mural_posts;
DROP POLICY IF EXISTS "Admins podem deletar posts" ON mural_posts;

-- Remover a constraint de foreign key problemática
ALTER TABLE mural_posts DROP CONSTRAINT IF EXISTS mural_posts_admin_aprovador_id_fkey;

-- Tornar admin_aprovador_id nullable e sem constraint (apenas UUID simples)
ALTER TABLE mural_posts ALTER COLUMN admin_aprovador_id DROP NOT NULL;

-- Conceder permissões diretas para mural_posts
GRANT SELECT, INSERT, UPDATE, DELETE ON mural_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON mural_posts TO authenticated;

-- Conceder permissões diretas para empresas
GRANT SELECT, INSERT, UPDATE, DELETE ON empresas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON empresas TO authenticated;

-- Conceder permissões diretas para admin_logs
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_logs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_logs TO authenticated;

-- Verificar que RLS está desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('mural_posts', 'empresas', 'admin_logs');
