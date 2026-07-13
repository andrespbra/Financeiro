export type TransactionType = 'receita' | 'despesa';

export type TransactionCategory =
  | 'valor_contrato'    // Receita do contratado
  | 'funcionario'       // Despesa com funcionários
  | 'imposto'           // Despesa com impostos
  | 'nota_fiscal'       // Outras notas fiscais de despesa
  | 'outros';           // Outros lançamentos

export interface Contract {
  id: string;
  name: string;
  monthlyRevenue: number;     // Valor padrão do contratado (Receita)
  employeeExpense: number;    // Despesa padrão com funcionário
  taxExpense: number;         // Despesa padrão com impostos
  invoiceExpense: number;     // Despesa padrão com notas fiscais
  description: string;
  startDate: string;          // YYYY-MM
  status: 'ativo' | 'inativo';
}

export interface LedgerEntry {
  id: string;
  month: string;              // YYYY-MM
  contractId: string;         // Referência ao contrato (pode ser 'avulso' para sem contrato)
  contractName: string;
  type: TransactionType;
  category: TransactionCategory;
  value: number;              // Valor em R$
  description: string;
  dateLaunched: string;       // Timestamp ISO ou data simples
}
