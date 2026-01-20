# Integração Supabase - Aqui Guaíra

## 📋 Estrutura Criada

### 1. Schema SQL Completo (`supabase/schema.sql`)
- ✅ Tabelas: `categorias`, `empresas`, `posts`, `comentarios`, `locais_turisticos`, `favoritos`, `historico_localizacao`
- ✅ Índices otimizados para buscas rápidas
- ✅ Row Level Security (RLS) configurado
- ✅ Functions úteis (busca por proximidade, incremento de visualizações)
- ✅ Triggers automáticos (updated_at, geolocalização)
- ✅ Views (empresas_completas, posts_aprovados)
- ✅ Seed data inicial (categorias e locais turísticos)

### 2. Cliente Supabase (`src/lib/supabase.ts`)
- ✅ Cliente configurado com suas credenciais
- ✅ Tipos TypeScript completos para todas as tabelas
- ✅ Funções auxiliares (getUserIdentifier, calcularDistancia, upload)
- ✅ API completa para:
  - Empresas (buscar, criar, filtrar por proximidade)
  - Posts do mural (criar, buscar, comentar)
  - Locais turísticos
  - Categorias
  - Favoritos
  - Histórico de visualizações

### 3. Configuração de Ambiente (`.env`)
- ✅ Variáveis de ambiente configuradas com suas credenciais

## 🚀 Próximos Passos

### 1. Instalar Dependência
```bash
npm install @supabase/supabase-js
```

### 2. Executar SQL no Supabase
1. Acesse: https://hihfnlbcantamcxpisef.supabase.co
2. Vá em **SQL Editor**
3. Cole todo o conteúdo de `supabase/schema.sql`
4. Execute (Run)

### 3. Configurar Storage (Buckets)
No painel Supabase > Storage:
1. Criar bucket: `empresas-images` (público)
2. Criar bucket: `posts-images` (público)
3. Criar bucket: `locais-images` (público)

Políticas para os buckets (permitir upload público):
```sql
-- Para cada bucket, executar:
create policy "Upload público de imagens"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'empresas-images'); -- repetir para cada bucket
```

### 4. Migrar Dados Existentes
Se você tem dados mock em `src/lib/empresas.ts`, vou criar um script de migração.

## 📦 Funções Principais

### Empresas
```typescript
import { buscarEmpresas, criarEmpresa, buscarEmpresaPorSlug } from '@/lib/supabase'

// Buscar todas
const empresas = await buscarEmpresas()

// Com filtros
const empresas = await buscarEmpresas({
  categoria: 'Alimentação',
  bairro: 'Centro',
  busca: 'farmácia',
  latitude: -20.3167,
  longitude: -48.3167,
  raioKm: 5
})

// Por slug
const empresa = await buscarEmpresaPorSlug('farmacia-central')
```

### Posts do Mural
```typescript
import { buscarPosts, criarPost, criarComentario } from '@/lib/supabase'

// Criar post
const post = await criarPost({
  autor_nome: 'João Silva',
  autor_bairro: 'Centro',
  autor_email: 'joao@email.com',
  conteudo: 'Ótimo evento no parque!',
  imagens: ['url1', 'url2']
})

// Buscar posts aprovados
const posts = await buscarPosts()

// Comentar
const comentario = await criarComentario({
  post_id: 'uuid-do-post',
  autor_nome: 'Maria',
  conteudo: 'Concordo!'
})
```

### Upload de Imagens
```typescript
import { uploadImagem, uploadImagens } from '@/lib/supabase'

// Upload único
const url = await uploadImagem('empresas-images', file)

// Upload múltiplo
const urls = await uploadImagens('posts-images', [file1, file2])
```

### Favoritos
```typescript
import { buscarFavoritos, adicionarFavorito, removerFavorito } from '@/lib/supabase'

// Adicionar
await adicionarFavorito('empresa', 'uuid-da-empresa')

// Remover
await removerFavorito('empresa', 'uuid-da-empresa')

// Buscar favoritos do usuário
const favoritos = await buscarFavoritos('empresa')
```

## 🔐 Segurança

- **RLS ativado**: Apenas dados aprovados são públicos
- **Moderação**: Posts e empresas passam por aprovação
- **Identificação**: Sistema de user_identifier para usuários anônimos
- **Storage**: Buckets públicos apenas para leitura, upload controlado

## 🗺️ Geolocalização

A tabela `empresas` tem suporte a PostGIS:
- Busca por raio (função `buscar_empresas_proximas`)
- Cálculo automático de distâncias
- Ordenação por proximidade

## 📊 Dashboard Admin (futuro)

O schema está preparado para um painel administrativo:
- Moderar posts pendentes
- Aprovar/rejeitar empresas
- Ver estatísticas (visualizações, curtidas)
- Gerenciar categorias

## ⚠️ Importante

1. **Não commitar** o arquivo `.env` no git (já está em .gitignore)
2. **Executar** o SQL antes de usar as funções
3. **Configurar** os buckets de storage
4. **Instalar** `@supabase/supabase-js`

## 🎯 Exemplo de Integração Completa

Vou criar um exemplo de como migrar a página de Empresas para usar Supabase.
