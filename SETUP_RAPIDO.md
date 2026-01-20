# ⚡ Setup Rápido - Resolver Erros

## 🔴 Erro Atual

```
StorageApiError: Bucket not found
row-level security policy for table "empresas"
```

## ✅ Solução em 3 Passos

### 1️⃣ Executar SQL Principal
1. Acesse: https://hihfnlbcantamcxpisef.supabase.co
2. Vá em **SQL Editor**
3. Cole o conteúdo de `supabase/schema.sql`
4. Clique em **Run** (ou F5)

### 2️⃣ Corrigir Políticas RLS
1. No mesmo **SQL Editor**
2. Cole o conteúdo de `supabase/fix-rls.sql`
3. Clique em **Run**

### 3️⃣ Criar Buckets de Storage (Opção 1 - Via Interface)
1. No Supabase, vá em **Storage**
2. Clique em **New bucket**
3. Criar 3 buckets:
   - Nome: `empresas-images` → Marcar **Public bucket** → Create
   - Nome: `posts-images` → Marcar **Public bucket** → Create
   - Nome: `locais-images` → Marcar **Public bucket** → Create

### 3️⃣ Criar Buckets de Storage (Opção 2 - Via SQL)
Execute este SQL no SQL Editor:

```sql
insert into storage.buckets (id, name, public)
values 
  ('empresas-images', 'empresas-images', true),
  ('posts-images', 'posts-images', true),
  ('locais-images', 'locais-images', true)
on conflict (id) do nothing;
```

## 🧪 Testar

Após executar os 3 passos:

1. Recarregue o navegador
2. Acesse `/sua-empresa`
3. Preencha o formulário
4. Clique em "Enviar Cadastro"

✅ Deve funcionar agora!

## 🐛 Se ainda der erro

### Erro de RLS persiste:
```sql
-- Execute este SQL isoladamente:
alter table public.empresas disable row level security;
```

⚠️ **Atenção**: Isso desabilita a segurança. Use apenas para testes.

Para produção, mantenha RLS ativo e ajuste as políticas.

### Erro de Storage persiste:
- Verifique se os buckets foram criados em **Storage**
- Confira se estão marcados como **Public**
- Execute as políticas de storage do `fix-rls.sql`

### Upload não funciona mas cadastro sim:
- O código agora usa imagens placeholder se o upload falhar
- Empresa será cadastrada mesmo sem imagens
- Configure os buckets depois e faça upload pelo dashboard

## 📝 Ordem Correta de Execução

```bash
1. supabase/schema.sql       ← Cria tabelas, views, functions
2. supabase/fix-rls.sql      ← Corrige permissões
3. Criar buckets             ← Via interface ou SQL
4. Testar cadastro           ← /sua-empresa
```

## 🎯 Verificação Rápida

Execute no SQL Editor para verificar se está tudo OK:

```sql
-- Ver tabelas
select table_name from information_schema.tables 
where table_schema = 'public' and table_type = 'BASE TABLE';

-- Ver políticas RLS
select * from pg_policies where tablename = 'empresas';

-- Ver buckets
select * from storage.buckets;
```

Deve retornar:
- ✅ Várias tabelas (empresas, categorias, posts, etc)
- ✅ Política permitindo INSERT público
- ✅ 3 buckets (empresas-images, posts-images, locais-images)

## 💡 Dica

Se quiser testar SEM configurar storage:
- O código já está preparado
- Usa imagens placeholder do Unsplash
- Cadastro funciona normalmente
- Configure storage depois para usar imagens reais
