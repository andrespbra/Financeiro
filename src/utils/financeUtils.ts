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
export const INITIAL_CONTRACTS: Contract[] = [];

// Lançamentos Históricos Iniciais (Mês a Mês: Abril, Maio, Junho, Julho de 2026)
export const INITIAL_LEDGER: LedgerEntry[] = [];

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
