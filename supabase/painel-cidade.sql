-- ============================================
-- TABELAS DO PAINEL DA CIDADE
-- Sistema completo para gerenciar obras, eventos e vagas
-- ============================================

-- TABELA DE OBRAS E INTERDIÇÕES
CREATE TABLE IF NOT EXISTS public.obras_interdicoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(300) NOT NULL,
  descricao TEXT NOT NULL,
  local VARCHAR(300) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('obra', 'interdicao')),
  status VARCHAR(20) NOT NULL DEFAULT 'planejada' CHECK (status IN ('em_andamento', 'concluida', 'planejada')),
  data_inicio DATE NOT NULL,
  data_previsao_fim DATE,
  impacto TEXT,
  responsavel VARCHAR(200) NOT NULL,
  fonte_oficial VARCHAR(300),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA DE AGENDA DE EVENTOS
CREATE TABLE IF NOT EXISTS public.agenda_eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(300) NOT NULL,
  descricao TEXT NOT NULL,
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('prefeitura', 'igreja', 'esporte', 'escola', 'cultura', 'outro')),
  local VARCHAR(300) NOT NULL,
  data_evento DATE NOT NULL,
  horario VARCHAR(50) NOT NULL,
  organizador VARCHAR(200) NOT NULL,
  contato VARCHAR(100),
  imagem TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA DE VAGAS DE EMPREGO
CREATE TABLE IF NOT EXISTS public.vagas_emprego (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(300) NOT NULL,
  empresa VARCHAR(200) NOT NULL,
  descricao TEXT NOT NULL,
  requisitos TEXT NOT NULL,
  salario VARCHAR(100),
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('clt', 'pj', 'estagio', 'temporario', 'freelancer')),
  area VARCHAR(100) NOT NULL,
  local_trabalho VARCHAR(200) NOT NULL,
  contato_email VARCHAR(200),
  contato_telefone VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'encerrada')),
  data_publicacao DATE NOT NULL DEFAULT CURRENT_DATE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_obras_status ON public.obras_interdicoes(status);
CREATE INDEX IF NOT EXISTS idx_obras_tipo ON public.obras_interdicoes(tipo);
CREATE INDEX IF NOT EXISTS idx_obras_data_inicio ON public.obras_interdicoes(data_inicio DESC);

CREATE INDEX IF NOT EXISTS idx_eventos_data ON public.agenda_eventos(data_evento ASC);
CREATE INDEX IF NOT EXISTS idx_eventos_categoria ON public.agenda_eventos(categoria);

CREATE INDEX IF NOT EXISTS idx_vagas_status ON public.vagas_emprego(status);
CREATE INDEX IF NOT EXISTS idx_vagas_tipo ON public.vagas_emprego(tipo);
CREATE INDEX IF NOT EXISTS idx_vagas_area ON public.vagas_emprego(area);
CREATE INDEX IF NOT EXISTS idx_vagas_data_publicacao ON public.vagas_emprego(data_publicacao DESC);

-- Triggers para atualizar atualizado_em
CREATE OR REPLACE FUNCTION update_obras_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_obras_atualizado
  BEFORE UPDATE ON public.obras_interdicoes
  FOR EACH ROW
  EXECUTE FUNCTION update_obras_atualizado_em();

CREATE OR REPLACE FUNCTION update_eventos_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_eventos_atualizado
  BEFORE UPDATE ON public.agenda_eventos
  FOR EACH ROW
  EXECUTE FUNCTION update_eventos_atualizado_em();

CREATE OR REPLACE FUNCTION update_vagas_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vagas_atualizado
  BEFORE UPDATE ON public.vagas_emprego
  FOR EACH ROW
  EXECUTE FUNCTION update_vagas_atualizado_em();

-- Views úteis
CREATE OR REPLACE VIEW obras_em_andamento AS
SELECT * FROM public.obras_interdicoes
WHERE status = 'em_andamento'
ORDER BY data_inicio DESC;

CREATE OR REPLACE VIEW proximos_eventos AS
SELECT * FROM public.agenda_eventos
WHERE data_evento >= CURRENT_DATE
ORDER BY data_evento ASC, horario ASC;

CREATE OR REPLACE VIEW vagas_ativas AS
SELECT * FROM public.vagas_emprego
WHERE status = 'ativa'
ORDER BY data_publicacao DESC;

-- Estatísticas do painel
CREATE OR REPLACE VIEW painel_estatisticas AS
SELECT 
  (SELECT COUNT(*) FROM public.obras_interdicoes WHERE status = 'em_andamento') as obras_andamento,
  (SELECT COUNT(*) FROM public.obras_interdicoes WHERE tipo = 'interdicao' AND status = 'em_andamento') as interdicoes_ativas,
  (SELECT COUNT(*) FROM public.agenda_eventos WHERE data_evento >= CURRENT_DATE) as eventos_futuros,
  (SELECT COUNT(*) FROM public.vagas_emprego WHERE status = 'ativa') as vagas_ativas;

-- Comentários
COMMENT ON TABLE public.obras_interdicoes IS 'Registra obras públicas e interdições na cidade';
COMMENT ON TABLE public.agenda_eventos IS 'Agenda de eventos municipais, religiosos, esportivos e culturais';
COMMENT ON TABLE public.vagas_emprego IS 'Vagas de emprego curadas e parcerias com empresas';

COMMENT ON COLUMN public.obras_interdicoes.tipo IS 'obra (construção/reforma) ou interdicao (bloqueio temporário)';
COMMENT ON COLUMN public.obras_interdicoes.status IS 'em_andamento, concluida ou planejada';
COMMENT ON COLUMN public.agenda_eventos.categoria IS 'prefeitura, igreja, esporte, escola, cultura ou outro';
COMMENT ON COLUMN public.vagas_emprego.tipo IS 'clt, pj, estagio, temporario ou freelancer';

SELECT '✅ Tabelas do Painel da Cidade criadas com sucesso!' AS status;
