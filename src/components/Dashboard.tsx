import React, { useState, useMemo } from 'react';
import { LedgerEntry, Contract } from '../types';
import {
  formatCurrency,
  getChronologicalMonths,
} from '../utils/financeUtils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Percent,
  Receipt,
  FileSpreadsheet,
  Briefcase,
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface DashboardProps {
  ledger: LedgerEntry[];
  contracts: Contract[];
}

export default function Dashboard({ ledger, contracts }: DashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('todos');

  // Obter todos os meses disponíveis para o filtro
  const availableMonths = useMemo(() => {
    const months = Array.from(new Set(ledger.map((item) => item.month)));
    return months.sort().reverse();
  }, [ledger]);

  // Filtrar os lançamentos com base no mês selecionado
  const filteredLedger = useMemo(() => {
    if (selectedMonth === 'todos') return ledger;
    return ledger.filter((item) => item.month === selectedMonth);
  }, [ledger, selectedMonth]);

  // Estatísticas Gerais (KPIs)
  const stats = useMemo(() => {
    let revenue = 0;
    let expense = 0;
    let employeeExpense = 0;
    let taxExpense = 0;
    let invoiceExpense = 0;
    let otherExpense = 0;

    filteredLedger.forEach((item) => {
      if (item.type === 'receita') {
        revenue += item.value;
      } else {
        expense += item.value;
        if (item.category === 'funcionario') {
          employeeExpense += item.value;
        } else if (item.category === 'imposto') {
          taxExpense += item.value;
        } else if (item.category === 'nota_fiscal') {
          invoiceExpense += item.value;
        } else {
          otherExpense += item.value;
        }
      }
    });

    const netProfit = revenue - expense;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return {
      revenue,
      expense,
      netProfit,
      profitMargin,
      employeeExpense,
      taxExpense,
      invoiceExpense,
      otherExpense,
    };
  }, [filteredLedger]);

  // Dados para o Gráfico de Fluxo de Caixa Mês a Mês
  const chartData = useMemo(() => {
    const chronologicalMonths = getChronologicalMonths(ledger);
    
    return chronologicalMonths.map((month) => {
      const monthEntries = ledger.filter((item) => item.month === month);
      let rev = 0;
      let exp = 0;

      monthEntries.forEach((item) => {
        if (item.type === 'receita') {
          rev += item.value;
        } else {
          exp += item.value;
        }
      });

      const profit = rev - exp;
      const margin = rev > 0 ? Number(((profit / rev) * 100).toFixed(1)) : 0;

      // Traduzir mês de AAAA-MM para "MMM/AA"
      const [year, m] = month.split('-');
      const monthNames = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];
      const label = `${monthNames[parseInt(m, 10) - 1]}/${year.substring(2)}`;

      return {
        month,
        label,
        'Faturamento (Receitas)': rev,
        'Despesas Totais': exp,
        'Lucro Líquido': profit,
        'Margem Lucro (%)': margin,
      };
    });
  }, [ledger]);

  // Dados de Rentabilidade Detalhada por Contrato
  const contractProfitability = useMemo(() => {
    return contracts.map((contract) => {
      const contractEntries = filteredLedger.filter(
        (item) => item.contractId === contract.id
      );

      let rev = 0;
      let expEmployee = 0;
      let expTax = 0;
      let expInvoice = 0;
      let expOther = 0;

      contractEntries.forEach((item) => {
        if (item.type === 'receita') {
          rev += item.value;
        } else {
          if (item.category === 'funcionario') expEmployee += item.value;
          else if (item.category === 'imposto') expTax += item.value;
          else if (item.category === 'nota_fiscal') expInvoice += item.value;
          else expOther += item.value;
        }
      });

      const totalExp = expEmployee + expTax + expInvoice + expOther;
      const profit = rev - totalExp;
      const margin = rev > 0 ? (profit / rev) * 100 : 0;

      return {
        ...contract,
        revenue: rev,
        expEmployee,
        expTax,
        expInvoice,
        expOther,
        totalExpenses: totalExp,
        netProfit: profit,
        margin,
      };
    });
  }, [contracts, filteredLedger]);

  // Lançamentos sem contrato vinculado (avulsos)
  const looseProfitability = useMemo(() => {
    const looseEntries = filteredLedger.filter(
      (item) => item.contractId === 'avulso' || !item.contractId
    );

    let rev = 0;
    let expEmployee = 0;
    let expTax = 0;
    let expInvoice = 0;
    let expOther = 0;

    looseEntries.forEach((item) => {
      if (item.type === 'receita') {
        rev += item.value;
      } else {
        if (item.category === 'funcionario') expEmployee += item.value;
        else if (item.category === 'imposto') expTax += item.value;
        else if (item.category === 'nota_fiscal') expInvoice += item.value;
        else expOther += item.value;
      }
    });

    const totalExp = expEmployee + expTax + expInvoice + expOther;
    const profit = rev - totalExp;
    const margin = rev > 0 ? (profit / rev) * 100 : 0;

    return {
      name: 'Lançamentos Avulsos (Sem Contrato)',
      revenue: rev,
      expEmployee,
      expTax,
      expInvoice,
      expOther,
      totalExpenses: totalExp,
      netProfit: profit,
      margin,
    };
  }, [filteredLedger]);

  return (
    <div className="space-y-6">
      {/* Top Bar with Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 id="dashboard-title" className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Fluxo de Caixa Mês a Mês
          </h2>
          <p className="text-sm text-slate-500">
            Acompanhe as receitas, despesas e margens de lucro de forma consolidada.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="month-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Período:
          </label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 px-3 font-medium outline-none cursor-pointer transition-colors hover:bg-slate-100"
          >
            <option value="todos">Histórico Completo (Todos os Meses)</option>
            {availableMonths.map((month) => {
              const [year, m] = month.split('-');
              const monthNames = [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
              ];
              return (
                <option key={month} value={month}>
                  {monthNames[parseInt(m, 10) - 1]} de {year}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturamento */}
        <div id="kpi-faturamento" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faturamento Total</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.revenue)}</p>
            <span className="inline-flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <TrendingUp className="w-3 h-3 mr-1" />
              Receitas de Contratos
            </span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Despesas */}
        <div id="kpi-despesas" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Despesas Operacionais</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.expense)}</p>
            <span className="inline-flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
              <TrendingDown className="w-3 h-3 mr-1" />
              Custos e Impostos
            </span>
          </div>
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Lucro Líquido */}
        <div id="kpi-lucro" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lucro Líquido</p>
            <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
              {formatCurrency(stats.netProfit)}
            </p>
            <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${
              stats.netProfit >= 0 
                ? 'text-blue-600 bg-blue-50 border-blue-100' 
                : 'text-rose-600 bg-rose-50 border-rose-100'
            }`}>
              {stats.netProfit >= 0 ? 'Saldo Positivo' : 'Déficit Financeiro'}
            </span>
          </div>
          <div className={`p-3 rounded-lg border ${
            stats.netProfit >= 0 
              ? 'bg-blue-50 border-blue-100 text-blue-600' 
              : 'bg-rose-50 border-rose-100 text-rose-600'
          }`}>
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Margem de Lucro % */}
        <div id="kpi-margem" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Margem de Lucro %</p>
            <p className={`text-2xl font-bold ${stats.profitMargin >= 30 ? 'text-emerald-600' : stats.profitMargin >= 15 ? 'text-amber-500' : 'text-red-600'}`}>
              {stats.profitMargin.toFixed(1)}%
            </p>
            <div className="w-32 bg-slate-100 rounded-full h-1.5 mt-2">
              <div 
                className={`h-1.5 rounded-full ${stats.profitMargin >= 30 ? 'bg-emerald-500' : stats.profitMargin >= 15 ? 'bg-amber-400' : 'bg-red-500'}`} 
                style={{ width: `${Math.max(0, Math.min(100, stats.profitMargin))}%` }}
              ></div>
            </div>
          </div>
          <div className={`p-3 rounded-lg border ${
            stats.profitMargin >= 30 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
              : stats.profitMargin >= 15 
              ? 'bg-amber-50 border-amber-100 text-amber-500' 
              : 'bg-red-50 border-red-100 text-red-600'
          }`}>
            <Percent className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Breakdowns detail panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses Pie Breakdown / List */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
            Detalhamento de Custos
          </h3>

          <div className="space-y-4">
            {/* Funcionarios */}
            <div className="flex justify-between items-center p-3 rounded-lg bg-amber-50/50 border border-amber-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Funcionários & Terceiros</p>
                  <p className="text-sm font-bold text-slate-800">{formatCurrency(stats.employeeExpense)}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-600">
                {stats.expense > 0 ? ((stats.employeeExpense / stats.expense) * 100).toFixed(1) : 0}%
              </span>
            </div>

            {/* Impostos */}
            <div className="flex justify-between items-center p-3 rounded-lg bg-red-50/50 border border-red-100">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Impostos & Tributos</p>
                  <p className="text-sm font-bold text-slate-800">{formatCurrency(stats.taxExpense)}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-red-500">
                {stats.expense > 0 ? ((stats.taxExpense / stats.expense) * 100).toFixed(1) : 0}%
              </span>
            </div>

            {/* Notas fiscais */}
            <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50/50 border border-blue-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Notas Fiscais / Ferramentas</p>
                  <p className="text-sm font-bold text-slate-800">{formatCurrency(stats.invoiceExpense)}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600">
                {stats.expense > 0 ? ((stats.invoiceExpense / stats.expense) * 100).toFixed(1) : 0}%
              </span>
            </div>

            {/* Outras despesas */}
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-250">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Outros Custos Avulsos</p>
                  <p className="text-sm font-bold text-slate-800">{formatCurrency(stats.otherExpense)}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-600">
                {stats.expense > 0 ? ((stats.otherExpense / stats.expense) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-slate-400" />
            <span>Os custos representam {stats.revenue > 0 ? ((stats.expense / stats.revenue) * 100).toFixed(0) : 0}% do faturamento bruto neste período.</span>
          </div>
        </div>

        {/* Recharts Month-by-month evolution chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
              Histórico de Evolução Financeira Mês a Mês
            </h3>
          </div>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis tickFormatter={(val) => `R$ ${val >= 1000 ? (val / 1000) + 'k' : val}`} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <Tooltip 
                    formatter={(value: any, name: any) => [formatCurrency(Number(value)), name]} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Faturamento (Receitas)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Despesas Totais" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Lucro Líquido" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Nenhum dado financeiro para exibir gráficos.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recharts Profitability Margin % evolution line chart */}
      {selectedMonth === 'todos' && chartData.length > 1 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
            Evolução da Margem de Lucro (%)
          </h3>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Margem de Lucro']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Area type="monotone" dataKey="Margem Lucro (%)" stroke="#2563eb" fillOpacity={1} fill="url(#colorMargin)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Contract profitability detailed table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Análise de Margem por Contrato Fixo</h3>
          <p className="text-sm text-slate-500">
            Comparativo detalhado de receitas contra custos padrão e variáveis por contrato para o período selecionado.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Contrato / Cliente</th>
                <th className="px-4 py-3">Receitas (R$)</th>
                <th className="px-4 py-3">Funcionários (R$)</th>
                <th className="px-4 py-3">Impostos (R$)</th>
                <th className="px-4 py-3">NFs / Custos (R$)</th>
                <th className="px-4 py-3">Total Despesas (R$)</th>
                <th className="px-4 py-3">Lucro Líquido (R$)</th>
                <th className="px-4 py-3 text-right">Margem %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {contractProfitability.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-4.5">
                    <div className="font-semibold text-slate-800">{item.name}</div>
                    <div className="text-xs text-slate-400 max-w-xs truncate">{item.description}</div>
                  </td>
                  <td className="px-4 py-4.5 text-emerald-600 font-semibold">{formatCurrency(item.revenue)}</td>
                  <td className="px-4 py-4.5 text-slate-600">{formatCurrency(item.expEmployee)}</td>
                  <td className="px-4 py-4.5 text-slate-600">{formatCurrency(item.expTax)}</td>
                  <td className="px-4 py-4.5 text-slate-600">{formatCurrency(item.expInvoice + item.expOther)}</td>
                  <td className="px-4 py-4.5 text-red-600 font-semibold">{formatCurrency(item.totalExpenses)}</td>
                  <td className={`px-4 py-4.5 font-bold ${item.netProfit >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                    {formatCurrency(item.netProfit)}
                  </td>
                  <td className="px-4 py-4.5 text-right">
                    <span className={`inline-flex items-center text-xs font-bold px-2 py-1 rounded-md ${
                      item.margin >= 35 
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' 
                        : item.margin >= 15 
                        ? 'text-amber-700 bg-amber-50 border border-amber-100' 
                        : 'text-rose-700 bg-rose-50 border border-rose-100'
                    }`}>
                      {item.margin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}

              {/* Linha de Lançamentos Avulsos */}
              {looseProfitability.revenue > 0 || looseProfitability.totalExpenses > 0 ? (
                <tr className="hover:bg-slate-50/50 bg-slate-50/30">
                  <td className="px-4 py-4.5">
                    <div className="font-semibold text-slate-700 italic">{looseProfitability.name}</div>
                    <div className="text-xs text-slate-400">Lançamentos avulsos na planilha sem contrato fixo associado</div>
                  </td>
                  <td className="px-4 py-4.5 text-emerald-600 font-semibold">{formatCurrency(looseProfitability.revenue)}</td>
                  <td className="px-4 py-4.5 text-slate-600">{formatCurrency(looseProfitability.expEmployee)}</td>
                  <td className="px-4 py-4.5 text-slate-600">{formatCurrency(looseProfitability.expTax)}</td>
                  <td className="px-4 py-4.5 text-slate-600">{formatCurrency(looseProfitability.expInvoice + looseProfitability.expOther)}</td>
                  <td className="px-4 py-4.5 text-red-600 font-semibold">{formatCurrency(looseProfitability.totalExpenses)}</td>
                  <td className={`px-4 py-4.5 font-bold ${looseProfitability.netProfit >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                    {formatCurrency(looseProfitability.netProfit)}
                  </td>
                  <td className="px-4 py-4.5 text-right">
                    <span className={`inline-flex items-center text-xs font-bold px-2 py-1 rounded-md ${
                      looseProfitability.margin >= 35 
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' 
                        : looseProfitability.margin >= 15 
                        ? 'text-amber-700 bg-amber-50 border border-amber-100' 
                        : 'text-rose-700 bg-rose-50 border border-rose-100'
                    }`}>
                      {looseProfitability.margin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ) : null}

              {/* Totais Consolidados */}
              <tr className="bg-slate-100/80 font-bold text-slate-800 border-t-2 border-slate-200">
                <td className="px-4 py-4">Total Consolidado</td>
                <td className="px-4 py-4 text-emerald-600 font-bold">{formatCurrency(stats.revenue)}</td>
                <td className="px-4 py-4">{formatCurrency(stats.employeeExpense)}</td>
                <td className="px-4 py-4">{formatCurrency(stats.taxExpense)}</td>
                <td className="px-4 py-4">{formatCurrency(stats.invoiceExpense + stats.otherExpense)}</td>
                <td className="px-4 py-4 text-red-600 font-bold">{formatCurrency(stats.expense)}</td>
                <td className={`px-4 py-4 font-extrabold ${stats.netProfit >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                  {formatCurrency(stats.netProfit)}
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="inline-flex items-center text-sm font-extrabold text-blue-700 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md">
                    {stats.profitMargin.toFixed(1)}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
