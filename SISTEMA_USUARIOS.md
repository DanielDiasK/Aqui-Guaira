# 🔐 Sistema de Usuários e Favoritos

## 📋 Resumo

Sistema completo de usuários com **login rápido sem senha** para:
- ✅ Salvar favoritos (empresas, locais turísticos)
- ✅ Postar no mural como usuário logado ou anônimo
- ✅ Comentar com perfil ou anonimamente

## 🗄️ Estrutura do Banco de Dados

### Tabela `users`
```sql
- id (uuid, primary key)
- email (varchar, unique) ← Login sem senha
- nome (varchar, opcional)
- avatar_url (text, opcional)
- created_at, updated_at
```

### Atualizações nas Tabelas

#### `favoritos`
- ✨ **user_id** (uuid, opcional) ← ID do usuário logado
- user_identifier (uuid) ← Fallback para não logados

#### `posts`
- ✨ **user_id** (uuid, opcional) ← Autor logado
- ✨ **autor_anonimo** (boolean) ← Se true, post anônimo
- autor_nome ← Nome do autor (user.nome ou digitado)

#### `comentarios`
- ✨ **user_id** (uuid, opcional) ← Autor logado
- ✨ **autor_anonimo** (boolean) ← Se true, comentário anônimo
- autor_nome ← Nome do autor

## 🚀 Como Usar

### 1. Executar SQL
Execute o arquivo **`supabase/add-users-table.sql`** no Supabase SQL Editor.

Isso vai:
- Criar tabela `users`
- Adicionar colunas `user_id` em `favoritos`, `posts`, `comentarios`
- Atualizar view `posts_aprovados` para incluir dados do autor
- Criar função `buscar_favoritos_usuario()`

### 2. Componente de Login

Use o componente `LoginDialog` em qualquer lugar:

```tsx
import { UserButton } from '@/components/LoginDialog'

function Header() {
  return (
    <header>
      <UserButton />
    </header>
  )
}
```

**Funcionalidades do `UserButton`**:
- Mostra botão "Login" se não logado
- Mostra nome/email e botão "Logout" se logado
- Abre dialog de login rápido (só pede email)

### 3. Verificar se Usuário está Logado

```tsx
import { getUsuarioLogado } from '@/lib/supabase'

const user = getUsuarioLogado()

if (user) {
  console.log('Usuário logado:', user.email, user.nome)
} else {
  console.log('Não logado')
}
```

### 4. Adicionar Favorito (com login)

```tsx
import { adicionarFavoritoUsuario, getUsuarioLogado } from '@/lib/supabase'
import { LoginDialog } from '@/components/LoginDialog'

function EmpresaCard({ empresaId }) {
  const [showLogin, setShowLogin] = useState(false)
  const user = getUsuarioLogado()

  const handleFavoritar = async () => {
    if (!user) {
      // Pedir login
      setShowLogin(true)
      return
    }

    // Adicionar favorito
    await adicionarFavoritoUsuario('empresa', empresaId)
    toast.success('Adicionado aos favoritos!')
  }

  return (
    <>
      <button onClick={handleFavoritar}>
        ❤️ Favoritar
      </button>

      <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
        onLoginSuccess={() => handleFavoritar()}
      />
    </>
  )
}
```

### 5. Buscar Favoritos do Usuário

```tsx
import { buscarFavoritosUsuario } from '@/lib/supabase'

// Buscar todos os favoritos
const favoritos = await buscarFavoritosUsuario()

// Buscar apenas empresas
const empresasFavoritas = await buscarFavoritosUsuario('empresa')

// Buscar apenas locais
const locaisFavoritos = await buscarFavoritosUsuario('local')
```

### 6. Postar no Mural (anônimo ou logado)

```tsx
import { getUsuarioLogado, criarPost } from '@/lib/supabase'

function NovoPost() {
  const [anonimo, setAnonimo] = useState(false)
  const [conteudo, setConteudo] = useState('')
  const user = getUsuarioLogado()

  const handlePostar = async () => {
    const postData = {
      conteudo,
      autor_bairro: 'Centro',
      imagens: [],
      status: 'pendente' as const,
      curtidas: 0,
      comentarios: 0,
    }

    if (anonimo || !user) {
      // Postar como anônimo
      postData.autor_anonimo = true
      postData.autor_nome = 'Anônimo'
    } else {
      // Postar com perfil
      postData.autor_anonimo = false
      postData.user_id = user.id
      postData.autor_nome = user.nome || user.email
    }

    await criarPost(postData)
    toast.success('Post enviado para moderação!')
  }

  return (
    <div>
      <textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} />
      
      {user && (
        <label>
          <input type="checkbox" checked={anonimo} onChange={(e) => setAnonimo(e.target.checked)} />
          Postar anonimamente
        </label>
      )}
      
      <button onClick={handlePostar}>Postar</button>
    </div>
  )
}
```

## 🔄 Fluxo Completo

### Usuário NÃO logado:
1. Tenta favoritar algo
2. Sistema mostra dialog de login
3. Usuário digita email (+ nome opcional)
4. Sistema cria/busca usuário no banco
5. Salva no `localStorage` como `aqui_guaira_user`
6. Favorito é salvo com `user_id`
7. ✅ Favoritos sincronizam entre dispositivos

### Usuário logado:
1. `UserButton` mostra nome/email
2. Favoritos salvos com `user_id`
3. Posts podem ser feitos com perfil ou anonimamente
4. Logout limpa `localStorage`

## 🎨 Interface Recomendada

### Header com Login
```tsx
<header className="flex justify-between items-center p-4">
  <Logo />
  <UserButton />
</header>
```

### Card de Empresa com Favorito
```tsx
<Card>
  <h3>{empresa.nome}</h3>
  <Button onClick={handleFavoritar}>
    {isFavorito ? '❤️ Favoritado' : '🤍 Favoritar'}
  </Button>
</Card>
```

### Formulário de Post
```tsx
<form>
  <textarea placeholder="O que está acontecendo?" />
  
  {user && (
    <div className="flex items-center gap-2">
      <Switch checked={anonimo} onCheckedChange={setAnonimo} />
      <span>Postar anonimamente</span>
    </div>
  )}
  
  <Button>Postar</Button>
</form>
```

## 📊 Views e Queries

### `posts_aprovados`
Já inclui dados do autor:
```sql
select 
  p.*,
  u.nome as autor_nome,
  u.avatar_url as autor_avatar,
  (count comentários) as total_comentarios
from posts p
left join users u on u.id = p.user_id
where p.status = 'aprovado'
```

### Buscar Favoritos de um Usuário
```sql
select * from buscar_favoritos_usuario('user-uuid', 'empresa')
```

## 🔒 Segurança

- RLS **desabilitado** na tabela `users` (login público)
- RLS **mantido** em `favoritos`, `posts`, `comentarios` (com políticas permissivas)
- Sem senha = sem hash, sem bcrypt, login super rápido
- Email único garante 1 conta por email
- `localStorage` persiste login localmente

## 🎯 Vantagens

✅ Login em **2 segundos** (só email)  
✅ Sem verificação de email  
✅ Sem senha pra esquecer  
✅ Favoritos sincronizam entre sessões  
✅ Usuário pode postar anônimo mesmo logado  
✅ Sistema funciona para não-logados também (com `user_identifier`)  

## 📱 Onde Adicionar

1. **App.tsx** ou **Header**: Adicionar `<UserButton />`
2. **Empresas.tsx**: Pedir login ao favoritar
3. **Mural.tsx**: Checkbox "Postar anonimamente"
4. **MeusLocais.tsx**: Mostrar favoritos do usuário logado

## 🐛 Debug

Verificar usuários cadastrados:
```sql
select * from public.users order by created_at desc;
```

Verificar favoritos de um usuário:
```sql
select * from public.favoritos where user_id = 'uuid-aqui';
```

Ver posts de um usuário:
```sql
select * from public.posts where user_id = 'uuid-aqui';
```
