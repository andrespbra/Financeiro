import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Contract, LedgerEntry } from '../types';

// Helper to convert DB contract (snake_case) to Frontend contract (camelCase)
function mapContractFromDB(dbContract: any): Contract {
  return {
    id: dbContract.id,
    name: dbContract.name,
    monthlyRevenue: Number(dbContract.monthly_revenue || 0),
    employeeExpense: Number(dbContract.employee_expense || 0),
    taxExpense: Number(dbContract.tax_expense || 0),
    invoiceExpense: Number(dbContract.invoice_expense || 0),
    description: dbContract.description || '',
    startDate: dbContract.start_date || '',
    status: dbContract.status || 'ativo',
  };
}

// Helper to convert Frontend contract (camelCase) to DB contract (snake_case)
function mapContractToDB(contract: Contract) {
  return {
    id: contract.id,
    name: contract.name,
    monthly_revenue: contract.monthlyRevenue,
    employee_expense: contract.employeeExpense,
    tax_expense: contract.taxExpense,
    invoice_expense: contract.invoiceExpense,
    description: contract.description,
    start_date: contract.startDate,
    status: contract.status,
  };
}

// Helper to convert DB ledger entry (snake_case) to Frontend ledger entry (camelCase)
function mapLedgerEntryFromDB(dbEntry: any): LedgerEntry {
  return {
    id: dbEntry.id,
    month: dbEntry.month,
    contractId: dbEntry.contract_id,
    contractName: dbEntry.contract_name,
    type: dbEntry.type,
    category: dbEntry.category,
    value: Number(dbEntry.value || 0),
    description: dbEntry.description || '',
    dateLaunched: dbEntry.date_launched || new Date().toISOString(),
  };
}

// Helper to convert Frontend ledger entry (camelCase) to DB ledger entry (snake_case)
function mapLedgerEntryToDB(entry: LedgerEntry) {
  return {
    id: entry.id,
    month: entry.month,
    contract_id: entry.contractId,
    contract_name: entry.contractName,
    type: entry.type,
    category: entry.category,
    value: entry.value,
    description: entry.description,
    date_launched: entry.dateLaunched,
  };
}

export const supabaseService = {
  // --- CONTRACTS SERVICES ---
  async getContracts(): Promise<Contract[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching contracts from Supabase:', error);
      throw error;
    }

    return (data || []).map(mapContractFromDB);
  },

  async saveContract(contract: Contract): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const dbData = mapContractToDB(contract);
    const { error } = await supabase
      .from('contracts')
      .upsert(dbData, { onConflict: 'id' });

    if (error) {
      console.warn('Error upserting contract to Supabase:', error);
      throw error;
    }
  },

  async deleteContract(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Error deleting contract from Supabase:', error);
      throw error;
    }
  },

  // --- LEDGER ENTRIES SERVICES ---
  async getLedgerEntries(): Promise<LedgerEntry[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('ledger_entries')
      .select('*')
      .order('date_launched', { ascending: false });

    if (error) {
      console.warn('Error fetching ledger entries from Supabase:', error);
      throw error;
    }

    return (data || []).map(mapLedgerEntryFromDB);
  },

  async saveLedgerEntry(entry: LedgerEntry): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const dbData = mapLedgerEntryToDB(entry);
    const { error } = await supabase
      .from('ledger_entries')
      .upsert(dbData, { onConflict: 'id' });

    if (error) {
      console.warn('Error upserting ledger entry to Supabase:', error);
      throw error;
    }
  },

  async deleteLedgerEntry(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('ledger_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Error deleting ledger entry from Supabase:', error);
      throw error;
    }
  },

  async truncateLedgerEntries(): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('ledger_entries')
      .delete()
      .neq('id', '_none_');

    if (error) {
      console.warn('Error clearing all ledger entries from Supabase:', error);
      throw error;
    }
  },

  async truncateContracts(): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('contracts')
      .delete()
      .neq('id', '_none_');

    if (error) {
      console.warn('Error clearing all contracts from Supabase:', error);
      throw error;
    }
  },

  // --- SYNC LOCAL DATA TO SUPABASE ---
  async syncLocalDataToSupabase(localContracts: Contract[], localLedger: LedgerEntry[]): Promise<{
    contractsSynced: number;
    ledgerSynced: number;
  }> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    let contractsSyncedCount = 0;
    let ledgerSyncedCount = 0;

    // Bulk upload contracts
    if (localContracts.length > 0) {
      const dbContracts = localContracts.map(mapContractToDB);
      const { error: contractError } = await supabase
        .from('contracts')
        .upsert(dbContracts, { onConflict: 'id' });

      if (contractError) {
        console.warn('Error syncing contracts to Supabase:', contractError);
        throw contractError;
      }
      contractsSyncedCount = localContracts.length;
    }

    // Bulk upload ledger entries
    if (localLedger.length > 0) {
      const dbLedger = localLedger.map(mapLedgerEntryToDB);
      const { error: ledgerError } = await supabase
        .from('ledger_entries')
        .upsert(dbLedger, { onConflict: 'id' });

      if (ledgerError) {
        console.warn('Error syncing ledger entries to Supabase:', ledgerError);
        throw ledgerError;
      }
      ledgerSyncedCount = localLedger.length;
    }

    return {
      contractsSynced: contractsSyncedCount,
      ledgerSynced: ledgerSyncedCount
    };
  }
};
