-- ============================================
-- SISTEMA DE PLANTÃO DE FARMÁCIAS
-- Estrutura completa para gerenciar escalas de plantão
-- ============================================

-- Tabela principal de escalas de plantão
CREATE TABLE IF NOT EXISTS public.plantao_escala (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmacia_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('noite', '24h', 'diurno')),
  fonte TEXT, -- Nome da fonte (ex: "Prefeitura de Guaíra", "Sindicato das Farmácias")
  url_fonte TEXT, -- URL da fonte oficial
  observacoes TEXT,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID, -- ID do admin que cadastrou
  
  -- Constraint para evitar conflitos de datas
  CONSTRAINT periodo_valido CHECK (data_fim >= data_inicio)
);

-- Tabela de mudanças emergenciais (sobrescreve a escala normal)
CREATE TABLE IF NOT EXISTS public.plantao_override (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmacia_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('noite', '24h', 'diurno', 'fechado')),
  motivo TEXT NOT NULL, -- Ex: "Feriado", "Manutenção emergencial", "Substituição"
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_plantao_escala_datas ON public.plantao_escala(data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_plantao_escala_farmacia ON public.plantao_escala(farmacia_id);
CREATE INDEX IF NOT EXISTS idx_plantao_override_data ON public.plantao_override(data);
CREATE INDEX IF NOT EXISTS idx_plantao_override_farmacia ON public.plantao_override(farmacia_id);

-- View para resolver qual farmácia está de plantão AGORA
CREATE OR REPLACE VIEW plantao_hoje AS
SELECT DISTINCT ON (e.id)
  e.id AS farmacia_id,
  e.nome AS farmacia_nome,
  e.endereco,
  e.bairro,
  e.telefone,
  e.whatsapp,
  e.latitude,
  e.longitude,
  COALESCE(po.tipo, pe.tipo) AS tipo_plantao,
  COALESCE(po.motivo, 'Plantão normal') AS status,
  pe.fonte,
  pe.url_fonte,
  GREATEST(
    COALESCE(po.atualizado_em, '1970-01-01'::timestamp),
    COALESCE(pe.atualizado_em, '1970-01-01'::timestamp)
  ) AS ultima_atualizacao,
  CASE 
    WHEN po.id IS NOT NULL THEN TRUE 
    ELSE FALSE 
  END AS tem_override
FROM public.empresas e
INNER JOIN public.categorias c ON c.id = e.categoria_id
LEFT JOIN public.plantao_escala pe ON 
  pe.farmacia_id = e.id 
  AND CURRENT_DATE BETWEEN pe.data_inicio AND pe.data_fim
LEFT JOIN public.plantao_override po ON 
  po.farmacia_id = e.id 
  AND po.data = CURRENT_DATE
WHERE 
  c.nome = 'Farmácia'
  AND e.status = 'aprovado'
  AND e.ativa = TRUE
  AND (
    po.tipo IN ('noite', '24h', 'diurno')
    OR (po.id IS NULL AND pe.tipo IN ('noite', '24h', 'diurno'))
  )
ORDER BY e.id, tem_override DESC;

-- View para histórico de plantões (últimos 30 dias)
CREATE OR REPLACE VIEW plantao_historico AS
SELECT 
  e.id AS farmacia_id,
  e.nome AS farmacia_nome,
  pe.data_inicio,
  pe.data_fim,
  pe.tipo,
  pe.fonte,
  pe.url_fonte,
  pe.atualizado_em
FROM public.plantao_escala pe
INNER JOIN public.empresas e ON e.id = pe.farmacia_id
WHERE pe.data_fim >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY pe.data_inicio DESC;

-- View para próximos plantões (próximos 7 dias)
CREATE OR REPLACE VIEW plantao_proximos AS
SELECT 
  e.id AS farmacia_id,
  e.nome AS farmacia_nome,
  e.endereco,
  e.bairro,
  e.telefone,
  pe.data_inicio,
  pe.data_fim,
  pe.tipo,
  pe.fonte
FROM public.plantao_escala pe
INNER JOIN public.empresas e ON e.id = pe.farmacia_id
WHERE 
  pe.data_inicio BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  AND e.status = 'aprovado'
  AND e.ativa = TRUE
ORDER BY pe.data_inicio;

-- Função para inserir plantão (com validação)
CREATE OR REPLACE FUNCTION inserir_plantao_escala(
  p_farmacia_id UUID,
  p_data_inicio DATE,
  p_data_fim DATE,
  p_tipo TEXT,
  p_fonte TEXT DEFAULT NULL,
  p_url_fonte TEXT DEFAULT NULL,
  p_observacoes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_plantao_id UUID;
BEGIN
  -- Validar se a farmácia existe e está ativa
  IF NOT EXISTS (
    SELECT 1 FROM public.empresas e
    INNER JOIN public.categorias c ON c.id = e.categoria_id
    WHERE e.id = p_farmacia_id 
      AND c.nome = 'Farmácia'
      AND e.status = 'aprovado'
  ) THEN
    RAISE EXCEPTION 'Farmácia não encontrada ou não está ativa';
  END IF;

  -- Inserir plantão
  INSERT INTO public.plantao_escala (
    farmacia_id, data_inicio, data_fim, tipo, fonte, url_fonte, observacoes
  ) VALUES (
    p_farmacia_id, p_data_inicio, p_data_fim, p_tipo, p_fonte, p_url_fonte, p_observacoes
  )
  RETURNING id INTO v_plantao_id;

  RETURN v_plantao_id;
END;
$$ LANGUAGE plpgsql;

-- Função para inserir override emergencial
CREATE OR REPLACE FUNCTION inserir_plantao_override(
  p_farmacia_id UUID,
  p_data DATE,
  p_tipo TEXT,
  p_motivo TEXT
)
RETURNS UUID AS $$
DECLARE
  v_override_id UUID;
BEGIN
  -- Remover override antigo para a mesma data (se existir)
  DELETE FROM public.plantao_override 
  WHERE farmacia_id = p_farmacia_id AND data = p_data;

  -- Inserir novo override
  INSERT INTO public.plantao_override (
    farmacia_id, data, tipo, motivo
  ) VALUES (
    p_farmacia_id, p_data, p_tipo, p_motivo
  )
  RETURNING id INTO v_override_id;

  RETURN v_override_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_plantao_escala_atualizado
  BEFORE UPDATE ON public.plantao_escala
  FOR EACH ROW
  EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_plantao_override_atualizado
  BEFORE UPDATE ON public.plantao_override
  FOR EACH ROW
  EXECUTE FUNCTION update_atualizado_em();

-- ============================================
-- DADOS INICIAIS DE EXEMPLO
-- ============================================

-- Exemplo: Definir plantão para próximos 7 dias
-- (Você deve adaptar com os IDs reais das farmácias)

-- Comentário: Execute este bloco após ter as farmácias cadastradas
/*
DO $$
DECLARE
  v_farmacia_anjo_da_guarda UUID;
  v_farmacia_poup_aqui UUID;
BEGIN
  -- Buscar IDs das farmácias (ajuste os nomes conforme seu banco)
  SELECT id INTO v_farmacia_anjo_da_guarda FROM public.empresas WHERE nome = 'Drogaria Anjo da Guarda' LIMIT 1;
  SELECT id INTO v_farmacia_poup_aqui FROM public.empresas WHERE nome = 'Drogarias Poup Aqui Brasil' LIMIT 1;

  -- Plantão desta semana
  IF v_farmacia_anjo_da_guarda IS NOT NULL THEN
    PERFORM inserir_plantao_escala(
      v_farmacia_anjo_da_guarda,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '3 days',
      '24h',
      'Prefeitura Municipal de Guaíra',
      'https://guaira.sp.gov.br',
      'Plantão de fim de semana'
    );
  END IF;

  IF v_farmacia_poup_aqui IS NOT NULL THEN
    PERFORM inserir_plantao_escala(
      v_farmacia_poup_aqui,
      CURRENT_DATE + INTERVAL '4 days',
      CURRENT_DATE + INTERVAL '7 days',
      '24h',
      'Prefeitura Municipal de Guaíra',
      'https://guaira.sp.gov.br',
      'Plantão semanal'
    );
  END IF;
END $$;
*/

-- Verificar plantões criados
SELECT * FROM plantao_hoje;
SELECT * FROM plantao_proximos;

-- Mensagem final
SELECT '✅ Sistema de Plantão criado com sucesso!' AS status;
