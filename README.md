# Acompanhamento de Processos - Sistema de Gestão de Processos SEI

Sistema web moderno para gerenciamento de processos SEI com cálculo automático de status baseado em prazos.

## 🚀 Stack Tecnológica

- **Frontend**: Nuxt 4 (Vue 3 + TypeScript)
- **Backend/Database**: Supabase (PostgreSQL + Auth)
- **Styling**: TailwindCSS
- **Business Logic**: 1,088 fórmulas Excel convertidas para TypeScript

## 📋 Pré-requisitos

- Node.js 18+ e npm
- Conta no Supabase (gratuita)

## 🛠️ Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Copie as credenciais do projeto (URL e Anon Key)
3. Edite o arquivo `.env` e adicione suas credenciais:

```env
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_KEY="sua-anon-key"
```

### 3. Criar Database Schema

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Abra o arquivo `supabase-schema.sql` deste projeto
4. Copie todo o conteúdo e cole no SQL Editor
5. Clique em **Run** para executar o script

Isso criará:
- ✅ Tabela `processos` com todas as colunas
- ✅ Índices para performance
- ✅ Row Level Security (RLS) policies
- ✅ Triggers automáticos

### 4. Executar o Projeto

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🔐 Autenticação

O sistema usa **Magic Link** (link mágico) do Supabase:

1. Na tela de login, digite seu email
2. Você receberá um link de acesso por email
3. Clique no link para fazer login
4. Não precisa de senha! 🎉

**Importante**: Configure o domínio permitido no Supabase:
- Dashboard > Authentication > URL Configuration
- Adicione `http://localhost:3000` em **Site URL** e **Redirect URLs**

## 📊 Funcionalidades

### ✅ Implementado

- [x] Autenticação via Magic Link
- [x] Dashboard com estatísticas
- [x] Listagem de processos
- [x] Cálculo automático de status (8 regras de negócio)
- [x] Filtros e ordenação
- [x] Responsivo (mobile-friendly)

### 🚧 Próximas Implementações

- [ ] Formulário para criar/editar processos
- [ ] Importação de Excel
- [ ] Exportação de relatórios
- [ ] Notificações de prazos
- [ ] Filtros avançados
- [ ] Gráficos e dashboards

## 🧮 Regras de Negócio (Status)

O sistema calcula automaticamente o status baseado nas fórmulas do Excel:

| Condição | Status |
|----------|--------|
| Ação = "RESPONDIDO" | CONCLUÍDO |
| Ação = "ANÁLISE" ou "BLOQUEIO" | AGUARDANDO DESPACHO |
| Ação = "DILAÇÃO" | AGUARDANDO NOVO PRAZO |
| Ação = "ELABORAR" | PENDENTE |
| Prazo < Hoje | ATRASADO |
| Prazo = Hoje | COBRAR |
| Prazo ≤ 5 dias | ALERTA |
| Prazo > 5 dias | NO PRAZO |

## 📁 Estrutura do Projeto

```
acompanhamento-de-processos/
├── app/
│   ├── components/        # Componentes Vue
│   ├── composables/       # Lógica de negócio
│   │   ├── useProcessos.ts
│   │   └── useStatusCalculator.ts
│   ├── pages/            # Rotas
│   │   ├── index.vue     # Dashboard
│   │   ├── login.vue     # Login
│   │   └── confirm.vue   # Confirmação
│   └── utils/            # Funções auxiliares
├── shared/
│   ├── types/            # TypeScript types
│   └── constants/        # Constantes
├── server/
│   └── api/              # API routes
├── nuxt.config.ts        # Configuração Nuxt
├── supabase-schema.sql   # Schema do banco
└── .env                  # Variáveis de ambiente
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Gerar tipos do Supabase
npx supabase gen types typescript --project-id "seu-project-id" > shared/types/database.types.ts
```

## 🐛 Troubleshooting

### Erro: "Invalid API key"
- Verifique se o `.env` está configurado corretamente
- Confirme que copiou a **Anon Key** (não a Service Key)

### Erro: "relation processos does not exist"
- Execute o script `supabase-schema.sql` no SQL Editor do Supabase

### Não recebo o email de login
- Verifique a pasta de spam
- Confirme que o email está correto
- Verifique as configurações de SMTP no Supabase (Auth > Email Templates)

### Erro de CORS
- Adicione `http://localhost:3000` nas URLs permitidas do Supabase
- Dashboard > Authentication > URL Configuration

## 📝 Próximos Passos

1. ✅ Configure o Supabase
2. ✅ Execute o schema SQL
3. ✅ Faça login no sistema
4. 🔄 Implemente a importação de Excel
5. 🔄 Adicione formulários de CRUD
6. 🔄 Deploy em produção (Vercel/Netlify)

## 📄 Licença

MIT

## 👨‍💻 Desenvolvido com

- ❤️ Nuxt 4
- ⚡ Supabase
- 🎨 TailwindCSS
- 📊 1,088 fórmulas Excel → TypeScript
