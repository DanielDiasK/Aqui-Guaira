# 🛡️ Sistema de Administração - Aqui Guaíra

## 📋 Visão Geral

Sistema completo de administração com controle total sobre:
- ✅ Aprovação de posts do mural
- 🏢 Gerenciamento de empresas (ativar/bloquear)
- 📊 Estatísticas em tempo real
- 📝 Logs de todas as ações administrativas

---

## 🚀 Instalação

### 1. Executar o Script SQL

Acesse o **Supabase SQL Editor** e execute o arquivo:
```
supabase/admin-system.sql
```

Este script vai criar:
- ✅ Coluna `is_admin` na tabela `users`
- ✅ Colunas `ativa`, `data_cadastro`, `motivo_bloqueio` na tabela `empresas`
- ✅ Tabela `mural_posts` para posts do mural
- ✅ Tabela `admin_logs` para registrar ações
- ✅ View `admin_estatisticas` com dados consolidados
- ✅ Políticas RLS (Row Level Security)
- ✅ Funções para aprovar/rejeitar/bloquear

### 2. Tornar seu Usuário Admin

Após executar o script, torne seu usuário admin:

```sql
SELECT tornar_admin('seu_email@exemplo.com');
```

**Substitua** `seu_email@exemplo.com` pelo email que você usa para fazer login!

### 3. Acessar o Painel

1. Faça login no site
2. Clique no seu avatar no canto superior direito
3. Você verá a opção **"Painel Admin"** com ícone de escudo 🛡️
4. Clique para acessar

---

## 🎯 Funcionalidades

### 📊 Dashboard Principal

Ao entrar no painel admin (`/admin`), você verá:

#### Cards de Estatísticas:
- **Empresas Ativas** - Quantas empresas estão visíveis no site
- **Empresas Bloqueadas** - Quantas foram bloqueadas
- **Posts Pendentes** - Posts aguardando aprovação (com badge vermelho)
- **Usuários** - Total de usuários cadastrados

### 🏢 Aba Empresas

Lista todas as empresas cadastradas com:
- ✅ Status (Ativa/Bloqueada)
- 📅 Data de cadastro
- 👤 Proprietário (nome e email)
- 🎯 Categoria

**Ações disponíveis:**
- **Bloquear** - Oculta a empresa do site
  - Pede motivo do bloqueio
  - Empresa some da listagem pública
  - Dono ainda pode acessar o dashboard
- **Desbloquear** - Reativa a empresa
  - Remove o bloqueio
  - Empresa volta a aparecer no site

### 📝 Aba Posts do Mural

Lista todos os posts do mural com:
- ⏱️ Status (Pendente/Aprovado)
- 📅 Data de criação
- 🏢 Empresa que criou
- 👤 Usuário que criou

**Ações disponíveis:**
- **Aprovar** ✅ - Post aparece no mural público
- **Rejeitar** ❌ - Post não é publicado
  - Pede motivo da rejeição
  - Usuário pode ver o motivo

### 📋 Aba Logs

Histórico completo das últimas 50 ações administrativas:
- Quem fez a ação
- Quando foi feita
- Tipo de ação (aprovar, rejeitar, bloquear, etc)
- Detalhes em JSON

---

## 🔒 Segurança

### Row Level Security (RLS)

O sistema usa políticas de segurança do Supabase:

#### Empresas:
- ✅ Público vê apenas empresas **ativas**
- ✅ Admins veem **todas** as empresas
- ✅ Donos veem suas empresas mesmo bloqueadas

#### Posts do Mural:
- ✅ Público vê apenas posts **aprovados**
- ✅ Usuários veem seus próprios posts (aprovados ou não)
- ✅ Admins veem **todos** os posts

#### Logs:
- ✅ Apenas admins podem ver
- ✅ Apenas admins podem criar

### Funções Seguras

Todas as operações críticas usam funções `SECURITY DEFINER`:
- `tornar_admin(email)` - Promover usuário
- `aprovar_post_mural(post_id, admin_id)` - Aprovar post
- `rejeitar_post_mural(post_id, admin_id, motivo)` - Rejeitar post
- `bloquear_empresa(empresa_id, admin_id, motivo)` - Bloquear empresa
- `desbloquear_empresa(empresa_id, admin_id)` - Desbloquear empresa

Todas verificam se quem está executando é admin!

---

## 💡 Fluxo de Uso

### Aprovar Post do Mural:
1. Acesse `/admin` → Aba "Posts do Mural"
2. Veja os posts **Pendentes** (badge amarelo)
3. Leia o conteúdo e veja a imagem
4. Clique em **"Aprovar"** ✅ ou **"Rejeitar"** ❌
5. Se rejeitar, informe o motivo
6. Ação registrada nos logs

### Bloquear Empresa:
1. Acesse `/admin` → Aba "Empresas"
2. Encontre a empresa com problema
3. Clique em **"Bloquear"**
4. Digite o motivo (ex: "Conteúdo inadequado")
5. Confirme
6. Empresa some do site imediatamente
7. Dono vê aviso no dashboard

### Desbloquear Empresa:
1. Acesse `/admin` → Aba "Empresas"
2. Encontre a empresa **Bloqueada** (badge vermelho)
3. Clique em **"Desbloquear"**
4. Empresa volta ao ar imediatamente

---

## 🎨 Interface

### Cores e Badges:
- 🟢 **Verde** - Ativo/Aprovado
- 🔴 **Vermelho** - Bloqueado/Rejeitado  
- 🟡 **Amarelo** - Pendente

### Ícones:
- 🛡️ **Shield** - Admin
- 🏢 **Building** - Empresas
- 📝 **FileText** - Posts
- ⚡ **Activity** - Logs
- ✅ **CheckCircle** - Aprovado
- ❌ **XCircle** - Rejeitado
- 🚫 **Ban** - Bloqueado
- 🔓 **Unlock** - Desbloquear

---

## 📊 Estrutura do Banco

### Tabela: `users`
```sql
- id (UUID)
- email (TEXT)
- nome (TEXT)
- is_admin (BOOLEAN) ← NOVA!
```

### Tabela: `empresas`
```sql
- id (UUID)
- nome (TEXT)
- ativa (BOOLEAN) ← NOVA! (default: true)
- data_cadastro (TIMESTAMP) ← NOVA!
- motivo_bloqueio (TEXT) ← NOVA!
- ... outros campos
```

### Tabela: `mural_posts` (NOVA!)
```sql
- id (UUID)
- empresa_id (UUID)
- user_id (UUID)
- titulo (TEXT)
- conteudo (TEXT)
- imagem (TEXT)
- aprovado (BOOLEAN) - default: false
- data_criacao (TIMESTAMP)
- data_aprovacao (TIMESTAMP)
- admin_aprovador_id (UUID)
- motivo_rejeicao (TEXT)
- visualizacoes (INTEGER)
```

### Tabela: `admin_logs` (NOVA!)
```sql
- id (UUID)
- admin_id (UUID)
- acao (TEXT) - ex: 'aprovar_post', 'bloquear_empresa'
- entidade_tipo (TEXT) - 'empresa', 'post', 'usuario'
- entidade_id (UUID)
- detalhes (JSONB)
- data_acao (TIMESTAMP)
```

---

## 🔧 Manutenção

### Adicionar Novo Admin:
```sql
SELECT tornar_admin('novo_admin@email.com');
```

### Remover Admin:
```sql
UPDATE users SET is_admin = FALSE WHERE email = 'admin@email.com';
```

### Ver Todos os Admins:
```sql
SELECT id, nome, email FROM users WHERE is_admin = TRUE;
```

### Limpar Logs Antigos (opcional):
```sql
DELETE FROM admin_logs 
WHERE data_acao < NOW() - INTERVAL '90 days';
```

### Reativar Todas Empresas (emergência):
```sql
UPDATE empresas SET ativa = TRUE, motivo_bloqueio = NULL;
```

---

## ⚠️ Avisos Importantes

### ⚡ Bloqueio de Empresa:
- Empresa **some imediatamente** do site
- Dono **ainda pode acessar** dashboard
- Posts da empresa **continuam visíveis** se já aprovados
- Para ocultar posts, rejeite-os individualmente

### ⚡ Aprovação de Posts:
- Posts **sempre começam pendentes**
- Usuário **vê seus posts** mesmo pendentes
- Público só vê posts **aprovados**
- Não há "des-aprovar", apenas delete

### ⚡ Segurança:
- **Nunca compartilhe** credenciais de admin
- **Sempre informe motivos** ao bloquear/rejeitar
- **Revise logs** regularmente
- **Mantenha poucos admins** confiáveis

---

## 🐛 Troubleshooting

### Não consigo ver o painel admin:
1. Verifique se executou `tornar_admin()` com seu email
2. Verifique no banco: `SELECT is_admin FROM users WHERE email = 'seu@email.com'`
3. Faça logout e login novamente

### Erro ao bloquear empresa:
1. Verifique se preencheu o motivo
2. Verifique se empresa existe: `SELECT id FROM empresas WHERE id = 'UUID'`
3. Confira os logs do Supabase

### Empresa bloqueada ainda aparece:
1. Limpe cache do navegador (Ctrl+Shift+R)
2. Verifique no banco: `SELECT ativa FROM empresas WHERE id = 'UUID'`
3. Confira políticas RLS no Supabase

### Posts não aparecem após aprovar:
1. Recarregue a página
2. Verifique: `SELECT aprovado FROM mural_posts WHERE id = 'UUID'`
3. Confira se há erro no console do navegador

---

## 📞 Suporte

### Dúvidas sobre:
- **Banco de dados**: Verifique documentação do Supabase
- **Interface**: Verifique `src/pages/Admin.tsx`
- **Funções SQL**: Verifique `supabase/admin-system.sql`

### Recursos:
- 📚 [Documentação Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- 🎨 [Componentes shadcn/ui](https://ui.shadcn.com/)
- ⚛️ [React Router](https://reactrouter.com/)

---

## ✅ Checklist de Instalação

- [ ] Executei `supabase/admin-system.sql` no SQL Editor
- [ ] Executei `SELECT tornar_admin('meu@email.com')`
- [ ] Fiz login no site com meu email
- [ ] Vejo o botão "Painel Admin" no menu do avatar
- [ ] Consigo acessar `/admin` sem redirecionamento
- [ ] Vejo as estatísticas carregarem
- [ ] Testei bloquear/desbloquear uma empresa
- [ ] Testei aprovar/rejeitar um post (se houver)

---

## 🎉 Pronto!

Agora você tem controle total sobre:
- ✅ Quais empresas aparecem no site
- ✅ Quais posts são publicados no mural
- ✅ Histórico completo de ações
- ✅ Estatísticas em tempo real

**Bom trabalho, Admin! 🛡️**
