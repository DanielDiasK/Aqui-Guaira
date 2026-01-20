# 🌟 Aqui Guaíra – Portal Comunitário

<div align="center">

![Aqui Guaíra](https://img.shields.io/badge/Guaíra-SP-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge&logo=supabase)

**Portal comunitário de Guaíra (SP)** - Conectando pessoas, empresas e cultura local

[Demo ao Vivo](#) | [Documentação](#funcionalidades) | [Contribuir](#contribuindo)

</div>

---

## 📋 Sobre o Projeto

**Aqui Guaíra** é uma plataforma web moderna que conecta a comunidade de Guaíra-SP, oferecendo:

- 🏢 **Diretório de Empresas Locais** - Descubra e favorite estabelecimentos da cidade
- 📣 **Mural Comunitário** - Compartilhe notícias, eventos e avisos
- 🗺️ **Locais Turísticos** - Explore pontos de interesse da região
- 💼 **Painel Empresarial** - Empresas podem gerenciar suas informações
- 👨‍💼 **Painel Administrativo** - Sistema completo de moderação

---

## ✨ Funcionalidades

### 👥 Para Usuários
- ✅ Navegação responsiva e intuitiva
- ✅ Sistema de favoritos (empresas e locais)
- ✅ Busca avançada com filtros (categoria, bairro, distância)
- ✅ Visualização detalhada de empresas
- ✅ Cadastro e login com autenticação segura
- ✅ Mural comunitário com postagens e imagens

### 🏪 Para Empresas
- ✅ Cadastro completo com CNPJ
- ✅ Upload de logo e banner
- ✅ Painel de gerenciamento (Dashboard)
- ✅ Edição de informações e categoria
- ✅ Sistema de login próprio

### 👨‍💼 Para Administradores
- ✅ Painel administrativo completo
- ✅ Moderação de empresas e posts
- ✅ Estatísticas em tempo real
- ✅ Sistema de logs de ações
- ✅ Bloqueio/desbloqueio de empresas

---

## 🚀 Tecnologias

### Frontend
- **React 18** - Biblioteca UI moderna
- **TypeScript** - Tipagem estática
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Estilização utility-first
- **shadcn/ui** - Componentes acessíveis (Radix UI)
- **React Router** - Navegação SPA
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Lucide Icons** - Ícones consistentes
- **Sonner** - Notificações toast

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL + PostGIS
  - Storage para imagens
  - Row Level Security (RLS)
  - Functions & Triggers
- **pgcrypto** - Criptografia de senhas

---

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou pnpm
- Conta Supabase (gratuita)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/aqui-guaira.git
cd aqui-guaira
```

### 2. Instale as dependências
```bash
npm install
# ou
pnpm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 4. Configure o banco de dados Supabase

Execute os scripts SQL na ordem:

```bash
# 1. Schema principal
supabase/schema.sql

# 2. Correções e ajustes
supabase/fix-rls.sql
supabase/add-cnpj-column.sql
supabase/add-users-table.sql
supabase/add-senha-column.sql

# 3. Dados iniciais
supabase/insert-categorias.sql

# 4. Sistema administrativo
supabase/admin-system.sql

# 5. Criar admin de teste
supabase/criar-admin-teste.sql
```

### 5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

---

## 🔐 Acesso Administrativo

### Credenciais de Teste

Após executar `supabase/criar-admin-teste.sql`:

```
Email: admin@test.com
Senha: 123456
```

### Criar Novo Administrador

Execute no Supabase SQL Editor:

```sql
SELECT criar_admin('seu@email.com', 'sua_senha_segura', 'Seu Nome');
```

### Acessar Painel Admin

Navegue para `/admin/login` e use as credenciais criadas.

**⚠️ IMPORTANTE:** Altere as credenciais padrão em produção!

---

## 📁 Estrutura do Projeto

```
aqui-guaira/
├── src/
│   ├── pages/              # Páginas principais
│   │   ├── Index.tsx       # Home
│   │   ├── Empresas.tsx    # Diretório de empresas
│   │   ├── MeusLocais.tsx  # Favoritos do usuário
│   │   ├── Mural.tsx       # Mural comunitário
│   │   ├── SuaEmpresa.tsx  # Cadastro de empresa
│   │   ├── Dashboard.tsx   # Painel da empresa
│   │   ├── AdminLogin.tsx  # Login admin
│   │   └── Admin.tsx       # Dashboard admin
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes shadcn/ui
│   │   ├── Header.tsx     # Cabeçalho
│   │   ├── Footer.tsx     # Rodapé
│   │   └── ...            # Outros componentes
│   ├── lib/               # Utilitários e configs
│   │   ├── supabase.ts    # Cliente Supabase + funções
│   │   └── utils.ts       # Helpers
│   ├── hooks/             # Custom hooks
│   ├── types/             # TypeScript types
│   └── styles/            # CSS/Tailwind
├── supabase/              # Scripts SQL
│   ├── schema.sql         # Schema principal
│   ├── admin-system.sql   # Sistema admin
│   └── ...                # Outros scripts
├── public/                # Assets estáticos
└── package.json
```

---

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor dev (Vite)

# Build
npm run build        # Build otimizado para produção
npm run preview      # Preview do build de produção

# Linting
npm run lint         # Verifica código com ESLint
```

---

## 🌐 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório no Vercel
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático em cada push

### Netlify

1. Conecte o repositório
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configure as mesmas variáveis de ambiente

---

## 📚 Documentação Adicional

- [MAPS_INTEGRATION.md](./MAPS_INTEGRATION.md) - Integração com Google Maps
- [SECURITY.md](./SECURITY.md) - Políticas de segurança
- [PRD.md](./PRD.md) - Product Requirements Document

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📝 Roadmap

- [ ] App mobile (React Native)
- [ ] Notificações push
- [ ] Chat entre empresas e usuários
- [ ] Sistema de avaliações
- [ ] Integração com redes sociais
- [ ] Analytics e relatórios
- [ ] PWA (Progressive Web App)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

Desenvolvido com ❤️ para a comunidade de Guaíra-SP

---

## 🙏 Agradecimentos

- Comunidade de Guaíra
- Contribuidores open source
- shadcn/ui e Radix UI
- Supabase team

---

<div align="center">

**[⬆ Voltar ao topo](#-aqui-guaíra--portal-comunitário)**

Feito com 💚 em Guaíra-SP

</div>