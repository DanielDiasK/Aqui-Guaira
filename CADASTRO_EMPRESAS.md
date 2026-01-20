# 🚀 Sistema de Cadastro e Gerenciamento de Empresas

## ✅ O que foi implementado

### 1. **Integração Completa com Supabase**
- ✅ Cliente Supabase configurado (`src/lib/supabase.ts`)
- ✅ Schema SQL completo com todas as tabelas necessárias
- ✅ Funções para CRUD de empresas, posts, locais, etc
- ✅ Upload de imagens no Supabase Storage
- ✅ Sistema de favoritos e histórico

### 2. **Página de Cadastro (`/sua-empresa`)**
- ✅ Formulário completo de cadastro de empresa
- ✅ Upload de logo e banner (drag & drop)
- ✅ Validação de CNPJ
- ✅ Máscaras para telefone e CNPJ
- ✅ Integração direta com Supabase
- ✅ **Dados salvos no banco de dados real**

### 3. **Sistema de Login Simples**
- ✅ Login com CNPJ + Celular
- ✅ Autenticação via localStorage
- ✅ Redirecionamento automático para dashboard

### 4. **Dashboard de Gerenciamento (`/dashboard`)**
- ✅ Visão geral da empresa (status, visualizações, etc)
- ✅ Edição de informações (descrição, contatos, redes sociais)
- ✅ Upload de imagens adicionais
- ✅ Badges de status (Pendente, Aprovado, Rejeitado)
- ✅ Sistema de tabs (Informações, Imagens)
- ✅ Botão de logout

### 5. **Página de Empresas Atualizada**
- ✅ Busca empresas do Supabase (não mais dados mockados)
- ✅ Sistema de favoritos integrado
- ✅ Contador de visualizações
- ✅ Filtros por categoria, bairro e proximidade

## 📋 Como usar

### 1. Instalar dependências
```bash
npm install @supabase/supabase-js
# ou
pnpm install @supabase/supabase-js
```

### 2. Executar SQL no Supabase
1. Acesse https://hihfnlbcantamcxpisef.supabase.co
2. Vá em **SQL Editor**
3. Cole o conteúdo de `supabase/schema.sql`
4. Execute (Run)

### 3. Configurar Storage Buckets
No painel Supabase > Storage, criar:
- Bucket: `empresas-images` (público)
- Bucket: `posts-images` (público)
- Bucket: `locais-images` (público)

Depois, adicionar políticas de upload:
```sql
create policy "Upload público de imagens"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'empresas-images');

-- Repetir para os outros buckets
```

### 4. Criar política de leitura pública para Storage
```sql
create policy "Leitura pública de imagens"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'empresas-images');

-- Repetir para os outros buckets
```

## 🎯 Fluxo Completo

### Cadastro de Empresa
1. Usuário acessa `/sua-empresa`
2. Preenche formulário completo
3. Faz upload de logo e banner
4. Clica em "Enviar Cadastro"
5. **Dados são salvos no Supabase**
6. Sistema cria credenciais (CNPJ + Celular)
7. Redireciona automaticamente para `/dashboard`

### Login
1. Usuário acessa `/sua-empresa`
2. Clica em "Login"
3. Informa CNPJ e Celular
4. Sistema busca empresa no Supabase
5. Se encontrar, salva sessão e redireciona para `/dashboard`

### Dashboard
1. Usuário autenticado acessa `/dashboard`
2. Vê status da empresa (Pendente, Aprovado, Rejeitado)
3. Pode editar:
   - Descrição
   - Telefone e WhatsApp
   - Email
   - Site
   - Instagram e Facebook
4. Pode adicionar até 5 imagens
5. Alterações são salvas diretamente no Supabase

## 🔐 Autenticação

O sistema usa autenticação simples via localStorage:
```typescript
{
  cnpj: "00.000.000/0000-00",
  celular: "(11) 90000-0000",
  empresaId: "uuid-da-empresa"
}
```

**Nota**: Em produção, considere usar Supabase Auth para autenticação mais robusta.

## 📊 Status da Empresa

- **Pendente**: Aguardando aprovação (padrão para novos cadastros)
- **Aprovado**: Empresa visível na listagem pública
- **Rejeitado**: Cadastro negado (motivo pode ser informado)
- **Inativo**: Empresa desativada temporariamente

## 🖼️ Upload de Imagens

- Logo: Quadrada, ideal 400x400px
- Banner: Largura grande, ideal 1200x480px
- Galeria: Até 5 imagens adicionais

Todas as imagens são enviadas para o Supabase Storage e URLs são salvas no banco.

## 📱 Responsividade

Todo o sistema é 100% responsivo:
- Mobile-first design
- Formulários adaptáveis
- Dashboard funcional em tablets e celulares

## 🎨 Próximas Melhorias (Opcionais)

1. **Admin Panel**:
   - Página para aprovar/rejeitar empresas
   - Gerenciar categorias
   - Ver estatísticas gerais

2. **Autenticação Avançada**:
   - Migrar para Supabase Auth
   - Login com email + senha
   - Recuperação de senha

3. **Funcionalidades Extras**:
   - Sistema de mensagens (chat com clientes)
   - Agendamento de serviços
   - Avaliações e comentários
   - Planos premium (destaque, mais imagens, etc)

## 🐛 Troubleshooting

### Erro: "Failed to resolve import @supabase/supabase-js"
**Solução**: Execute `npm install @supabase/supabase-js`

### Erro ao fazer upload de imagens
**Solução**: Verifique se os buckets foram criados e as políticas configuradas no Supabase Storage

### Empresa não aparece na listagem
**Solução**: Verifique o status no dashboard. Apenas empresas com status "aprovado" aparecem na listagem pública.

### Login não funciona
**Solução**: Certifique-se de usar exatamente o mesmo CNPJ e celular do cadastro.

## 📝 Variáveis de Ambiente

Arquivo `.env` já está configurado com suas credenciais:
```
VITE_SUPABASE_URL=https://hihfnlbcantamcxpisef.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Importante**: Não commite o `.env` no git (já está em .gitignore).

## 🎉 Pronto!

Agora você tem um sistema completo de cadastro e gerenciamento de empresas integrado com Supabase!

Para testar:
1. Execute o SQL no Supabase
2. Configure os buckets de storage
3. Acesse `/sua-empresa` e cadastre uma empresa
4. Faça login e acesse o dashboard
