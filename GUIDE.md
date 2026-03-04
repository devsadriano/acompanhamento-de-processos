# Guia Rápido: Acompanhamento de Processos

## 🚀 Como testar o sistema agora

### 1. Configurar Supabase (5 minutos)
1.  Acesse [database.new](https://database.new) e crie um projeto (ex: `acompanhamento-de-processos`).
2.  Copie **Project URL** e **API Key (anon)** em `Settings > API`.
3.  Cole essas chaves no arquivo `.env` na raiz do projeto `c:\Antigravity\acompanhamento-de-processos\.env`.

### 2. Criar Banco de Dados (2 minutos)
1.  No Supabase, vá em **SQL Editor**.
2.  Abra o arquivo `supabase-schema.sql` deste projeto.
3.  Copie todo o conteúdo.
4.  Cole no SQL Editor do Supabase e clique em **Run**.

### 3. Rodar a Aplicação
1.  O servidor de desenvolvimento já está rodando (`npm run dev`).
2.  Acesse **[http://localhost:3000](http://localhost:3000)**.
3.  Digite seu email e clique em "Enviar Link Mágico".
4.  Abra seu email (cheque spam/promoções) e clique no link de login.

### 4. Importar Dados
1.  No painel, clique em **Importar Excel**.
2.  Selecione o arquivo `Geaj - 2026.xlsx` que está na pasta `data`.
3.  Aguarde a importação e veja seus processos aparecerem magicamente! ✨

### 💡 Dicas
- O sistema calcula automaticamente o status (ex: "ATRASADO", "ALERTA") baseado nas datas.
- Você pode editar qualquer processo clicando no ícone de lápis.
- Use a barra de pesquisa para filtrar processos rapidamente.
