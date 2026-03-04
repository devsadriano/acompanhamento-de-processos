-- ============================================
-- Acompanhamento de Processos - Database Schema para Supabase
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Dashboard > SQL Editor > New Query > Cole e Execute

-- 1. Criar tabela de processos
CREATE TABLE IF NOT EXISTS processos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- Dados do processo
  numero_processo TEXT,
  assunto TEXT,
  interessado TEXT,
  unidade TEXT,
  responsavel TEXT,
  
  -- Prazos e status - Coluna H/I (Prazo 1)
  prazo_1 DATE,
  acao_1 TEXT, -- RESPONDIDO, ANÁLISE, DILAÇÃO, ELABORAR, BLOQUEIO
  status_1 TEXT, -- Calculado no frontend
  
  -- Prazos e status - Coluna K/L (Prazo 2)
  prazo_2 DATE,
  acao_2 TEXT,
  status_2 TEXT,
  
  -- Observações e metadados
  observacoes TEXT,
  prioridade TEXT,
  tags TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint
  CONSTRAINT processos_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_processos_user_id ON processos(user_id);
CREATE INDEX IF NOT EXISTS idx_processos_prazo_1 ON processos(prazo_1);
CREATE INDEX IF NOT EXISTS idx_processos_prazo_2 ON processos(prazo_2);
CREATE INDEX IF NOT EXISTS idx_processos_created_at ON processos(created_at);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança
-- Usuários só podem ver seus próprios processos
CREATE POLICY "Users can view own processos" 
  ON processos FOR SELECT 
  USING (auth.uid() = user_id);

-- Usuários podem inserir seus próprios processos
CREATE POLICY "Users can insert own processos" 
  ON processos FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios processos
CREATE POLICY "Users can update own processos" 
  ON processos FOR UPDATE 
  USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios processos
CREATE POLICY "Users can delete own processos" 
  ON processos FOR DELETE 
  USING (auth.uid() = user_id);

-- 5. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para updated_at
DROP TRIGGER IF EXISTS update_processos_updated_at ON processos;
CREATE TRIGGER update_processos_updated_at 
  BEFORE UPDATE ON processos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Verificação
-- ============================================
-- Execute estas queries para verificar se tudo foi criado corretamente:

-- Ver estrutura da tabela
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'processos';

-- Ver políticas RLS
-- SELECT * FROM pg_policies WHERE tablename = 'processos';

-- Ver índices
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'processos';

-- ============================================
-- Dados de Teste (Opcional)
-- ============================================
-- Descomente para inserir dados de teste
-- IMPORTANTE: Substitua 'YOUR_USER_ID' pelo seu UUID de usuário

/*
INSERT INTO processos (
  user_id,
  numero_processo,
  assunto,
  interessado,
  unidade,
  responsavel,
  prazo_1,
  acao_1,
  prazo_2,
  acao_2,
  prioridade
) VALUES 
(
  'YOUR_USER_ID', -- Substitua pelo seu user_id
  '12345.678901/2026-00',
  'Solicitação de informações sobre processo administrativo',
  'João Silva',
  'GEAJ',
  'Maria Santos',
  CURRENT_DATE + INTERVAL '3 days',
  'ELABORAR',
  CURRENT_DATE + INTERVAL '10 days',
  'ANÁLISE',
  'ALTA'
),
(
  'YOUR_USER_ID',
  '98765.432109/2026-00',
  'Recurso administrativo',
  'Pedro Oliveira',
  'GEAJ',
  'Ana Costa',
  CURRENT_DATE - INTERVAL '2 days', -- Atrasado
  'ELABORAR',
  NULL,
  NULL,
  'MÉDIA'
);
*/

-- ============================================
-- Sucesso!
-- ============================================
-- Agora você pode:
-- 1. Configurar o .env com suas credenciais do Supabase
-- 2. Executar o projeto: npm run dev
-- 3. Fazer login e começar a usar o sistema
