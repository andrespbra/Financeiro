import { Contract, LedgerEntry, TransactionCategory } from '../types';

// Função para formatar valores em Reais (R$)
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Rótulos amigáveis para as categorias
export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  valor_contrato: 'Receita do Contrato',
  funcionario: 'Funcionários & Terceirizados',
  imposto: 'Impostos & Tributos',
  nota_fiscal: 'Notas Fiscais de Despesas',
  outros: 'Outras Receitas/Despesas',
};

// Cores associadas às categorias
export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  valor_contrato: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  funcionario: 'text-amber-600 bg-amber-50 border-amber-200',
  imposto: 'text-red-600 bg-red-50 border-red-200',
  nota_fiscal: 'text-blue-600 bg-blue-50 border-blue-200',
  outros: 'text-slate-600 bg-slate-50 border-slate-200',
};

// Contratos Iniciais de Exemplo
export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'c1',
    name: 'Desenvolvimento Web - TechSolutions Corp',
    monthlyRevenue: 28000,
    employeeExpense: 9500,
    taxExpense: 1680, // ~6% Simples Nacional
    invoiceExpense: 1200, // Servidores e Ferramentas
    description: 'Desenvolvimento e manutenção de e-commerce corporativo de grande escala.',
    startDate: '2026-01',
    status: 'ativo',
  },
  {
    id: 'c2',
    name: 'Consultoria Cloud & DevOps - Alpha Finance',
    monthlyRevenue: 18500,
    employeeExpense: 7000,
    taxExpense: 1110,
    invoiceExpense: 800, // AWS / GCP dedicados
    description: 'Gestão de infraestrutura Kubernetes e pipelines CI/CD seguros.',
    startDate: '2026-02',
    status: 'ativo',
  },
  {
    id: 'c3',
    name: 'Suporte & Out-of-hours - Hospital Santa Luzia',
    monthlyRevenue: 12000,
    employeeExpense: 5000,
    taxExpense: 720,
    invoiceExpense: 450,
    description: 'Monitoramento de sistemas críticos e servidores 24/7.',
    startDate: '2026-03',
    status: 'ativo',
  },
  {
    id: 'c4',
    name: 'Fábrica de Software - Beta Logistics',
    monthlyRevenue: 35000,
    employeeExpense: 15000,
    taxExpense: 2100,
    invoiceExpense: 1800,
    description: 'Alocação de squad ágil para refatoração de sistemas de fretes.',
    startDate: '2026-05',
    status: 'ativo',
  }
];

// Lançamentos Históricos Iniciais (Mês a Mês: Abril, Maio, Junho, Julho de 2026)
export const INITIAL_LEDGER: LedgerEntry[] = [
  // --- ABRIL 2026 ---
  // Contrato TechSolutions
  {
    id: 'l_c1_rev_04',
    month: '2026-04',
    contractId: 'c1',
    contractName: 'Desenvolvimento Web - TechSolutions Corp',
    type: 'receita',
    category: 'valor_contrato',
    value: 28000,
    description: 'Faturamento mensal de Contrato - Ref: Abril/2026',
    dateLaunched: '2026-04-05T10:00:00.000Z',
  },
  {
    id: 'l_c1_emp_04',
    month: '2026-04',
    contractId: 'c1',
    contractName: 'Desenvolvimento Web - TechSolutions Corp',
    type: 'despesa',
    category: 'funcionario',
    value: 9500,
    description: 'Folha de pagamento Engenheiro Sênior alocado',
    dateLaunched: '2026-04-28T18:00:00.000Z',
  },
  {
    id: 'l_c1_tax_04',
    month: '2026-04',
    contractId: 'c1',
    contractName: 'Desenvolvimento Web - TechSolutions Corp',
    type: 'despesa',
    category: 'imposto',
    value: 1680,
    description: 'DAS Simples Nacional - Guia Unificada tributos',
    dateLaunched: '2026-04-20T14:30:00.000Z',
  },
  {
    id: 'l_c1_inv_04',
    month: '2026-04',
    contractId: 'c1',
    contractName: 'Desenvolvimento Web - TechSolutions Corp',
    type: 'despesa',
    category: 'nota_fiscal',
    value: 1200,
    description: 'Fatura de consumo Vercel Enterprise & Supabase Pro',
    dateLaunched: '2026-04-10T09:15:00.000Z',
  },

  // Contrato Alpha Finance
  {
    id: 'l_c2_rev_04',
    month: '2026-04',
    contractId: 'c2',
    contractName: 'Consultoria Cloud & DevOps - Alpha Finance',
    type: 'receita',
    category: 'valor_contrato',
    value: 18500,
    description: 'Mensalidade de consultoria cloud - Ref: Abril/2026',
    dateLaunched: '2026-04-05T11:00:00.000Z',
  },
  {
    id: 'l_c2_emp_04',
    month: '2026-04',
    contractId: 'c2',
    contractName: 'Consultoria Cloud & DevOps - Alpha Finance',
    type: 'despesa',
    category: 'funcionario',
    value: 7000,
    description: 'Folha de pagamento Especialista Cloud',
    dateLaunched: '2026-04-28T18:00:00.000Z',
  },
  {
    id: 'l_c2_tax_04',
    month: '2026-04',
    contractId: 'c2',
    contractName: 'Consultoria Cloud & DevOps - Alpha Finance',
    type: 'despesa',
    category: 'imposto',
    value: 1110,
    description: 'DAS Tributos Federais S/ Serviço de Nuvem',
    dateLaunched: '2026-04-20T14:30:00.000Z',
  },
  {
    id: 'l_c2_inv_04',
    month: '2026-04',
    contractId: 'c2',
    contractName: 'Consultoria Cloud & DevOps - Alpha Finance',
    type: 'despesa',
    category: 'nota_fiscal',
    value: 800,
    description: 'Fatura de serviços AWS Cloud Sandbox dev',
    dateLaunched: '2026-04-12T16:00:00.000Z',
  },

  // Contrato Santa Luzia
  {
    id: 'l_c3_rev_04',
    month: '2026-04',
    contractId: 'c3',
    contractName: 'Suporte & Out-of-hours - Hospital Santa Luzia',
    type: 'receita',
    category: 'valor_contrato',
    value: 12000,
    description: 'Faturamento Suporte Crítico - Ref: Abril/2026',
    dateLaunched: '2026-04-08T09:30:00.000Z',
  },
  {
    id: 'l_c3_emp_04',
    month: '2026-04',
    contractId: 'c3',
    contractName: 'Suporte & Out-of-hours - Hospital Santa Luzia',
    type: 'despesa',
    category: 'funcionario',
    value: 5000,
    description: 'Plantões e adicionais noturnos equipe de suporte',
    dateLaunched: '2026-04-28T18:00:00.000Z',
  },
  {
    id: 'l_c3_tax_04',
    month: '2026-04',
    contractId: 'c3',
    contractName: 'Suporte & Out-of-hours - Hospital Santa Luzia',
    type: 'despesa',
    category: 'imposto',
    value: 720,
    description: 'Retenção de ISSQN e contribuição simples',
    dateLaunched: '2026-04-20T14:30:00.000Z',
  },
  {
    id: 'l_c3_inv_04',
    month: '2026-04',
    contractId: 'c3',
    contractName: 'Suporte & Out-of-hours - Hospital Santa Luzia',
    type: 'despesa',
    category: 'nota_fiscal',
    value: 450,
    description: 'NF Datadog monitoramento licenças',
    dateLaunched: '2026-04-15T11:00:00.000Z',
  },

  // --- MAIO 2026 ---
  // TechSolutions
  { id: 'l_c1_rev_05', month: '2026-05', contractId: 'c1', contractName: 'Desenvolvimento Web - TechSolutions Corp', type: 'receita', category: 'valor_contrato', value: 28000, description: 'Faturamento contratual - Maio/2026', dateLaunched: '2026-05-05T10:00:00.000Z' },
  { id: 'l_c1_emp_05', month: '2026-05', contractId: 'c1', contractName: 'Desenvolvimento Web - TechSolutions Corp', type: 'despesa', category: 'funcionario', value: 9500, description: 'Folha de pagamento dev sênior alocado', dateLaunched: '2026-05-28T18:00:00.000Z' },
  { id: 'l_c1_tax_05', month: '2026-05', contractId: 'c1', contractName: 'Desenvolvimento Web - TechSolutions Corp', type: 'despesa', category: 'imposto', value: 1680, description: 'DAS Unificado Maio', dateLaunched: '2026-05-20T14:30:00.000Z' },
  { id: 'l_c1_inv_05', month: '2026-05', contractId: 'c1', contractName: 'Desenvolvimento Web - TechSolutions Corp', type: 'despesa', category: 'nota_fiscal', value: 1200, description: 'SaaS Infraestrutura Vercel/Supabase', dateLaunched: '2026-05-10T09:15:00.000Z' },

  // Alpha Finance
  { id: 'l_c2_rev_05', month: '2026-05', contractId: 'c2', contractName: 'Consultoria Cloud & DevOps - Alpha Finance', type: 'receita', category: 'valor_contrato', value: 18500, description: 'Mensalidade consultoria - Maio/2026', dateLaunched: '2026-05-05T11:00:00.000Z' },
  { id: 'l_c2_emp_05', month: '2026-05', contractId: 'c2', contractName: 'Consultoria Cloud & DevOps - Alpha Finance', type: 'despesa', category: 'funcionario', value: 7000, description: 'Salário consultor cloud', dateLaunched: '2026-05-28T18:00:00.000Z' },
  { id: 'l_c2_tax_05', month: '2026-05', contractId: 'c2', contractName: 'Consultoria Cloud & DevOps - Alpha Finance', type: 'despesa', category: 'imposto', value: 1110, description: 'Impostos Simples Nacional', dateLaunched: '2026-05-20T14:30:00.000Z' },
  { id: 'l_c2_inv_05', month: '2026-05', contractId: 'c2', contractName: 'Consultoria Cloud & DevOps - Alpha Finance', type: 'despesa', category: 'nota_fiscal', value: 800, description: 'AWS dev infra', dateLaunched: '2026-05-12T16:00:00.000Z' },

  // Santa Luzia
  { id: 'l_c3_rev_05', month: '2026-05', contractId: 'c3', contractName: 'Suporte & Out-of-hours - Hospital Santa Luzia', type: 'receita', category: 'valor_contrato', value: 12000, description: 'Faturamento Suporte - Maio/2026', dateLaunched: '2026-05-08T09:30:00.000Z' },
  { id: 'l_c3_emp_05', month: '2026-05', contractId: 'c3', contractName: 'Suporte & Out-of-hours - Hospital Santa Luzia', type: 'despesa', category: 'funcionario', value: 5000, description: 'Folha plantonistas de suporte', dateLaunched: '2026-05-28T18:00:00.000Z' },
  { id: 'l_c3_tax_05', month: '2026-05', contractId: 'c3', contractName: 'Suporte & Out-of-hours - Hospital Santa Luzia', type: 'despesa', category: 'imposto', value: 720, description: 'Guia tributária ISSQN', dateLaunched: '2026-05-20T14:30:00.000Z' },
  { id: 'l_c3_inv_05', month: '2026-05', contractId: 'c3', contractName: 'Suporte & Out-of-hours - Hospital Santa Luzia', type: 'despesa', category: 'nota_fiscal', value: 450, description: 'Monitoramento Datadog', dateLaunched: '2026-05-15T11:00:00.000Z' },

  // Beta Logistics (Novo Contrato iniciando em Maio)
  {
    id: 'l_c4_rev_05',
    month: '2026-05',
    contractId: 'c4',
    contractName: 'Fábrica de Software - Beta Logistics',
    type: 'receita',
    category: 'valor_contrato',
    value: 35000,
    description: 'Primeira parcela de contrato de Fábrica - Ref: Maio/2026',
    dateLaunched: '2026-05-06T14:00:00.000Z',
  },
  {
    id: 'l_c4_emp_05',
    month: '2026-05',
    contractId: 'c4',
    contractName: 'Fábrica de Software - Beta Logistics',
    type: 'despesa',
    category: 'funcionario',
    value: 15000,
    description: 'Alocação de 2 Devs Plenos para o squad ágil',
    dateLaunched: '2026-05-28T18:00:00.000Z',
  },
  {
    id: 'l_c4_tax_05',
    month: '2026-05',
    contractId: 'c4',
    contractName: 'Fábrica de Software - Beta Logistics',
    type: 'despesa',
    category: 'imposto',
    value: 2100,
    description: 'DAS Unificado (Alíquota do Anexo V reduzida para 6%)',
    dateLaunched: '2026-05-20T14:30:00.000Z',
  },
  {
    id: 'l_c4_inv_05',
    month: '2026-05',
    contractId: 'c4',
    contractName: 'Fábrica de Software - Beta Logistics',
    type: 'despesa',
    category: 'nota_fiscal',
    value: 1800,
    description: 'Compra de licenças JetBrains e ferramentas de modelagem',
    dateLaunched: '2026-05-18T10:00:00.000Z',
  },

  // --- JUNHO 2026 ---
  // TechSolutions
  { id: 'l_c1_rev_06', month: '2026-06', contractId: 'c1', contractName: 'Desenvolvimento Web - TechSolutions Corp', type: 'receita', category: 'valor_contrato', value: 28000, description: 'Faturamento contratual - Junho/2026', dateLaunched: '2026-06-05T10:00:00.000Z' },
  { id: 'l_c1_emp_06', month: '2026-06', contractId: 'c1', contractName: 'Desenvolvimento Web - TechSolutions Corp', type: 'despesa', category: 'funcionario', value: 9500, description: 'Folha de pagamento dev sênior alocado', dateLaunched: '2026-06-28T18:00:00.000Z' },
  { id: 'l_c1_tax_06', month: '2026-06', contractId: 'c1', contractName: 'Desenvolvimento Web - TechSolutions Corp', type: 'despesa', category: 'imposto', value: 1680, description: 'DAS Unificado Junho', dateLaunched: '2026-06-20T14:30:00.000Z' },
  { id: 'l_c1_inv_06', month: '2026-06', contractId: 'c1', contractName: 'Desenvolvimento Web - TechSolutions Corp', type: 'despesa', category: 'nota_fiscal', value: 1200, description: 'SaaS Infraestrutura Vercel/Supabase', dateLaunched: '2026-06-10T09:15:00.000Z' },

  // Alpha Finance
  { id: 'l_c2_rev_06', month: '2026-06', contractId: 'c2', contractName: 'Consultoria Cloud & DevOps - Alpha Finance', type: 'receita', category: 'valor_contrato', value: 18500, description: 'Mensalidade consultoria - Junho/2026', dateLaunched: '2026-06-05T11:00:00.000Z' },
  { id: 'l_c2_emp_06', month: '2026-06', contractId: 'c2', contractName: 'Consultoria Cloud & DevOps - Alpha Finance', type: 'despesa', category: 'funcionario', value: 7000, description: 'Salário consultor cloud', dateLaunched: '2026-06-28T18:00:00.000Z' },
  { id: 'l_c2_tax_06', month: '2026-06', contractId: 'c2', contractName: 'Consultoria Cloud & DevOps - Alpha Finance', type: 'despesa', category: 'imposto', value: 1110, description: 'Impostos Simples Nacional', dateLaunched: '2026-06-20T14:30:00.000Z' },
  { id: 'l_c2_inv_06', month: '2026-06', contractId: 'c2', contractName: 'Consultoria Cloud & DevOps - Alpha Finance', type: 'despesa', category: 'nota_fiscal', value: 800, description: 'AWS dev infra', dateLaunched: '2026-06-12T16:00:00.000Z' },

  // Santa Luzia (teve um bônus de extra support e uma NF extra)
  { id: 'l_c3_rev_06', month: '2026-06', contractId: 'c3', contractName: 'Suporte & Out-of-hours - Hospital Santa Luzia', type: 'receita', category: 'valor_contrato', value: 12000, description: 'Faturamento Suporte - Junho/2026', dateLaunched: '2026-06-08T09:30:00.000Z' },
  { id: 'l_c3_rev_06_bonus', month: '2026-06', contractId: 'c3', contractName: 'Suporte & Out-of-hours - Hospital Santa Luzia', type: 'receita', category: 'outros', value: 3000, description: 'Acordo extra por horas adicionais pós-incidente', dateLaunched: '2026-06-12T10:00:00.000Z' },
  { id: 'l_c3_emp_06', month: '2026-06', contractId: 'c3', contractName: 'Suporte & Out-of-hours - Hospital Santa Luzia', type: 'despesa', category: 'funcionario', value: 5800, description: 'Folha plantonistas + adicionais plantão extra', dateLaunched: '2026-06-28T18:00:00.000Z' },
  { id: 'l_c3_tax_06', month: '2026-06', contractId: 'c3', contractName: 'Suporte & Out-of-hours - Hospital Santa Luzia', type: 'despesa', category: 'imposto', value: 900, description: 'Guia tributária proporcional ao faturamento extra', dateLaunched: '2026-06-20T14:30:00.000Z' },
  { id: 'l_c3_inv_06', month: '2026-06', contractId: 'c3', contractName: 'Suporte & Out-of-hours - Hospital Santa Luzia', type: 'despesa', category: 'nota_fiscal', value: 450, description: 'Monitoramento Datadog', dateLaunched: '2026-06-15T11:00:00.000Z' },

  // Beta Logistics
  { id: 'l_c4_rev_06', month: '2026-06', contractId: 'c4', contractName: 'Fábrica de Software - Beta Logistics', type: 'receita', category: 'valor_contrato', value: 35000, description: 'Mensalidade Fábrica - Junho/2026', dateLaunched: '2026-06-06T14:00:00.000Z' },
  { id: 'l_c4_emp_06', month: '2026-06', contractId: 'c4', contractName: 'Fábrica de Software - Beta Logistics', type: 'despesa', category: 'funcionario', value: 15000, description: 'Folha squad Beta Logistics', dateLaunched: '2026-06-28T18:00:00.000Z' },
  { id: 'l_c4_tax_06', month: '2026-06', contractId: 'c4', contractName: 'Fábrica de Software - Beta Logistics', type: 'despesa', category: 'imposto', value: 2100, description: 'DAS Unificado Junho', dateLaunched: '2026-06-20T14:30:00.000Z' },
  { id: 'l_c4_inv_06', month: '2026-06', contractId: 'c4', contractName: 'Fábrica de Software - Beta Logistics', type: 'despesa', category: 'nota_fiscal', value: 1800, description: 'SaaS e ferramentas de Dev', dateLaunched: '2026-06-18T10:00:00.000Z' },

  // --- JULHO 2026 (Atuais parcial) ---
  // TechSolutions
  { id: 'l_c1_rev_07', month: '2026-07', contractId: 'c1', contractName: 'Desenvolvimento Web - TechSolutions Corp', type: 'receita', category: 'valor_contrato', value: 28000, description: 'Faturamento contratual - Julho/2026', dateLaunched: '2026-07-05T10:00:00.000Z' },
  { id: 'l_c1_emp_07', month: '2026-07', contractId: 'c1', contractName: 'Desenvolvimento Web - TechSolutions Corp', type: 'despesa', category: 'funcionario', value: 9500, description: 'Folha de pagamento dev sênior alocado', dateLaunched: '2026-07-10T18:00:00.000Z' },
  { id: 'l_c1_tax_07', month: '2026-07', contractId: 'c1', contractName: 'Desenvolvimento Web - TechSolutions Corp', type: 'despesa', category: 'imposto', value: 1680, description: 'DAS Unificado Julho (Provisionado)', dateLaunched: '2026-07-12T14:30:00.000Z' },
  { id: 'l_c1_inv_07', month: '2026-07', contractId: 'c1', contractName: 'Desenvolvimento Web - TechSolutions Corp', type: 'despesa', category: 'nota_fiscal', value: 1200, description: 'SaaS Infraestrutura Vercel/Supabase', dateLaunched: '2026-07-09T09:15:00.000Z' },

  // Alpha Finance
  { id: 'l_c2_rev_07', month: '2026-07', contractId: 'c2', contractName: 'Consultoria Cloud & DevOps - Alpha Finance', type: 'receita', category: 'valor_contrato', value: 18500, description: 'Mensalidade consultoria - Julho/2026', dateLaunched: '2026-07-05T11:00:00.000Z' },
  { id: 'l_c2_emp_07', month: '2026-07', contractId: 'c2', contractName: 'Consultoria Cloud & DevOps - Alpha Finance', type: 'despesa', category: 'funcionario', value: 7000, description: 'Salário consultor cloud', dateLaunched: '2026-07-10T18:00:00.000Z' },
  { id: 'l_c2_tax_07', month: '2026-07', contractId: 'c2', contractName: 'Consultoria Cloud & DevOps - Alpha Finance', type: 'despesa', category: 'imposto', value: 1110, description: 'Impostos Simples Nacional', dateLaunched: '2026-07-12T14:30:00.000Z' },
  { id: 'l_c2_inv_07', month: '2026-07', contractId: 'c2', contractName: 'Consultoria Cloud & DevOps - Alpha Finance', type: 'despesa', category: 'nota_fiscal', value: 800, description: 'AWS dev infra', dateLaunched: '2026-07-11T16:00:00.000Z' }
];

// Gerar uma lista de meses únicos em ordem cronológica
export function getAvailableMonths(ledger: LedgerEntry[]): string[] {
  const months = Array.from(new Set(ledger.map((item) => item.month)));
  return months.sort().reverse(); // Decrescente para seletores de filtro, ou crescente para o gráfico
}

// Obter os meses em ordem cronológica crescente para os gráficos
export function getChronologicalMonths(ledger: LedgerEntry[]): string[] {
  const months = Array.from(new Set(ledger.map((item) => item.month)));
  return months.sort();
}
