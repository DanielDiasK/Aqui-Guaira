-- Script para inserir todas as farmácias de Guaíra no banco de dados
-- Status: pendente (aguardando aprovação do admin)
-- Data: 11/01/2026

-- Buscar ID da categoria Farmácia
DO $$
DECLARE
  categoria_farmacia_id UUID;
BEGIN
  SELECT id INTO categoria_farmacia_id FROM public.categorias WHERE nome = 'Farmácia' LIMIT 1;
  
  IF categoria_farmacia_id IS NULL THEN
    RAISE EXCEPTION 'Categoria Farmácia não encontrada';
  END IF;

  -- Inserir Farmácias (status pendente para aprovação do admin)
  
  -- 1. Drogaria Farmacenter
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Drogaria Farmacenter',
    'drogaria-farmacenter',
    'Farmácia completa com ampla variedade de medicamentos e produtos de saúde.',
    categoria_farmacia_id,
    '74.518.846/0001-54',
    'Rua 8, 519',
    'Centro',
    'Guaíra',
    'SP',
    '14790-000',
    '(17) 3331-3312',
    NULL,
    -20.316700,
    -48.316700,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 2. Drogaria Anjo da Guarda
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Drogaria Anjo da Guarda',
    'drogaria-anjo-da-guarda',
    'Farmácia com atendimento diferenciado e entrega rápida via WhatsApp.',
    categoria_farmacia_id,
    '67.444.497/0001-08',
    'Avenida Acacia Guairense, 1069',
    'Centro',
    'Guaíra',
    'SP',
    '14790-000',
    '(17) 3331-1110',
    '17999711110',
    -20.316800,
    -48.316800,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 3. Droga Nossa
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Droga Nossa',
    'droga-nossa',
    'Drogaria com preços acessíveis e atendimento de qualidade.',
    categoria_farmacia_id,
    '71.767.487/0001-80',
    'Rua 18, 142',
    'Centro',
    'Guaíra',
    'SP',
    '14790-000',
    '(17) 3331-4782',
    NULL,
    -20.316900,
    -48.316900,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 4. Drogaria Santa Helena
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Drogaria Santa Helena',
    'drogaria-santa-helena',
    'Farmácia tradicional com ampla linha de produtos para saúde e bem-estar.',
    categoria_farmacia_id,
    '27.470.496/0001-13',
    'Avenida 9, 1066',
    'Centro',
    'Guaíra',
    'SP',
    '14790-000',
    '(17) 8156-1212',
    '17981561212',
    -20.317000,
    -48.317000,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 5. Drogaria Central de Guaíra
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Drogaria Central de Guaíra',
    'drogaria-central-de-guaira',
    'Farmácia central com localização privilegiada e grande variedade de produtos.',
    categoria_farmacia_id,
    '56.679.830/0001-41',
    'Avenida 13, 407',
    'Centro',
    'Guaíra',
    'SP',
    '14790-000',
    '(17) 3331-2076',
    NULL,
    -20.317100,
    -48.317100,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 6. Drogarias Poup Aqui Brasil
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Drogarias Poup Aqui Brasil',
    'drogarias-poup-aqui-brasil',
    'Rede de farmácias com preços populares e atendimento via WhatsApp.',
    categoria_farmacia_id,
    '28.300.791/0001-94',
    'Rua 10, 543',
    'Centro',
    'Guaíra',
    'SP',
    '14790-000',
    '(17) 3330-4753',
    '17999773808',
    -20.317200,
    -48.317200,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 7. Drogamed – Drogaria e Perfumaria
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Drogamed – Drogaria e Perfumaria',
    'drogamed-drogaria-e-perfumaria',
    'Farmácia completa com linha de perfumaria e cosméticos.',
    categoria_farmacia_id,
    '07.261.848/0001-13',
    'Avenida 23, 1225',
    'Centro',
    'Guaíra',
    'SP',
    '14790-000',
    '(17) 3331-5493',
    '17999787081',
    -20.317300,
    -48.317300,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 8. Drogaria Marca
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Drogaria Marca',
    'drogaria-marca',
    'Farmácia de confiança com atendimento personalizado.',
    categoria_farmacia_id,
    '02.108.994/0001-90',
    'Avenida 21, 867',
    'Centro',
    'Guaíra',
    'SP',
    '14790-000',
    '(17) 3331-5129',
    NULL,
    -20.317400,
    -48.317400,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 9. Drogaria São José Guaíra
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Drogaria São José Guaíra',
    'drogaria-sao-jose-guaira',
    'Farmácia com tradição e excelente localização.',
    categoria_farmacia_id,
    '38.922.464/0001-28',
    'Avenida Trinta e Um, 1258',
    'Centro',
    'Guaíra',
    'SP',
    '14790-000',
    '(17) 3331-7975',
    NULL,
    -20.317500,
    -48.317500,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 10. Drogaria Ferreira Dias
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Drogaria Ferreira Dias',
    'drogaria-ferreira-dias',
    'Farmácia do bairro Nova Guaíra com atendimento de qualidade.',
    categoria_farmacia_id,
    '28.937.734/0001-10',
    'Avenida 4, 2154',
    'Nova Guaíra',
    'Guaíra',
    'SP',
    '14790-000',
    NULL,
    NULL,
    -20.317600,
    -48.317600,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 11. Rede Fraan Drogarias (Drogaria Saúde)
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Rede Fraan Drogarias (Drogaria Saúde)',
    'rede-fraan-drogarias-drogaria-saude',
    'Rede de farmácias com preços competitivos e bom atendimento.',
    categoria_farmacia_id,
    '08.640.204/0001-07',
    'Rua 6 B, 107',
    'Centro',
    'Guaíra',
    'SP',
    '14790-000',
    '(17) 3331-7055',
    NULL,
    -20.317700,
    -48.317700,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 12. Drogaria Fraan Med
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Drogaria Fraan Med',
    'drogaria-fraan-med',
    'Farmácia da rede Fraan com ampla linha de medicamentos.',
    categoria_farmacia_id,
    '17.065.225/0001-29',
    'Rua 16 B, 1217',
    'Centro',
    'Guaíra',
    'SP',
    '14790-000',
    '(17) 3331-7188',
    NULL,
    -20.317800,
    -48.317800,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 13. Droga Pharma Avenida (Farmácia do Japonês)
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Droga Pharma Avenida (Farmácia do Japonês)',
    'droga-pharma-avenida-farmacia-do-japones',
    'Conhecida como Farmácia do Japonês, tradicional em Guaíra.',
    categoria_farmacia_id,
    '09.270.462/0001-01',
    'Avenida 21, 1369',
    'Centro',
    'Guaíra',
    'SP',
    '14790-000',
    '(17) 3331-9898',
    NULL,
    -20.317900,
    -48.317900,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 14. Drogaria Mais Brasil
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Drogaria Mais Brasil',
    'drogaria-mais-brasil',
    'Farmácia com ótima localização no centro da cidade.',
    categoria_farmacia_id,
    '07.388.976/0001-22',
    'Rua 10, 600',
    'Centro',
    'Guaíra',
    'SP',
    '14790-000',
    '(17) 3331-3374',
    NULL,
    -20.318000,
    -48.318000,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 15. Drogaria Genérica de Guaíra
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Drogaria Genérica de Guaíra',
    'drogaria-generica-de-guaira',
    'Especializada em medicamentos genéricos com preços acessíveis.',
    categoria_farmacia_id,
    '05.151.508/0001-04',
    'Avenida 9, 766',
    'Centro',
    'Guaíra',
    'SP',
    '14790-000',
    '(17) 3331-2649',
    NULL,
    -20.318100,
    -48.318100,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 16. Drogaria do Povo
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Drogaria do Povo',
    'drogaria-do-povo',
    'Farmácia popular com preços acessíveis.',
    categoria_farmacia_id,
    '01.286.997/0001-50',
    'Avenida 23, 1627',
    'V. N. S. Aparecida',
    'Guaíra',
    'SP',
    '14790-000',
    NULL,
    NULL,
    -20.318200,
    -48.318200,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 17. Drogaria Bem Estar
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Drogaria Bem Estar',
    'drogaria-bem-estar',
    'Farmácia focada em saúde e bem-estar da comunidade.',
    categoria_farmacia_id,
    '14.724.213/0001-70',
    'Avenida Jose Cavenaghi, 1483',
    'Centro',
    'Guaíra',
    'SP',
    '14790-000',
    NULL,
    NULL,
    -20.318300,
    -48.318300,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 18. A Essência – Farmácia de Manipulação
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'A Essência – Farmácia de Manipulação',
    'a-essencia-farmacia-de-manipulacao',
    'Farmácia especializada em manipulação de medicamentos personalizados.',
    categoria_farmacia_id,
    '08.384.829/0001-47',
    'Rua 8, 1145',
    'Centro',
    'Guaíra',
    'SP',
    '14790-000',
    '(17) 3331-7555',
    '17999787755',
    -20.318400,
    -48.318400,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 19. Unimed Farmácia Guaíra
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Unimed Farmácia Guaíra',
    'unimed-farmacia-guaira',
    'Farmácia da Unimed com atendimento exclusivo para associados.',
    categoria_farmacia_id,
    '71.925.531/0004-86',
    'Avenida 21, 729',
    'Centro',
    'Guaíra',
    'SP',
    '14790-000',
    NULL,
    NULL,
    -20.318500,
    -48.318500,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  -- 20. Farmácia Alecrim Dourado
  INSERT INTO public.empresas (
    nome, slug, descricao, categoria_id, cnpj,
    endereco, bairro, cidade, estado, cep,
    telefone, whatsapp,
    latitude, longitude,
    status, ativa, verificado
  ) VALUES (
    'Farmácia Alecrim Dourado',
    'farmacia-alecrim-dourado',
    'Farmácia com produtos naturais e medicamentos tradicionais.',
    categoria_farmacia_id,
    '03.337.831/0001-41',
    'Avenida 11, 546',
    'Centro',
    'Guaíra',
    'SP',
    '14790-000',
    NULL,
    NULL,
    -20.318600,
    -48.318600,
    'pendente',
    FALSE,
    FALSE
  ) ON CONFLICT (slug) DO NOTHING;

  RAISE NOTICE '✅ 20 farmácias inseridas com status PENDENTE para aprovação do admin!';
END $$;
