# 🔧 Correções Aplicadas - CNPJ e Listagem de Empresas

## ✅ O que foi corrigido:

### 1. **Coluna CNPJ adicionada**
- Criado arquivo `supabase/add-cnpj-column.sql`
- Adiciona coluna `cnpj` (varchar 18, unique)
- Recria a view `empresas_completas` para incluir CNPJ
- Adiciona índice para busca rápida

### 2. **Código atualizado para incluir CNPJ**
- `src/pages/SuaEmpresa.tsx`: Agora envia o CNPJ no cadastro
- `src/lib/supabase.ts`: Interface `Empresa` atualizada com campo `cnpj`

### 3. **Status mudado para 'aprovado'**
- Empresas agora são cadastradas com `status: 'aprovado'` automaticamente
- Isso faz com que apareçam imediatamente na listagem de empresas
- A view `empresas_completas` só mostra empresas aprovadas

## 📋 O que você precisa fazer:

### Passo 1: Executar SQL no Supabase
Execute o arquivo **`supabase/add-cnpj-column.sql`** no Supabase SQL Editor:

```sql
-- 1. Adiciona coluna CNPJ
alter table public.empresas 
add column if not exists cnpj varchar(18) unique;

-- 2. Recria a view empresas_completas
drop view if exists empresas_completas;
create or replace view empresas_completas as
select 
  e.*,
  c.nome as categoria_nome,
  c.icone as categoria_icone,
  c.cor as categoria_cor
from public.empresas e
left join public.categorias c on c.id = e.categoria_id
where e.status = 'aprovado';
```

### Passo 2: Testar cadastro
1. Acesse `/sua-empresa`
2. Preencha o formulário (incluindo CNPJ)
3. Clique em "Enviar Cadastro"
4. ✅ Empresa será salva com status 'aprovado'

### Passo 3: Verificar listagem
1. Acesse `/empresas`
2. ✅ A empresa deve aparecer na lista

## 🐛 Se ainda não aparecer:

### Debug 1: Verificar se foi salva
Execute no Supabase SQL Editor:
```sql
select id, nome, cnpj, status, created_at 
from public.empresas 
order by created_at desc 
limit 10;
```

### Debug 2: Verificar a view
Execute no Supabase SQL Editor:
```sql
select * from empresas_completas 
order by created_at desc 
limit 10;
```

### Debug 3: Console do navegador
1. Abra o Console (F12)
2. Acesse `/empresas`
3. Veja se há erros de carregamento

## 🎯 Resumo das mudanças:

| Arquivo | Mudança |
|---------|---------|
| `supabase/add-cnpj-column.sql` | ✨ Novo arquivo - SQL para adicionar CNPJ |
| `src/pages/SuaEmpresa.tsx` | ✏️ Linha 136: Adicionado `cnpj: data.cnpj` |
| `src/pages/SuaEmpresa.tsx` | ✏️ Linha 159: Mudado status de 'pendente' para 'aprovado' |
| `src/lib/supabase.ts` | ✏️ Interface Empresa: Adicionado campo `cnpj?: string` |

## 💡 Por que estava dando problema?

1. **CNPJ não existia no banco**: A tabela foi criada sem a coluna CNPJ
2. **View não tinha CNPJ**: A view `empresas_completas` foi criada antes do CNPJ existir
3. **Status 'pendente'**: Empresas com status 'pendente' não aparecem porque a view filtra apenas 'aprovado'

Agora tudo deve funcionar! 🚀
