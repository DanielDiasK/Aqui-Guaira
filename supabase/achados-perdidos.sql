-- ============================================
-- TABELA DE ACHADOS E PERDIDOS
-- Sistema para cadastro de itens perdidos e encontrados
-- ============================================

CREATE TABLE IF NOT EXISTS public.achados_perdidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('perdido', 'encontrado')),
  status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'recuperado')),
  bairro VARCHAR(200) NOT NULL,
  local_referencia TEXT,
  data_ocorrencia DATE NOT NULL,
  telefone_contato VARCHAR(20) NOT NULL,
  nome_contato VARCHAR(200) NOT NULL,
  imagem TEXT,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_achados_perdidos_tipo ON public.achados_perdidos(tipo);
CREATE INDEX IF NOT EXISTS idx_achados_perdidos_status ON public.achados_perdidos(status);
CREATE INDEX IF NOT EXISTS idx_achados_perdidos_categoria ON public.achados_perdidos(categoria);
CREATE INDEX IF NOT EXISTS idx_achados_perdidos_bairro ON public.achados_perdidos(bairro);
CREATE INDEX IF NOT EXISTS idx_achados_perdidos_user ON public.achados_perdidos(user_id);
CREATE INDEX IF NOT EXISTS idx_achados_perdidos_data ON public.achados_perdidos(data_ocorrencia DESC);

-- Trigger para atualizar atualizado_em
CREATE OR REPLACE FUNCTION update_achados_perdidos_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_achados_perdidos_atualizado
  BEFORE UPDATE ON public.achados_perdidos
  FOR EACH ROW
  EXECUTE FUNCTION update_achados_perdidos_atualizado_em();

-- View para estatísticas
CREATE OR REPLACE VIEW achados_perdidos_stats AS
SELECT 
  COUNT(*) FILTER (WHERE tipo = 'perdido' AND status = 'ativo') as total_perdidos_ativos,
  COUNT(*) FILTER (WHERE tipo = 'encontrado' AND status = 'ativo') as total_encontrados_ativos,
  COUNT(*) FILTER (WHERE status = 'recuperado') as total_recuperados,
  COUNT(*) as total_geral
FROM public.achados_perdidos;

-- Comentários
COMMENT ON TABLE public.achados_perdidos IS 'Tabela para gerenciar itens perdidos e encontrados na cidade';
COMMENT ON COLUMN public.achados_perdidos.tipo IS 'Tipo do registro: perdido (alguém perdeu) ou encontrado (alguém achou)';
COMMENT ON COLUMN public.achados_perdidos.status IS 'Status do item: ativo (ainda não recuperado) ou recuperado (já devolvido)';

SELECT '✅ Tabela achados_perdidos criada com sucesso!' AS status;
