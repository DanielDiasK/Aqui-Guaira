-- ============================================
-- TABELA DE PETS PERDIDOS E ADOÇÃO
-- Sistema para cadastro de pets perdidos, encontrados e para adoção
-- ============================================

CREATE TABLE IF NOT EXISTS public.pets_perdidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('cachorro', 'gato', 'outro')),
  raca VARCHAR(200),
  cor VARCHAR(100) NOT NULL,
  porte VARCHAR(20) CHECK (porte IN ('pequeno', 'medio', 'grande')),
  idade_aproximada VARCHAR(100),
  descricao TEXT NOT NULL,
  categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('perdido', 'encontrado', 'adocao')),
  status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'resolvido')),
  bairro VARCHAR(200) NOT NULL,
  local_referencia TEXT,
  data_ocorrencia DATE NOT NULL,
  telefone_contato VARCHAR(20) NOT NULL,
  whatsapp_contato VARCHAR(20),
  nome_contato VARCHAR(200) NOT NULL,
  caracteristicas_especiais TEXT,
  imagem TEXT,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pets_perdidos_tipo ON public.pets_perdidos(tipo);
CREATE INDEX IF NOT EXISTS idx_pets_perdidos_categoria ON public.pets_perdidos(categoria);
CREATE INDEX IF NOT EXISTS idx_pets_perdidos_status ON public.pets_perdidos(status);
CREATE INDEX IF NOT EXISTS idx_pets_perdidos_bairro ON public.pets_perdidos(bairro);
CREATE INDEX IF NOT EXISTS idx_pets_perdidos_user ON public.pets_perdidos(user_id);
CREATE INDEX IF NOT EXISTS idx_pets_perdidos_data ON public.pets_perdidos(data_ocorrencia DESC);

-- Trigger para atualizar atualizado_em
CREATE OR REPLACE FUNCTION update_pets_perdidos_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pets_perdidos_atualizado
  BEFORE UPDATE ON public.pets_perdidos
  FOR EACH ROW
  EXECUTE FUNCTION update_pets_perdidos_atualizado_em();

-- View para estatísticas
CREATE OR REPLACE VIEW pets_perdidos_stats AS
SELECT 
  COUNT(*) FILTER (WHERE categoria = 'perdido' AND status = 'ativo') as total_perdidos_ativos,
  COUNT(*) FILTER (WHERE categoria = 'encontrado' AND status = 'ativo') as total_encontrados_ativos,
  COUNT(*) FILTER (WHERE categoria = 'adocao' AND status = 'ativo') as total_adocao_ativos,
  COUNT(*) FILTER (WHERE status = 'resolvido') as total_resolvidos,
  COUNT(*) FILTER (WHERE tipo = 'cachorro') as total_cachorros,
  COUNT(*) FILTER (WHERE tipo = 'gato') as total_gatos,
  COUNT(*) as total_geral
FROM public.pets_perdidos;

-- View para pets com informações completas
CREATE OR REPLACE VIEW pets_com_contato AS
SELECT 
  p.*,
  u.nome as usuario_nome,
  u.email as usuario_email
FROM public.pets_perdidos p
INNER JOIN public.users u ON u.id = p.user_id
WHERE p.status = 'ativo'
ORDER BY p.criado_em DESC;

-- Comentários
COMMENT ON TABLE public.pets_perdidos IS 'Tabela para gerenciar pets perdidos, encontrados e disponíveis para adoção';
COMMENT ON COLUMN public.pets_perdidos.tipo IS 'Tipo do animal: cachorro, gato ou outro';
COMMENT ON COLUMN public.pets_perdidos.categoria IS 'perdido (dono procura), encontrado (alguém achou), adocao (disponível)';
COMMENT ON COLUMN public.pets_perdidos.status IS 'ativo (ainda procurando/disponível) ou resolvido (encontrado/adotado)';
COMMENT ON COLUMN public.pets_perdidos.porte IS 'Tamanho do animal: pequeno, medio ou grande';

SELECT '✅ Tabela pets_perdidos criada com sucesso!' AS status;
