import React, { useState } from 'react';
import { Contract, LedgerEntry } from '../types';
import { formatCurrency } from '../utils/financeUtils';
import {
  Plus,
  Briefcase,
  Users,
  Percent,
  Receipt,
  FileText,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
} from 'lucide-react';

interface ContractsSectionProps {
  contracts: Contract[];
  onAddContract: (contract: Contract) => void;
  onUpdateContract: (contract: Contract) => void;
  onDeleteContract: (id: string) => void;
  onBulkProvision: (contract: Contract, month: string) => void;
}

export default function ContractsSection({
  contracts,
  onAddContract,
  onUpdateContract,
  onDeleteContract,
  onBulkProvision,
}: ContractsSectionProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [selectedContractForProvision, setSelectedContractForProvision] = useState<Contract | null>(null);
  const [provisionMonth, setProvisionMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Estado para formulário de cadastro/edição
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [name, setName] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [employeeExpense, setEmployeeExpense] = useState(0);
  const [taxExpense, setTaxExpense] = useState(0);
  const [invoiceExpense, setInvoiceExpense] = useState(0);
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');

  const resetForm = () => {
    setName('');
    setMonthlyRevenue(0);
    setEmployeeExpense(0);
    setTaxExpense(0);
    setInvoiceExpense(0);
    setDescription('');
    setStartDate(new Date().toISOString().substring(0, 7));
    setStatus('ativo');
    setIsEditing(false);
    setEditId('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (c: Contract) => {
    setName(c.name);
    setMonthlyRevenue(c.monthlyRevenue);
    setEmployeeExpense(c.employeeExpense);
    setTaxExpense(c.taxExpense);
    setInvoiceExpense(c.invoiceExpense);
    setDescription(c.description);
    setStartDate(c.startDate);
    setStatus(c.status);
    setEditId(c.id);
    setIsEditing(true);
    setIsAddOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const contractData: Contract = {
      id: isEditing ? editId : 'c_' + Date.now(),
      name,
      monthlyRevenue: Number(monthlyRevenue),
      employeeExpense: Number(employeeExpense),
      taxExpense: Number(taxExpense),
      invoiceExpense: Number(invoiceExpense),
      description,
      startDate,
      status,
    };

    if (isEditing) {
      onUpdateContract(contractData);
    } else {
      onAddContract(contractData);
    }
    setIsAddOpen(false);
    resetForm();
  };

  const handleOpenProvision = (c: Contract) => {
    setSelectedContractForProvision(c);
    setIsProvisionOpen(true);
  };

  const handleConfirmProvision = () => {
    if (selectedContractForProvision && provisionMonth) {
      onBulkProvision(selectedContractForProvision, provisionMonth);
      setIsProvisionOpen(false);
      setSelectedContractForProvision(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Contratos Fixos Recorrentes
          </h2>
          <p className="text-sm text-slate-500">
            Gerencie os contratos de prestação de serviços fixos, seus valores recorrentes e despesas base associadas.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm shadow-blue-100"
        >
          <Plus className="w-4 h-4" />
          Novo Contrato Fixo
        </button>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contracts.map((c) => {
          const theoreticalProfit = c.monthlyRevenue - (c.employeeExpense + c.taxExpense + c.invoiceExpense);
          const theoreticalMargin = c.monthlyRevenue > 0 ? (theoreticalProfit / c.monthlyRevenue) * 100 : 0;

          return (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-800 text-base md:text-lg">{c.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      c.status === 'ativo' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {c.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Início: {c.startDate}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    title="Editar Contrato"
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteContract(c.id)}
                    title="Excluir Contrato"
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {c.description && (
                <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-150 font-medium">
                  {c.description}
                </p>
              )}

              {/* Financial Summary values */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Receita Padrão</span>
                  <span className="text-base font-extrabold text-emerald-700 block">{formatCurrency(c.monthlyRevenue)}</span>
                </div>
                <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-100 space-y-1">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Margem Teórica</span>
                  <span className={`text-base font-extrabold block ${theoreticalMargin >= 35 ? 'text-emerald-700' : theoreticalMargin >= 15 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {theoreticalMargin.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Expenses detail values */}
              <div className="space-y-2 border-t border-b border-slate-200 py-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Despesas Fixas Padrão:</h4>
                
                {/* Funcionario */}
                <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-500" />
                    Funcionário Alocado
                  </span>
                  <span>{formatCurrency(c.employeeExpense)}</span>
                </div>

                {/* Impostos */}
                <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-red-400" />
                    Impostos Estimados
                  </span>
                  <span>{formatCurrency(c.taxExpense)}</span>
                </div>

                {/* Notas Fiscais */}
                <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-blue-400" />
                    Notas Fiscais de Custo
                  </span>
                  <span>{formatCurrency(c.invoiceExpense)}</span>
                </div>
              </div>

              {/* Action Buttons inside Card */}
              <div className="pt-2">
                <button
                  onClick={() => handleOpenProvision(c)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  Provisionar Valores na Planilha
                </button>
              </div>
            </div>
          );
        })}

        {contracts.length === 0 && (
          <div className="col-span-full bg-slate-50 border border-dashed border-slate-300 rounded-xl p-10 text-center space-y-3">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-semibold text-slate-700">Nenhum contrato fixo registrado</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Registre contratos de receita recorrente para prever e lançar despesas de funcionários, impostos e notas fiscais com agilidade.
            </p>
            <button
              onClick={handleOpenAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg py-2 px-3 transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Cadastrar Primeiro Contrato
            </button>
          </div>
        )}
      </div>

      {/* MODAL: Cadastro & Edição de Contrato */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden my-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-800">
                {isEditing ? 'Editar Contrato Fixo' : 'Cadastrar Novo Contrato Fixo'}
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Nome do Contrato */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nome do Contrato / Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Desenvolvimento Front-End - Alpha Solutions"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>

              {/* Data Início & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Data de Início</label>
                  <input
                    type="month"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Status do Contrato</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'ativo' | 'inativo')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Receita mensal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Valor do Contratado (Receita Mensal)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={monthlyRevenue || ''}
                    onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 pl-10 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-extrabold text-emerald-700"
                  />
                </div>
              </div>

              {/* Custos Fixos Padrão */}
              <div className="border-t border-slate-150 pt-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Previsão de Despesas Mensais Padrão:</h4>
                <div className="space-y-3">
                  {/* Funcionario */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-500" /> Funcionário (Folha de Pagamento)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">R$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={employeeExpense || ''}
                        onChange={(e) => setEmployeeExpense(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 pl-9 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Imposto */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-red-500" /> Impostos Mensais
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">R$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={taxExpense || ''}
                        onChange={(e) => setTaxExpense(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 pl-9 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Nota Fiscal */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-blue-500" /> Outras NFs de Despesas Operacionais
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">R$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={invoiceExpense || ''}
                        onChange={(e) => setInvoiceExpense(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 pl-9 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Descrição do Escopo / Notas</label>
                <textarea
                  placeholder="Escopo do contrato, entregáveis, cláusulas principais..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="bg-slate-150 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg py-2.5 px-4 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg py-2.5 px-5 cursor-pointer transition-colors shadow-sm"
                >
                  {isEditing ? 'Salvar Alterações' : 'Cadastrar Contrato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confirmação de Provisionamento em Lote */}
      {isProvisionOpen && selectedContractForProvision && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden my-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Provisionar Valores na Planilha
              </h3>
              <button
                onClick={() => setIsProvisionOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-blue-50 text-blue-800 p-3.5 rounded-lg border border-blue-100 text-xs font-medium space-y-1">
                <p className="font-bold text-sm">Contrato: {selectedContractForProvision.name}</p>
                <p>Esta ação irá lançar automaticamente 4 novos registros na planilha de dados para o mês selecionado:</p>
              </div>

              {/* Mês a ser provisionado */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Escolha o Mês de Competência:</label>
                <input
                  type="month"
                  required
                  value={provisionMonth}
                  onChange={(e) => setProvisionMonth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                />
              </div>

              {/* Lançamentos que serão feitos */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1">Registros a serem gerados:</h4>
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>1. Receita: Faturamento Mensal</span>
                  <span>+{formatCurrency(selectedContractForProvision.monthlyRevenue)}</span>
                </div>
                {selectedContractForProvision.employeeExpense > 0 && (
                  <div className="flex justify-between items-center text-rose-500 font-semibold">
                    <span>2. Despesa: Folha de Funcionário</span>
                    <span>-{formatCurrency(selectedContractForProvision.employeeExpense)}</span>
                  </div>
                )}
                {selectedContractForProvision.taxExpense > 0 && (
                  <div className="flex justify-between items-center text-rose-500 font-semibold">
                    <span>3. Despesa: Impostos Estimados</span>
                    <span>-{formatCurrency(selectedContractForProvision.taxExpense)}</span>
                  </div>
                )}
                {selectedContractForProvision.invoiceExpense > 0 && (
                  <div className="flex justify-between items-center text-rose-500 font-semibold">
                    <span>4. Despesa: Notas Fiscais Custo</span>
                    <span>-{formatCurrency(selectedContractForProvision.invoiceExpense)}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-start gap-2 text-amber-600 text-[11px] font-medium leading-normal bg-amber-50 p-2.5 rounded border border-amber-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500" />
                <span>Os lançamentos gerados serão salvos na planilha. Você poderá editá-los ou excluí-los individualmente a qualquer momento.</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProvisionOpen(false)}
                  className="bg-slate-150 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg py-2.5 px-4 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmProvision}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg py-2.5 px-5 cursor-pointer transition-colors shadow-sm flex items-center gap-1"
                >
                  Confirmar e Lançar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
