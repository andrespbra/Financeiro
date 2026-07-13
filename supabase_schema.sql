-- SQL Script to set up your Supabase database tables for the Finance Ledger app
-- Paste this script into your Supabase SQL Editor (Dashboard -> Project -> SQL Editor -> New Query -> Run)

-- 1. Create the Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_revenue NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  employee_expense NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  tax_expense NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  invoice_expense NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  description TEXT,
  start_date TEXT NOT NULL, -- Format: YYYY-MM
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create the Ledger Entries table (Faturamento / Despesas)
CREATE TABLE IF NOT EXISTS ledger_entries (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL, -- Format: YYYY-MM
  contract_id TEXT NOT NULL, -- References contract.id or 'avulso' for stand-alone entries
  contract_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  category TEXT NOT NULL CHECK (category IN ('valor_contrato', 'funcionario', 'imposto', 'nota_fiscal', 'outros')),
  value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  description TEXT,
  date_launched TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable Row-Level Security (RLS)
-- This secures your database. By default, with these policies, anyone with the anon key can read/write data.
-- If you implement user login later, you can restrict policies to auth.uid() = user_id.
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for Anonymous Client-side Read/Write
CREATE POLICY "Allow public select on contracts" ON contracts FOR SELECT USING (true);
CREATE POLICY "Allow public insert on contracts" ON contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on contracts" ON contracts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on contracts" ON contracts FOR DELETE USING (true);

CREATE POLICY "Allow public select on ledger_entries" ON ledger_entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert on ledger_entries" ON ledger_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on ledger_entries" ON ledger_entries FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on ledger_entries" ON ledger_entries FOR DELETE USING (true);

-- 5. Seed Initial Data (Optional - Only run if you want to start with the demo contracts)
INSERT INTO contracts (id, name, monthly_revenue, employee_expense, tax_expense, invoice_expense, description, start_date, status)
VALUES 
('c1', 'Desenvolvimento Web - TechSolutions Corp', 28000.00, 9500.00, 1680.00, 1200.00, 'Desenvolvimento e manutenção de e-commerce corporativo de grande escala.', '2026-01', 'ativo'),
('c2', 'Consultoria Cloud & DevOps - Alpha Finance', 18500.00, 7000.00, 1110.00, 800.00, 'Gestão de infraestrutura Kubernetes e pipelines CI/CD seguros.', '2026-02', 'ativo'),
('c3', 'Suporte & Out-of-hours - Hospital Santa Luzia', 12000.00, 5000.00, 720.00, 450.00, 'Monitoramento de sistemas críticos e servidores 24/7.', '2026-03', 'ativo'),
('c4', 'Fábrica de Software - Beta Logistics', 35000.00, 15000.00, 2100.00, 1800.00, 'Alocação de squad ágil para refatoração de sistemas de fretes.', '2026-05', 'ativo')
ON CONFLICT (id) DO NOTHING;
