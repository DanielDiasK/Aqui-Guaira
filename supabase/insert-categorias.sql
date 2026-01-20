-- ============================================
-- INSERIR CATEGORIAS COMPLETAS
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Limpar categorias existentes (opcional, comente se não quiser apagar)
-- truncate table public.categorias cascade;

-- Inserir categorias principais
insert into public.categorias (nome, icone, cor, ordem)
values 
  ('Alimentação', 'utensils', '#FF6B6B', 1),
  ('Restaurantes', 'utensils', '#FF6B6B', 2),
  ('Padarias', 'croissant', '#FFA94D', 3),
  ('Lanchonetes', 'coffee', '#FFD93D', 4),
  ('Bares', 'beer', '#95E1D3', 5),
  
  ('Serviços', 'wrench', '#4ECDC4', 10),
  ('Salão de Beleza', 'scissors', '#FF85A2', 11),
  ('Barbearia', 'scissors', '#A8DADC', 12),
  ('Mecânica', 'wrench', '#457B9D', 13),
  ('Eletricista', 'zap', '#F4A261', 14),
  ('Encanador', 'droplet', '#2A9D8F', 15),
  ('Pedreiro', 'hammer', '#E76F51', 16),
  ('Marcenaria', 'hammer', '#8B4513', 17),
  
  ('Comércio', 'shopping-bag', '#45B7D1', 20),
  ('Supermercado', 'shopping-cart', '#3A86FF', 21),
  ('Farmácia', 'pill', '#06D6A0', 22),
  ('Lotérica', 'ticket', '#FFB703', 23),
  ('Papelaria', 'pen', '#8338EC', 24),
  ('Loja de Roupas', 'shirt', '#FF006E', 25),
  ('Calçados', 'footprints', '#FB5607', 26),
  ('Pet Shop', 'paw-print', '#06FFA5', 27),
  
  ('Saúde', 'heart-pulse', '#96CEB4', 30),
  ('Clínica Médica', 'stethoscope', '#48CAE4', 31),
  ('Odontologia', 'smile', '#00B4D8', 32),
  ('Fisioterapia', 'activity', '#0077B6', 33),
  ('Psicologia', 'brain', '#90E0EF', 34),
  ('Academia', 'dumbbell', '#FF4D6D', 35),
  
  ('Educação', 'graduation-cap', '#FFEAA7', 40),
  ('Escola', 'school', '#FFD60A', 41),
  ('Curso de Idiomas', 'languages', '#FFC300', 42),
  ('Curso Técnico', 'book-open', '#FFB700', 43),
  ('Reforço Escolar', 'book', '#FFAA00', 44),
  
  ('Entretenimento', 'ticket', '#DFE6E9', 50),
  ('Cinema', 'film', '#6C5CE7', 51),
  ('Teatro', 'theater', '#A29BFE', 52),
  ('Esporte', 'trophy', '#00B894', 53),
  ('Eventos', 'calendar', '#FDCB6E', 54),
  
  ('Tecnologia', 'smartphone', '#74B9FF', 60),
  ('Assistência Técnica', 'laptop', '#0984E3', 61),
  ('Informática', 'monitor', '#6C5CE7', 62),
  
  ('Automotivo', 'car', '#636E72', 70),
  ('Auto Peças', 'cog', '#2D3436', 71),
  ('Lava Rápido', 'droplets', '#00CEC9', 72),
  ('Estacionamento', 'square-parking', '#636E72', 73),
  
  ('Construção', 'hammer', '#E17055', 80),
  ('Material de Construção', 'brick-wall', '#D63031', 81),
  ('Pintura', 'paintbrush', '#FD79A8', 82),
  
  ('Imóveis', 'home', '#00B894', 90),
  ('Imobiliária', 'building', '#00CEC9', 91),
  
  ('Turismo', 'plane', '#A29BFE', 100),
  ('Hotel', 'bed', '#6C5CE7', 101),
  ('Pousada', 'house', '#74B9FF', 102),
  
  ('Outros', 'more-horizontal', '#B2BEC3', 999)
on conflict (nome) do update
set 
  icone = excluded.icone,
  cor = excluded.cor,
  ordem = excluded.ordem;

-- Verificar categorias inseridas
select id, nome, icone, cor, ordem 
from public.categorias 
order by ordem, nome;

-- Contar total de categorias
select count(*) as total_categorias from public.categorias;

-- Ver empresas e suas categorias
select 
  e.nome as empresa,
  c.nome as categoria
from public.empresas e
left join public.categorias c on c.id = e.categoria_id
order by e.created_at desc
limit 10;
