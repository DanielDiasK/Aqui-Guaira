-- ============================================================================
-- CRIAR BUCKETS DE STORAGE PARA IMAGENS
-- ============================================================================
-- Este script cria os buckets necessários no Supabase Storage
-- Execute no SQL Editor do Supabase
-- ============================================================================

-- Criar bucket para imagens de empresas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'empresas-images',
  'empresas-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Criar bucket para imagens de posts do mural
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts-images',
  'posts-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Criar bucket para imagens de locais
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'locais-images',
  'locais-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- ============================================================================
-- REMOVER POLÍTICAS ANTIGAS (SE EXISTIREM)
-- ============================================================================

DROP POLICY IF EXISTS "Empresas images - Public read" ON storage.objects;
DROP POLICY IF EXISTS "Empresas images - Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Empresas images - Owner delete" ON storage.objects;
DROP POLICY IF EXISTS "Posts images - Public read" ON storage.objects;
DROP POLICY IF EXISTS "Posts images - Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Posts images - Owner delete" ON storage.objects;
DROP POLICY IF EXISTS "Locais images - Public read" ON storage.objects;
DROP POLICY IF EXISTS "Locais images - Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Locais images - Owner delete" ON storage.objects;

-- ============================================================================
-- POLÍTICAS DE ACESSO (RLS) PARA OS BUCKETS
-- ============================================================================

-- EMPRESAS-IMAGES: Acesso público para leitura e upload
CREATE POLICY "Empresas images - Public access"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'empresas-images')
WITH CHECK (bucket_id = 'empresas-images');

-- POSTS-IMAGES: Acesso público para leitura e upload
CREATE POLICY "Posts images - Public access"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'posts-images')
WITH CHECK (bucket_id = 'posts-images');

-- LOCAIS-IMAGES: Acesso público para leitura e upload
CREATE POLICY "Locais images - Public access"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'locais-images')
WITH CHECK (bucket_id = 'locais-images');

-- ============================================================================
-- VERIFICAR BUCKETS CRIADOS
-- ============================================================================

SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id IN ('empresas-images', 'posts-images', 'locais-images')
ORDER BY id;

-- ============================================================================
-- INSTRUÇÕES
-- ============================================================================
-- 1. Copie este script completo
-- 2. Vá ao Supabase Dashboard > SQL Editor
-- 3. Cole e execute o script
-- 4. Verifique se os 3 buckets foram criados com sucesso
-- ============================================================================
