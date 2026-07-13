import React, { useState, useEffect } from 'react';
import { Contract, LedgerEntry } from './types';
import { INITIAL_CONTRACTS, INITIAL_LEDGER, formatCurrency } from './utils/financeUtils';
import Dashboard from './components/Dashboard';
import ContractsSection from './components/ContractsSection';
import SpreadsheetView from './components/SpreadsheetView';
import { motion, AnimatePresence } from 'motion/react';
import { isSupabaseConfigured } from './lib/supabaseClient';
import { supabaseService } from './lib/supabaseService';
import {
  Briefcase,
  FileSpreadsheet,
  TrendingUp,
  LayoutDashboard,
  CheckCircle,
  XCircle,
  HelpCircle,
  Bell,
  X,
  Database,
  CloudLightning,
  Info,
  Copy,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Trash2,
} from 'lucide-react';

export default function App() {
  // Estado principal: Contratos e Lançamentos (com persistência em LocalStorage)
  const [contracts, setContracts] = useState<Contract[]>(() => {
    const saved = localStorage.getItem('finance_contracts');
    return saved ? JSON.parse(saved) : INITIAL_CONTRACTS;
  });

  const [ledger, setLedger] = useState<LedgerEntry[]>(() => {
    const saved = localStorage.getItem('finance_ledger');
    return saved ? JSON.parse(saved) : INITIAL_LEDGER;
  });

  // Estados adicionais para integração com Supabase
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Aba ativa ('dashboard' | 'contracts' | 'spreadsheet')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contracts' | 'spreadsheet'>('dashboard');

  // Sistema simples de Notificações / Toasts
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Carregar dados iniciais do Supabase se estiver configurado
  useEffect(() => {
    async function fetchDatabaseData() {
      if (isSupabaseConfigured) {
        setIsLoading(true);
        try {
          const dbContracts = await supabaseService.getContracts();
          const dbLedger = await supabaseService.getLedgerEntries();
          
          setContracts(dbContracts);
          setLedger(dbLedger);
          addToast('Dados sincronizados com o Supabase com sucesso!', 'success');
        } catch (error) {
          console.warn('Falha ao carregar dados do Supabase:', error);
          addToast('Não foi possível obter os dados do Supabase. Usando cache local do navegador.', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchDatabaseData();
  }, []);

  // Salvar estados no LocalStorage quando mudarem (como backup / cache local instantâneo)
  useEffect(() => {
    localStorage.setItem('finance_contracts', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem('finance_ledger', JSON.stringify(ledger));
  }, [ledger]);

  // Sincronizar cache local com o Supabase (Função manual no painel)
  const handleSyncToSupabase = async () => {
    if (!isSupabaseConfigured) {
      addToast('Supabase não configurado nas variáveis de ambiente!', 'error');
      return;
    }
    setIsSyncing(true);
    try {
      const result = await supabaseService.syncLocalDataToSupabase(contracts, ledger);
      addToast(
        `Sucesso! Sincronizados ${result.contractsSynced} contratos e ${result.ledgerSynced} lançamentos com o Supabase.`,
        'success'
      );
      // Recarregar os dados para garantir consistência total
      const dbContracts = await supabaseService.getContracts();
      const dbLedger = await supabaseService.getLedgerEntries();
      setContracts(dbContracts);
      setLedger(dbLedger);
    } catch (error) {
      console.warn('Erro ao sincronizar os dados locais:', error);
      addToast('Ocorreu um erro ao sincronizar os dados locais com o Supabase.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySQL = () => {
    const sqlText = `-- SQL Script to set up your Supabase database tables for the Finance Ledger app
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_revenue NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  employee_expense NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  tax_expense NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  invoice_expense NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  description TEXT,
  start_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL,
  contract_id TEXT NOT NULL,
  contract_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  category TEXT NOT NULL CHECK (category IN ('valor_contrato', 'funcionario', 'imposto', 'nota_fiscal', 'outros')),
  value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  description TEXT,
  date_launched TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on contracts" ON contracts FOR SELECT USING (true);
CREATE POLICY "Allow public insert on contracts" ON contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on contracts" ON contracts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on contracts" ON contracts FOR DELETE USING (true);

CREATE POLICY "Allow public select on ledger_entries" ON ledger_entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert on ledger_entries" ON ledger_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on ledger_entries" ON ledger_entries FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on ledger_entries" ON ledger_entries FOR DELETE USING (true);`;

    navigator.clipboard.writeText(sqlText);
    addToast('Script SQL copiado para a área de transferência!', 'success');
  };

  // --- HANDLERS PARA CONTRATOS ---
  const handleAddContract = async (newContract: Contract) => {
    setContracts((prev) => [newContract, ...prev]);
    if (isSupabaseConfigured) {
      try {
        await supabaseService.saveContract(newContract);
        addToast(`Contrato "${newContract.name}" salvo com sucesso no Supabase!`, 'success');
      } catch (err) {
        addToast('Contrato salvo localmente, mas falhou ao enviar para o Supabase.', 'error');
      }
    } else {
      addToast(`Contrato "${newContract.name}" cadastrado localmente!`, 'success');
    }
  };

  const handleUpdateContract = async (updatedContract: Contract) => {
    setContracts((prev) => prev.map((c) => (c.id === updatedContract.id ? updatedContract : c)));
    // Atualiza também os nomes dos contratos que já estavam nos lançamentos antigos
    setLedger((prev) =>
      prev.map((l) =>
        l.contractId === updatedContract.id
          ? { ...l, contractName: updatedContract.name }
          : l
      )
    );

    if (isSupabaseConfigured) {
      try {
        await supabaseService.saveContract(updatedContract);
        addToast(`Contrato "${updatedContract.name}" atualizado no Supabase!`, 'success');
      } catch (err) {
        addToast('Contrato atualizado localmente, mas falhou ao enviar para o Supabase.', 'error');
      }
    } else {
      addToast(`Contrato "${updatedContract.name}" atualizado localmente!`, 'success');
    }
  };

  const handleDeleteContract = async (id: string) => {
    const contract = contracts.find((c) => c.id === id);
    if (!contract) return;

    if (window.confirm(`Tem certeza que deseja excluir o contrato "${contract.name}"?\nIsso NÃO apagará os lançamentos históricos que já foram salvos na planilha.`)) {
      setContracts((prev) => prev.filter((c) => c.id !== id));
      if (isSupabaseConfigured) {
        try {
          await supabaseService.deleteContract(id);
          addToast(`Contrato "${contract.name}" removido do Supabase.`, 'info');
        } catch (err) {
          addToast('Contrato removido localmente, mas falhou ao deletar no Supabase.', 'error');
        }
      } else {
        addToast(`Contrato "${contract.name}" removido localmente.`, 'info');
      }
    }
  };

  // Provisionamento em Lote de um contrato fixo para um determinado mês
  const handleBulkProvision = async (contract: Contract, month: string) => {
    // Verificar se já existe lançamento para este contrato no mês selecionado (para evitar duplicidade acidental)
    const alreadyHasEntries = ledger.some(
      (item) => item.contractId === contract.id && item.month === month
    );

    if (alreadyHasEntries) {
      const confirm = window.confirm(
        `Já existem lançamentos para o contrato "${contract.name}" em ${month}.\nDeseja gerar novos lançamentos duplicados para este período?`
      );
      if (!confirm) return;
    }

    const newEntries: LedgerEntry[] = [];
    const timestamp = new Date().toISOString();

    // 1. Receita (Faturamento)
    if (contract.monthlyRevenue > 0) {
      newEntries.push({
        id: `l_prov_${contract.id}_rev_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        month,
        contractId: contract.id,
        contractName: contract.name,
        type: 'receita',
        category: 'valor_contrato',
        value: contract.monthlyRevenue,
        description: `Receita contratual recorrente - Competência: ${month}`,
        dateLaunched: timestamp,
      });
    }

    // 2. Despesa - Funcionário
    if (contract.employeeExpense > 0) {
      newEntries.push({
        id: `l_prov_${contract.id}_emp_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        month,
        contractId: contract.id,
        contractName: contract.name,
        type: 'despesa',
        category: 'funcionario',
        value: contract.employeeExpense,
        description: `Folha de funcionário provisionada - Competência: ${month}`,
        dateLaunched: timestamp,
      });
    }

    // 3. Despesa - Imposto
    if (contract.taxExpense > 0) {
      newEntries.push({
        id: `l_prov_${contract.id}_tax_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        month,
        contractId: contract.id,
        contractName: contract.name,
        type: 'despesa',
        category: 'imposto',
        value: contract.taxExpense,
        description: `Impostos provisionados - Competência: ${month}`,
        dateLaunched: timestamp,
      });
    }

    // 4. Despesa - Nota Fiscal
    if (contract.invoiceExpense > 0) {
      newEntries.push({
        id: `l_prov_${contract.id}_inv_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        month,
        contractId: contract.id,
        contractName: contract.name,
        type: 'despesa',
        category: 'nota_fiscal',
        value: contract.invoiceExpense,
        description: `Notas fiscais estimadas provisionadas - Competência: ${month}`,
        dateLaunched: timestamp,
      });
    }

    if (newEntries.length === 0) {
      addToast('O contrato não possui valores cadastrados para provisionar.', 'error');
      return;
    }

    setLedger((prev) => [...newEntries, ...prev]);

    if (isSupabaseConfigured) {
      try {
        for (const entry of newEntries) {
          await supabaseService.saveLedgerEntry(entry);
        }
        addToast(`${newEntries.length} lançamentos do contrato "${contract.name}" salvos no Supabase para ${month}!`, 'success');
      } catch (err) {
        addToast(`${newEntries.length} lançamentos gerados localmente, mas falha ao enviar para o Supabase.`, 'error');
      }
    } else {
      addToast(`${newEntries.length} lançamentos do contrato "${contract.name}" foram inseridos com sucesso na planilha de ${month}!`, 'success');
    }
  };

  // --- HANDLERS PARA PLANILHA / LEDGER ---
  const handleAddEntry = async (newEntry: LedgerEntry) => {
    setLedger((prev) => [newEntry, ...prev]);
    if (isSupabaseConfigured) {
      try {
        await supabaseService.saveLedgerEntry(newEntry);
        addToast('Lançamento registrado com sucesso no Supabase!', 'success');
      } catch (err) {
        addToast('Lançamento registrado localmente, mas falha ao enviar para o Supabase.', 'error');
      }
    } else {
      addToast('Lançamento registrado na planilha com sucesso!', 'success');
    }
  };

  const handleUpdateEntry = async (updatedEntry: LedgerEntry) => {
    setLedger((prev) => prev.map((item) => (item.id === updatedEntry.id ? updatedEntry : item)));
    if (isSupabaseConfigured) {
      try {
        await supabaseService.saveLedgerEntry(updatedEntry);
        addToast('Lançamento atualizado com sucesso no Supabase!', 'success');
      } catch (err) {
        addToast('Lançamento atualizado localmente, mas falha ao enviar para o Supabase.', 'error');
      }
    } else {
      addToast('Lançamento atualizado na planilha!', 'success');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento financeiro da planilha?')) {
      setLedger((prev) => prev.filter((item) => item.id !== id));
      if (isSupabaseConfigured) {
        try {
          await supabaseService.deleteLedgerEntry(id);
          addToast('Lançamento removido do Supabase.', 'info');
        } catch (err) {
          addToast('Lançamento removido localmente, mas falha ao deletar no Supabase.', 'error');
        }
      } else {
        addToast('Lançamento removido permanentemente.', 'info');
      }
    }
  };

  const handleImportLedger = async (importedEntries: LedgerEntry[]) => {
    setLedger((prev) => [...importedEntries, ...prev]);
    if (isSupabaseConfigured) {
      try {
        for (const entry of importedEntries) {
          await supabaseService.saveLedgerEntry(entry);
        }
        addToast(`${importedEntries.length} lançamentos importados e salvos no Supabase!`, 'success');
      } catch (err) {
        addToast(`${importedEntries.length} lançamentos importados localmente, com erro ao sincronizar no Supabase.`, 'error');
      }
    } else {
      addToast(`${importedEntries.length} lançamentos importados com sucesso!`, 'success');
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('ATENÇÃO: Isso excluirá permanentemente TODOS os contratos e lançamentos do cache local do seu navegador! Deseja continuar?')) {
      if (isSupabaseConfigured) {
        if (window.confirm('Você também gostaria de tentar remover estes dados do banco de dados conectado no Supabase? (Clique em "OK" para remover também do Supabase, ou "Cancelar" para limpar apenas localmente)')) {
          setIsLoading(true);
          try {
            // Deletar de forma otimizada e em ordem de dependência (primeiro os lançamentos/transações, depois os contratos)
            await supabaseService.truncateLedgerEntries();
            await supabaseService.truncateContracts();
            addToast('Todos os dados foram excluídos com sucesso localmente e no Supabase!', 'success');
          } catch (err) {
            addToast('Dados excluídos localmente, mas ocorreu uma falha ao remover todos os itens do Supabase.', 'error');
          } finally {
            setIsLoading(false);
          }
        } else {
          addToast('Dados do cache local limpos com sucesso! O banco do Supabase permaneceu inalterado.', 'success');
        }
      } else {
        addToast('Todos os dados locais fictícios foram excluídos com sucesso!', 'success');
      }
      
      setContracts([]);
      setLedger([]);
      localStorage.removeItem('finance_contracts');
      localStorage.removeItem('finance_ledger');
    }
  };

  const totalActiveContractsCount = contracts.filter(c => c.status === 'ativo').length;
  const currentMonthRevenue = ledger
    .filter(item => item.type === 'receita' && item.month === '2026-07')
    .reduce((acc, item) => acc + item.value, 0);

  const currentMonthExpense = ledger
    .filter(item => item.type === 'despesa' && item.month === '2026-07')
    .reduce((acc, item) => acc + item.value, 0);

  const currentMonthProfit = currentMonthRevenue - currentMonthExpense;
  const currentMonthMargin = currentMonthRevenue > 0 ? (currentMonthProfit / currentMonthRevenue) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans leading-normal flex flex-col">
      {/* HEADER PRINCIPAL */}
      <header id="app-header" className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                Finansys <span className="text-blue-600">Enterprise</span>
                {isSupabaseConfigured ? (
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Supabase Nuvem
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Local Fallback
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* Quick Header Stats */}
          <div className="flex items-center gap-6">
            <div className="flex gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Receita Total (Jul)</span>
                <span className="text-base sm:text-lg font-bold text-slate-800">{formatCurrency(currentMonthRevenue)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Despesas (Jul)</span>
                <span className="text-base sm:text-lg font-bold text-rose-500">{formatCurrency(currentMonthExpense)}</span>
              </div>
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Margem Líquida</span>
                <span className={`text-base sm:text-lg font-bold ${currentMonthMargin >= 30 ? 'text-emerald-500' : currentMonthMargin >= 15 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {currentMonthMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* BODY DE LAYOUT LATERAL */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-0 sm:px-4 lg:px-8 lg:py-6 gap-6">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-64 bg-white lg:rounded-2xl border-b lg:border border-slate-200 p-5 flex flex-col gap-1 shrink-0 self-start">
          <div className="text-[11px] font-bold text-slate-400 uppercase mb-3 px-2">Menu Principal</div>
          
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all shrink-0 cursor-pointer w-full text-left ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                activeTab === 'dashboard' ? 'bg-blue-600' : 'bg-slate-300'
              }`}></span>
              Fluxo de Caixa
            </button>

            <button
              onClick={() => setActiveTab('contracts')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all shrink-0 cursor-pointer w-full text-left ${
                activeTab === 'contracts'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                activeTab === 'contracts' ? 'bg-blue-600' : 'bg-slate-300'
              }`}></span>
              Contratos Fixos
            </button>

            <button
              onClick={() => setActiveTab('spreadsheet')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all shrink-0 cursor-pointer w-full text-left ${
                activeTab === 'spreadsheet'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                activeTab === 'spreadsheet' ? 'bg-blue-600' : 'bg-slate-300'
              }`}></span>
              Planilha Geral
            </button>
          </div>

          {/* PAINEL SUPABASE / VERCEL DENTRO DO MENU */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase px-2">Nuvem & Banco</div>
            
            {isSupabaseConfigured ? (
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <Database className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Supabase Ativo</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  Os contratos e planilhas estão persistidos e sincronizados em tempo real no seu banco Postgres.
                </p>
                <button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="w-full text-left text-[10px] font-bold text-emerald-700 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                >
                  Ver configurações <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-900 rounded-xl text-white space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                  <Database className="w-4 h-4 shrink-0" />
                  <span>Modo Local Ativo</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Armazenamento temporário via <code className="text-blue-300 font-mono">LocalStorage</code>.
                </p>
                <button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold text-center transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CloudLightning className="w-3.5 h-3.5" />
                  Conectar Supabase
                </button>
              </div>
            )}
          </div>

          {/* GERENCIAMENTO DE DADOS / LIMPEZA */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase px-2">Limpeza de Dados</div>
            <button
              onClick={handleClearAllData}
              className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 rounded-xl text-xs font-semibold text-center transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Zerar Dados do Sistema
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-0 flex flex-col">
          {isLoading ? (
            <div className="flex-1 min-h-[350px] bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-700">Carregando dados da nuvem...</p>
              <p className="text-xs text-slate-400">Consultando tabelas PostgreSQL no Supabase.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                >
                  <Dashboard ledger={ledger} contracts={contracts} />
                </motion.div>
              )}

              {activeTab === 'contracts' && (
                <motion.div
                  key="contracts"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                >
                  <ContractsSection
                    contracts={contracts}
                    onAddContract={handleAddContract}
                    onUpdateContract={handleUpdateContract}
                    onDeleteContract={handleDeleteContract}
                    onBulkProvision={handleBulkProvision}
                  />
                </motion.div>
              )}

              {activeTab === 'spreadsheet' && (
                <motion.div
                  key="spreadsheet"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                >
                  <SpreadsheetView
                    ledger={ledger}
                    contracts={contracts}
                    onAddEntry={handleAddEntry}
                    onUpdateEntry={handleUpdateEntry}
                    onDeleteEntry={handleDeleteEntry}
                    onImportLedger={handleImportLedger}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p>© 2026 Finansys Enterprise - Sistema Integrado de Fluxo de Caixa.</p>
          <p>
            {isSupabaseConfigured 
              ? 'Conectado de forma segura ao banco PostgreSQL no Supabase.' 
              : 'Dados operando localmente no navegador (LocalStorage). Prepare sua conexão do Supabase para salvar na nuvem.'}
          </p>
        </div>
      </footer>

      {/* TOAST SYSTEM RENDERING */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`p-4 rounded-xl border shadow-lg flex items-start gap-3 justify-between ${
                t.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                  : t.type === 'error'
                  ? 'bg-rose-50 border-rose-100 text-rose-800'
                  : 'bg-blue-50 border-blue-100 text-blue-800'
              }`}
            >
              <div className="flex gap-2 text-xs font-semibold leading-relaxed">
                {t.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                ) : t.type === 'error' ? (
                  <XCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                ) : (
                  <Bell className="w-5 h-5 flex-shrink-0 text-blue-600" />
                )}
                <span>{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-0.5 hover:bg-black/5 rounded cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MODAL INTERATIVO: GUIA SUPABASE & VERCEL */}
      <AnimatePresence>
        {isConfigModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfigModalOpen(false)}
              className="fixed inset-0 bg-slate-900 cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 overflow-hidden border border-slate-150 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CloudLightning className="w-5 h-5 text-blue-600" />
                    Preparar Supabase & Vercel
                  </h2>
                  <p className="text-xs text-slate-500">
                    Siga o guia prático abaixo para configurar seu banco de dados e hospedar na nuvem.
                  </p>
                </div>
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1 scrollbar-thin">
                
                {/* STATUS ATUAL */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status da Conexão</span>
                    {isSupabaseConfigured ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Ativa (Nuvem)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        Local Fallback (LocalStorage)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isSupabaseConfigured 
                      ? 'Parabéns! Sua aplicação está conectada ao Supabase e as alterações são gravadas instantaneamente na nuvem.'
                      : 'Atualmente a aplicação salva dados no LocalStorage do seu navegador. Para persistir globalmente e compartilhar com seu time, siga as etapas abaixo.'}
                  </p>
                </div>

                {/* PASSO 1: SUPABASE */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
                    <h3 className="font-bold text-sm text-slate-800">Provisionar o Banco de Dados no Supabase</h3>
                  </div>
                  <div className="pl-8 space-y-2.5 text-xs text-slate-600 leading-relaxed">
                    <p>
                      Crie um projeto gratuito em <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">supabase.com</a> e acesse o menu <strong>SQL Editor</strong>. Copie e execute o script de criação das tabelas clicando no botão abaixo:
                    </p>
                    <button
                      onClick={handleCopySQL}
                      className="inline-flex items-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-black text-white rounded-lg font-semibold transition-all cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Script SQL do Banco
                    </button>
                    <p className="text-[10px] text-slate-400 italic">
                      Este script criará as tabelas <code className="font-mono font-bold bg-slate-100 text-slate-700 px-1 py-0.5 rounded">contracts</code> e <code className="font-mono font-bold bg-slate-100 text-slate-700 px-1 py-0.5 rounded">ledger_entries</code> com Row Level Security (RLS) habilitado.
                    </p>
                  </div>
                </div>

                {/* PASSO 2: VARIÁVEIS */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</span>
                    <h3 className="font-bold text-sm text-slate-800">Configurar as Variáveis de Ambiente</h3>
                  </div>
                  <div className="pl-8 space-y-2.5 text-xs text-slate-600">
                    <p className="leading-relaxed">
                      No painel do Supabase, acesse <strong>Project Settings &gt; API</strong>. Obtenha a <strong>Project URL</strong> e a chave <strong>anon public</strong> e configure-as nas variáveis de ambiente da sua hospedagem:
                    </p>
                    <div className="bg-slate-950 text-slate-300 p-3 rounded-lg font-mono text-[11px] leading-relaxed select-all">
                      <div>VITE_SUPABASE_URL=https://seu-id.supabase.co</div>
                      <div>VITE_SUPABASE_ANON_KEY=sua-chave-anon-public-jwt</div>
                    </div>
                  </div>
                </div>

                {/* PASSO 3: VERCEL */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</span>
                    <h3 className="font-bold text-sm text-slate-800">Publicar o Sistema no Vercel</h3>
                  </div>
                  <div className="pl-8 space-y-2 text-xs text-slate-600 leading-relaxed">
                    <p>
                      O arquivo <code className="font-mono bg-slate-100 px-1 rounded font-semibold text-slate-700">vercel.json</code> já foi gerado na raiz da aplicação garantindo o roteamento correto SPA. Para subir no Vercel:
                    </p>
                    <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                      <li>Conecte seu repositório Git ao Vercel.</li>
                      <li>Adicione as duas variáveis de ambiente descritas no <strong>Passo 2</strong> no formulário de importação do Vercel.</li>
                      <li>Clique em <strong>Deploy</strong>. O site estará online em segundos!</li>
                    </ul>
                  </div>
                </div>

                {/* SINCRONIZAÇÃO DE DADOS */}
                {isSupabaseConfigured && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      <h4 className="font-bold text-xs text-blue-800 uppercase tracking-wider">Sincronizar Cache com Supabase</h4>
                    </div>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Deseja migrar todos os lançamentos e contratos salvos no cache local do seu navegador para as tabelas recém-configuradas do seu banco Supabase?
                    </p>
                    <button
                      disabled={isSyncing}
                      onClick={handleSyncToSupabase}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-semibold text-xs transition-all cursor-pointer shadow-sm"
                    >
                      {isSyncing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Sincronizando dados locais...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Migrar Dados Locais para o Supabase Now
                        </>
                      )}
                    </button>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Entendi, Fechar Guia
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
