import React, { useState, useMemo, useRef } from 'react';
import { LedgerEntry, Contract, TransactionType, TransactionCategory } from '../types';
import {
  formatCurrency,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '../utils/financeUtils';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit2,
  FileSpreadsheet,
  X,
  FileDown,
  Info,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface SpreadsheetViewProps {
  ledger: LedgerEntry[];
  contracts: Contract[];
  onAddEntry: (entry: LedgerEntry) => void;
  onUpdateEntry: (entry: LedgerEntry) => void;
  onDeleteEntry: (id: string) => void;
  onImportLedger: (entries: LedgerEntry[]) => void;
}

export default function SpreadsheetView({
  ledger,
  contracts,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onImportLedger,
}: SpreadsheetViewProps) {
  // Estados para filtros e pesquisas
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('todos');
  const [filterContract, setFilterContract] = useState('todos');
  const [filterType, setFilterType] = useState('todos');
  const [filterCategory, setFilterCategory] = useState('todos');

  // Controle de paginação simples
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Estados dos Modais
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Estados do formulário de lançamento
  const [formMonth, setFormMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [formContractId, setFormContractId] = useState('avulso');
  const [formType, setFormType] = useState<TransactionType>('despesa');
  const [formCategory, setFormCategory] = useState<TransactionCategory>('funcionario');
  const [formValue, setFormValue] = useState(0);
  const [formDescription, setFormDescription] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Obter meses e contratos disponíveis para filtros
  const availableMonths = useMemo(() => {
    const months = Array.from(new Set(ledger.map((item) => item.month)));
    return months.sort().reverse();
  }, [ledger]);

  // Sincronizar categoria com o tipo de transação no formulário
  const handleTypeChangeInForm = (type: TransactionType) => {
    setFormType(type);
    if (type === 'receita') {
      setFormCategory('valor_contrato');
    } else {
      setFormCategory('funcionario');
    }
  };

  // Filtragem da Planilha
  const filteredLedger = useMemo(() => {
    return ledger.filter((item) => {
      const matchSearch =
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contractName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.value.toString().includes(searchTerm) ||
        CATEGORY_LABELS[item.category].toLowerCase().includes(searchTerm.toLowerCase());

      const matchMonth = filterMonth === 'todos' || item.month === filterMonth;
      const matchContract = filterContract === 'todos' || item.contractId === filterContract;
      const matchType = filterType === 'todos' || item.type === filterType;
      const matchCategory = filterCategory === 'todos' || item.category === filterCategory;

      return matchSearch && matchMonth && matchContract && matchType && matchCategory;
    });
  }, [ledger, searchTerm, filterMonth, filterContract, filterType, filterCategory]);

  // Paginação dos dados filtrados
  const paginatedLedger = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLedger.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLedger, currentPage]);

  const totalPages = Math.ceil(filteredLedger.length / itemsPerPage);

  const resetForm = () => {
    const d = new Date();
    setFormMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    setFormContractId('avulso');
    setFormType('despesa');
    setFormCategory('funcionario');
    setFormValue(0);
    setFormDescription('');
    setIsEditing(false);
    setEditId('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (entry: LedgerEntry) => {
    setFormMonth(entry.month);
    setFormContractId(entry.contractId);
    setFormType(entry.type);
    setFormCategory(entry.category);
    setFormValue(entry.value);
    setFormDescription(entry.description);
    setEditId(entry.id);
    setIsEditing(true);
    setIsAddOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formValue <= 0 || !formDescription.trim()) return;

    // Achar nome do contrato correspondente
    let conName = 'Lançamento Avulso';
    if (formContractId !== 'avulso') {
      const selected = contracts.find((c) => c.id === formContractId);
      if (selected) {
        conName = selected.name;
      }
    }

    const entryData: LedgerEntry = {
      id: isEditing ? editId : 'l_' + Date.now(),
      month: formMonth,
      contractId: formContractId,
      contractName: conName,
      type: formType,
      category: formCategory,
      value: Number(formValue),
      description: formDescription,
      dateLaunched: isEditing
        ? ledger.find((l) => l.id === editId)?.dateLaunched || new Date().toISOString()
        : new Date().toISOString(),
    };

    if (isEditing) {
      onUpdateEntry(entryData);
    } else {
      onAddEntry(entryData);
    }
    setIsAddOpen(false);
    resetForm();
  };

  // EXPORTAR PARA CSV (Separado por Ponto e Vírgula para abrir nativamente no Excel brasileiro)
  const handleExportCSV = () => {
    const headers = ['Mês', 'Tipo', 'Categoria', 'Contrato', 'Descrição', 'Valor (R$)', 'Data Lançamento'];
    const rows = filteredLedger.map((item) => [
      item.month,
      item.type === 'receita' ? 'Receita' : 'Despesa',
      CATEGORY_LABELS[item.category] || item.category,
      item.contractName,
      item.description.replace(/;/g, ','), // evitar quebrar colunas
      item.value.toFixed(2).replace('.', ','), // padrão decimal brasileiro
      item.dateLaunched.substring(0, 10),
    ]);

    const csvContent =
      '\uFEFF' + // UTF-8 BOM para forçar Excel a ler acentos corretamente
      [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `planilha_financeira_contratos_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // DOWNLOAD TEMPLATE CSV
  const handleDownloadTemplateCSV = () => {
    const headers = ['Mes_Competencia_AAAA_MM', 'Tipo_Receita_ou_Despesa', 'Categoria', 'Nome_Contrato_ou_Avulso', 'Descricao', 'Valor_Numerico'];
    const exampleRow = ['2026-07', 'Despesa', 'Funcionario', 'Fábrica de Software - Beta Logistics', 'Pagamento Programador PJ', '7500.00'];
    const exampleRow2 = ['2026-07', 'Receita', 'Valor_Contrato', 'Fábrica de Software - Beta Logistics', 'Faturamento mensal padrão', '35000.00'];
    
    const csvContent =
      '\uFEFF' + 
      [headers.join(';'), exampleRow.join(';'), exampleRow2.join(';')].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_importacao_financeiro.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // IMPORTAR DE CSV
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
        
        if (lines.length <= 1) {
          throw new Error('O arquivo CSV está vazio ou contém apenas cabeçalhos.');
        }

        // Detectar se o separador é vírgula ou ponto-e-vírgula
        const headerLine = lines[0];
        const separator = headerLine.includes(';') ? ';' : ',';
        const headers = headerLine.replace(/^\uFEFF/, '').split(separator).map(h => h.trim());

        const importedEntries: LedgerEntry[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cells = lines[i].split(separator).map(c => c.trim());
          if (cells.length < headers.length) continue; // ignorar linhas mal formadas

          // Criar mapeamento simples chave-valor baseado nos cabeçalhos
          const rowData: Record<string, string> = {};
          headers.forEach((header, idx) => {
            rowData[header] = cells[idx] || '';
          });

          // Extrair campos de forma flexível (suporta cabeçalhos do template ou nomes em português)
          const month = rowData['Mes_Competencia_AAAA_MM'] || rowData['Mês'] || rowData['mes'] || '2026-07';
          
          let rawType = (rowData['Tipo_Receita_ou_Despesa'] || rowData['Tipo'] || rowData['tipo'] || '').toLowerCase();
          const type: TransactionType = rawType.includes('rec') || rawType.includes('in') ? 'receita' : 'despesa';

          let rawCat = (rowData['Categoria'] || rowData['categoria'] || '').toLowerCase();
          let category: TransactionCategory = 'outros';
          if (rawCat.includes('contrat') || rawCat.includes('receita_contrat')) category = 'valor_contrato';
          else if (rawCat.includes('func') || rawCat.includes('pessoal') || rawCat.includes('colab')) category = 'funcionario';
          else if (rawCat.includes('impos') || rawCat.includes('tribut')) category = 'imposto';
          else if (rawCat.includes('nota') || rawCat.includes('fiscal') || rawCat.includes('nf')) category = 'nota_fiscal';

          const contractName = rowData['Nome_Contrato_ou_Avulso'] || rowData['Contrato'] || rowData['contrato'] || 'Lançamento Avulso';
          const description = rowData['Descricao'] || rowData['Descrição'] || rowData['descrição'] || 'Lançamento via Importação';
          
          // Tratar valor decimal que pode vir com vírgula ou ponto
          const rawValue = rowData['Valor_Numerico'] || rowData['Valor'] || rowData['valor'] || '0';
          const cleanValue = parseFloat(rawValue.replace('R$', '').replace(/\s/g, '').replace('.', '').replace(',', '.'));
          
          if (isNaN(cleanValue) || cleanValue <= 0) continue;

          // Descobrir contractId se bater com um contrato existente
          let contractId = 'avulso';
          const matchingContract = contracts.find(c => c.name.toLowerCase() === contractName.toLowerCase());
          if (matchingContract) {
            contractId = matchingContract.id;
          }

          importedEntries.push({
            id: 'l_imp_' + Math.random().toString(36).substring(2, 9),
            month,
            contractId,
            contractName: matchingContract ? matchingContract.name : contractName,
            type,
            category,
            value: cleanValue,
            description,
            dateLaunched: new Date().toISOString()
          });
        }

        if (importedEntries.length > 0) {
          onImportLedger(importedEntries);
          setImportStatus({
            type: 'success',
            message: `${importedEntries.length} lançamentos foram importados e acoplados com sucesso à sua planilha!`,
          });
        } else {
          throw new Error('Nenhum registro válido pôde ser importado. Verifique os valores numéricos e as colunas.');
        }
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: `Falha na importação: ${err.message || 'Verifique se o arquivo está no formato correto.'}`,
        });
      }
      // Limpar o input para permitir selecionar o mesmo arquivo de novo se necessário
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // Estatísticas filtradas para o rodapé da planilha
  const filteredTotals = useMemo(() => {
    let rec = 0;
    let des = 0;
    filteredLedger.forEach((item) => {
      if (item.type === 'receita') rec += item.value;
      else des += item.value;
    });
    const bal = rec - des;
    const pct = rec > 0 ? (bal / rec) * 100 : 0;
    return { rec, des, bal, pct };
  }, [filteredLedger]);

  return (
    <div className="space-y-6">
      {/* Top Banner and Import/Export Options */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            Planilha Estruturada de Lançamentos
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Tabela mestre contendo cada dado financeiro lançado. Filtre, edite diretamente ou importe/exporte via planilhas de Excel.
          </p>
        </div>

        {/* Action button cluster */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full xl:w-auto">
          {/* CSV Actions Group */}
          <div className="grid grid-cols-3 gap-1.5 w-full sm:flex sm:items-center sm:w-auto">
            {/* Download Template */}
            <button
              onClick={handleDownloadTemplateCSV}
              title="Baixar Modelo de Planilha de Importação"
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-[10px] sm:text-xs rounded-lg py-2 px-1 sm:px-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-colors cursor-pointer text-center"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="truncate">Modelo</span>
            </button>

            {/* Import CSV */}
            <label className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-[10px] sm:text-xs rounded-lg py-2 px-1 sm:px-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-colors cursor-pointer text-center">
              <Upload className="w-3.5 h-3.5" />
              <span className="truncate">Importar</span>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </label>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              disabled={filteredLedger.length === 0}
              className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold text-[10px] sm:text-xs rounded-lg py-2 px-1 sm:px-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="truncate">Exportar</span>
            </button>
          </div>

          {/* Add Entry Button */}
          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg py-2.5 px-4 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-blue-100"
          >
            <Plus className="w-4 h-4" />
            Novo Lançamento
          </button>
        </div>
      </div>

      {/* Alertas de Importação */}
      {importStatus && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 justify-between ${
          importStatus.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex gap-2 items-start text-sm">
            {importStatus.type === 'success' ? (
              <Check className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{importStatus.type === 'success' ? 'Importação Concluída!' : 'Erro na Importação'}</p>
              <p className="text-xs mt-0.5 leading-relaxed font-medium">{importStatus.message}</p>
            </div>
          </div>
          <button onClick={() => setImportStatus(null)} className="p-0.5 hover:bg-black/5 rounded-md cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FILTER CONTROL CARD */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        {/* Search Input */}
        <div className="relative">
          <span className="absolute left-3.5 top-3 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Pesquise por descrição, cliente, valor ou categoria..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset page on search
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 pl-10 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdowns Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Mês */}
          <div className="space-y-1">
            <label htmlFor="filter-month" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filtrar por Mês</label>
            <select
              id="filter-month"
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg p-2 font-semibold outline-none cursor-pointer"
            >
              <option value="todos">Todos os Meses</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Contrato */}
          <div className="space-y-1">
            <label htmlFor="filter-contract" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filtrar por Contrato</label>
            <select
              id="filter-contract"
              value={filterContract}
              onChange={(e) => {
                setFilterContract(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg p-2 font-semibold outline-none cursor-pointer"
            >
              <option value="todos">Todos os Contratos</option>
              <option value="avulso">Sem Contrato (Avulsos)</option>
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div className="space-y-1">
            <label htmlFor="filter-type" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filtrar por Tipo</label>
            <select
              id="filter-type"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg p-2 font-semibold outline-none cursor-pointer"
            >
              <option value="todos">Receitas e Despesas</option>
              <option value="receita">Apenas Receitas (+)</option>
              <option value="despesa">Apenas Despesas (-)</option>
            </select>
          </div>

          {/* Categoria */}
          <div className="space-y-1">
            <label htmlFor="filter-category" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filtrar Categoria</label>
            <select
              id="filter-category"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg p-2 font-semibold outline-none cursor-pointer"
            >
              <option value="todos">Todas Categorias</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* PLANILHA DATA TABLE (Desktop version, hidden on mobile) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table id="financial-ledger-table" className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Mês</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Contrato Associado</th>
                <th className="px-4 py-3">Descrição do Lançamento</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedLedger.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5 text-xs text-slate-500 font-bold font-mono">{item.month}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.type === 'receita'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {item.type === 'receita' ? 'Receita (+)' : 'Despesa (-)'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                      CATEGORY_COLORS[item.category]
                    }`}>
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-slate-800 text-xs font-semibold truncate max-w-[180px] md:max-w-xs" title={item.contractName}>
                      {item.contractName}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-slate-600 text-xs truncate max-w-xs font-semibold md:max-w-md" title={item.description}>
                      {item.description}
                    </div>
                  </td>
                  <td className={`px-4 py-3.5 text-right font-extrabold text-sm ${
                    item.type === 'receita' ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {item.type === 'receita' ? '+' : '-'}&nbsp;{formatCurrency(item.value)}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        title="Editar Lançamento"
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteEntry(item.id)}
                        title="Excluir Lançamento"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedLedger.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-medium">
                    Nenhum lançamento financeiro encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>

            {/* PLANILHA FOOTER TOTALS */}
            {filteredLedger.length > 0 && (
              <tfoot className="bg-slate-100/70 divide-y divide-slate-200 border-t border-slate-200">
                <tr className="font-semibold text-xs text-slate-500">
                  <td colSpan={5} className="px-4 py-3.5 font-bold">Subtotal de Receitas do Filtro (+):</td>
                  <td colSpan={2} className="px-4 py-3.5 text-right font-extrabold text-emerald-600 text-sm">
                    {formatCurrency(filteredTotals.rec)}
                  </td>
                </tr>
                <tr className="font-semibold text-xs text-slate-500">
                  <td colSpan={5} className="px-4 py-3.5 font-bold">Subtotal de Despesas do Filtro (-):</td>
                  <td colSpan={2} className="px-4 py-3.5 text-right font-extrabold text-red-600 text-sm">
                    {formatCurrency(filteredTotals.des)}
                  </td>
                </tr>
                <tr className="bg-blue-50/50 text-blue-900 font-bold text-xs">
                  <td colSpan={4} className="px-4 py-4">Saldo Consolidado do Filtro:</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded font-bold border ${
                      filteredTotals.pct >= 35 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : filteredTotals.pct >= 15 
                        ? 'bg-amber-50 text-amber-700 border-amber-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      Lucratividade: {filteredTotals.pct.toFixed(1)}%
                    </span>
                  </td>
                  <td colSpan={2} className={`px-4 py-4 text-right font-black text-base ${
                    filteredTotals.bal >= 0 ? 'text-blue-700' : 'text-rose-600'
                  }`}>
                    {formatCurrency(filteredTotals.bal)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Mobile Cards View (Visible ONLY on mobile devices) */}
        <div className="block md:hidden divide-y divide-slate-100 bg-white">
          {paginatedLedger.map((item) => (
            <div key={item.id} className="p-4 space-y-2 hover:bg-slate-50/50 transition-colors">
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-bold font-mono bg-slate-100 px-1.5 py-0.5 rounded">{item.month}</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                      item.type === 'receita'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {item.type === 'receita' ? 'Receita' : 'Despesa'}
                    </span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                      CATEGORY_COLORS[item.category]
                    }`}>
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                  </div>
                  <div className="text-slate-800 text-xs font-bold leading-snug">
                    {item.description}
                  </div>
                </div>
                <div className={`text-right font-extrabold text-xs whitespace-nowrap ${
                  item.type === 'receita' ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {item.type === 'receita' ? '+' : '-'}&nbsp;{formatCurrency(item.value)}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs pt-1">
                <div className="text-slate-500 truncate text-[11px] max-w-[180px]">
                  <span className="text-slate-400 font-bold">Contrato:</span> {item.contractName}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    title="Editar Lançamento"
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteEntry(item.id)}
                    title="Excluir Lançamento"
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {paginatedLedger.length === 0 && (
            <div className="p-8 text-center text-slate-400 font-semibold text-xs">
              Nenhum lançamento financeiro encontrado com os filtros atuais.
            </div>
          )}

          {/* Mobile Summary footer totals */}
          {filteredLedger.length > 0 && (
            <div className="bg-slate-50 p-4 space-y-2 border-t border-slate-200">
              <div className="flex justify-between text-xs text-slate-600 font-semibold">
                <span>Receitas Filtro (+):</span>
                <span className="font-bold text-emerald-600">{formatCurrency(filteredTotals.rec)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 font-semibold">
                <span>Despesas Filtro (-):</span>
                <span className="font-bold text-red-600">{formatCurrency(filteredTotals.des)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-blue-900">Saldo Consolidado</span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border mt-0.5 max-w-max ${
                    filteredTotals.pct >= 35 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : filteredTotals.pct >= 15 
                      ? 'bg-amber-50 text-amber-700 border-amber-100' 
                      : 'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                    Margem: {filteredTotals.pct.toFixed(1)}%
                  </span>
                </div>
                <span className={`font-black text-base ${
                  filteredTotals.bal >= 0 ? 'text-blue-700' : 'text-rose-600'
                }`}>
                  {formatCurrency(filteredTotals.bal)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* PAGINATION PANEL */}
        {totalPages > 1 && (
          <div className="bg-white p-4.5 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              Mostrando {currentPage * itemsPerPage - itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredLedger.length)} de {filteredLedger.length} registros
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    currentPage === idx + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Adicionar / Editar Lançamento */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden my-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-800">
                {isEditing ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Mês de Competência */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Mês de Competência</label>
                <input
                  type="month"
                  required
                  value={formMonth}
                  onChange={(e) => setFormMonth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                />
              </div>

              {/* Contrato Associado */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Vincular a um Contrato Fixo</label>
                <select
                  value={formContractId}
                  onChange={(e) => setFormContractId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold cursor-pointer"
                >
                  <option value="avulso">Sem Contrato (Lançamento Avulso)</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo (Receita / Despesa) */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleTypeChangeInForm('receita')}
                  className={`py-2 text-xs font-bold rounded-md cursor-pointer transition-all ${
                    formType === 'receita'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Receita (+)
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChangeInForm('despesa')}
                  className={`py-2 text-xs font-bold rounded-md cursor-pointer transition-all ${
                    formType === 'despesa'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Despesa (-)
                </button>
              </div>

              {/* Categoria */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Categoria do Lançamento</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as TransactionCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold cursor-pointer"
                >
                  {formType === 'receita' ? (
                    <>
                      <option value="valor_contrato">Receita do Contrato</option>
                      <option value="outros">Outras Receitas Avulsas</option>
                    </>
                  ) : (
                    <>
                      <option value="funcionario">Funcionários & Terceirizados</option>
                      <option value="imposto">Impostos & Tributos</option>
                      <option value="nota_fiscal">Notas Fiscais de Despesas</option>
                      <option value="outros">Outras Despesas Avulsas</option>
                    </>
                  )}
                </select>
              </div>

              {/* Valor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Valor do Lançamento (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formValue || ''}
                    onChange={(e) => setFormValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 pl-10 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-extrabold text-slate-800"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Descrição detalhada</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fatura AWS do ambiente de homologação"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>

              {/* Action Buttons */}
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
                  {isEditing ? 'Salvar Alterações' : 'Salvar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
