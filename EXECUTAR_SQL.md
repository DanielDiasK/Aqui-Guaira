# Como Executar os Scripts SQL no Supabase

## Passos para Criar as Tabelas Faltantes:

### 1. Acessar o Supabase
1. Entre em: https://supabase.com/dashboard
2. Selecione o projeto: `kdyjebtzuniisxecaslm`

### 2. Abrir o SQL Editor
1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **New Query** (Nova Consulta)

### 3. Executar os Scripts (NA ORDEM):

#### A) Script pets-perdidos.sql
1. Abra o arquivo: `supabase/pets-perdidos.sql`
2. Copie TODO o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)
5. Aguarde a mensagem: ✅ Tabela pets_perdidos criada com sucesso!

#### B) Script painel-cidade.sql
1. Abra o arquivo: `supabase/painel-cidade.sql`
2. Copie TODO o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run**
5. Aguarde as mensagens de sucesso

### 4. Verificar as Tabelas Criadas
1. No menu lateral, clique em **Table Editor**
2. Você deve ver as novas tabelas:
   - `pets_perdidos`
   - `obras_interdicoes`
   - `agenda_eventos`
   - `vagas_emprego`

### 5. Testar a Aplicação
Após executar os scripts, recarregue a página da aplicação:
- http://localhost:8081/pets-perdidos
- http://localhost:8081/painel-cidade

## Tabelas que Precisam Ser Criadas:

- [x] `achados_perdidos` - ✅ JÁ EXECUTADO
- [ ] `pets_perdidos` - ⚠️ EXECUTAR AGORA
- [ ] `obras_interdicoes` - ⚠️ EXECUTAR AGORA
- [ ] `agenda_eventos` - ⚠️ EXECUTAR AGORA
- [ ] `vagas_emprego` - ⚠️ EXECUTAR AGORA

## Troubleshooting:

### Se aparecer erro de permissão:
Execute primeiro no SQL Editor:
```sql
ALTER TABLE public.pets_perdidos ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para todos
CREATE POLICY "Permitir leitura pública" ON public.pets_perdidos
  FOR SELECT USING (true);

-- Permitir inserção para usuários autenticados
CREATE POLICY "Permitir inserção autenticada" ON public.pets_perdidos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permitir atualização apenas do próprio registro
CREATE POLICY "Permitir atualização própria" ON public.pets_perdidos
  FOR UPDATE USING (auth.uid() = user_id);

-- Permitir exclusão apenas do próprio registro
CREATE POLICY "Permitir exclusão própria" ON public.pets_perdidos
  FOR DELETE USING (auth.uid() = user_id);
```

### Se der erro "column user_id does not exist":
Certifique-se que a tabela `users` existe. Execute:
```sql
SELECT * FROM public.users LIMIT 1;
```

Se não existir, execute primeiro: `supabase/add-users-table.sql`
