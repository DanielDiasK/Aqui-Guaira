-- Schema para o Marketplace integrado

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Anúncios/Listagens
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  city VARCHAR(100) DEFAULT 'Guaíra',
  state VARCHAR(2) DEFAULT 'SP',
  views INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias (leitura pública, escrita apenas admin)
DROP POLICY IF EXISTS "Categorias são visíveis para todos" ON categories;
CREATE POLICY "Categorias são visíveis para todos" ON categories
  FOR SELECT USING (true);

-- Políticas para listings (leitura pública, escrita apenas para proprietário)
DROP POLICY IF EXISTS "Anúncios são visíveis para todos" ON listings;
CREATE POLICY "Anúncios são visíveis para todos" ON listings
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Usuários podem criar anúncios" ON listings;
CREATE POLICY "Usuários podem criar anúncios" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem editar seus anúncios" ON listings;
CREATE POLICY "Usuários podem editar seus anúncios" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar seus anúncios" ON listings;
CREATE POLICY "Usuários podem deletar seus anúncios" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- Inserir categorias iniciais
INSERT INTO categories (name, icon) VALUES
  ('Veículos - Carros', 'Car'),
  ('Veículos - Motos', 'Bike'),
  ('Eletrônicos', 'Smartphone'),
  ('Moda', 'Shirt'),
  ('Casa e Decoração', 'Home'),
  ('Alimentação', 'Utensils'),
  ('Esportes e Lazer', 'Dumbbell'),
  ('Serviços', 'Briefcase'),
  ('Outros', 'Package')
ON CONFLICT DO NOTHING;

-- Inserir alguns anúncios de exemplo
INSERT INTO listings (title, description, price, category_id, images, city, state, badges) 
SELECT 
  'iPhone 13 Pro Max 256GB',
  'iPhone 13 Pro Max em excelente estado, completo na caixa com todos os acessórios.',
  4500.00,
  (SELECT id FROM categories WHERE name = 'Eletrônicos' LIMIT 1),
  ARRAY['/placeholder.svg'],
  'Guaíra',
  'SP',
  '[{"name": "Seminovo", "color": "bg-blue-100 text-blue-800"}, {"name": "Garantia", "color": "bg-green-100 text-green-800"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title = 'iPhone 13 Pro Max 256GB');

INSERT INTO listings (title, description, price, category_id, images, city, state, badges) 
SELECT 
  'Sofá 3 Lugares Retrátil',
  'Sofá super confortável, tecido suede, cor cinza. Pouco uso, em ótimo estado.',
  1200.00,
  (SELECT id FROM categories WHERE name = 'Casa e Decoração' LIMIT 1),
  ARRAY['/placeholder.svg'],
  'Guaíra',
  'SP',
  '[{"name": "Como Novo", "color": "bg-green-100 text-green-800"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Sofá 3 Lugares Retrátil');

INSERT INTO listings (title, description, price, category_id, images, city, state, badges) 
SELECT 
  'Bicicleta Mountain Bike Aro 29',
  'Mountain bike aro 29, 21 marchas, freio a disco. Ideal para trilhas.',
  800.00,
  (SELECT id FROM categories WHERE name = 'Esportes e Lazer' LIMIT 1),
  ARRAY['/placeholder.svg'],
  'Guaíra',
  'SP',
  '[{"name": "Seminovo", "color": "bg-blue-100 text-blue-800"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Bicicleta Mountain Bike Aro 29');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- View para facilitar consultas com nome da categoria
CREATE OR REPLACE VIEW listings_with_category AS
SELECT 
  l.*,
  c.name as category,
  c.icon as category_icon
FROM listings l
LEFT JOIN categories c ON l.category_id = c.id;
