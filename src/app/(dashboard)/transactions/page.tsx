'use client';

import { useState, useMemo } from 'react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TransactionList from '@/components/transactions/TransactionList';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { mockTransactions, mockAccounts } from '@/data/mockData';
import type { Transaction, TransactionFilters as FiltersType } from '@/types';

const categories = [
  { value: 'Food & Dining', label: 'Food & Dining' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Bills & Utilities', label: 'Bills & Utilities' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Education', label: 'Education' },
  { value: 'Personal Care', label: 'Personal Care' },
  { value: 'Income', label: 'Income' },
  { value: 'Transfer', label: 'Transfer' },
  { value: 'Other', label: 'Other' },
];

const transactionTypes = [
  { value: 'EXPENSE', label: 'Expense' },
  { value: 'INCOME', label: 'Income' },
  { value: 'TRANSFER', label: 'Transfer' },
];

const initialFilters: FiltersType = {
  search: '',
  category: null,
  type: null,
  accountId: null,
  startDate: null,
  endDate: null,
  minAmount: null,
  maxAmount: null,
};

export default function TransactionsPage() {
  const [filters, setFilters] = useState<FiltersType>(initialFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    category: 'Food & Dining',
    accountId: mockAccounts[0]?.id || '',
    merchant: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((t) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          t.merchant?.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower) ||
          t.category.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.category && t.category !== filters.category) return false;
      if (filters.type && t.type !== filters.type) return false;
      if (filters.accountId && t.accountId !== filters.accountId) return false;

      if (filters.startDate && new Date(t.date) < filters.startDate) return false;
      if (filters.endDate && new Date(t.date) > filters.endDate) return false;

      if (filters.minAmount !== null && t.amount < filters.minAmount) return false;
      if (filters.maxAmount !== null && t.amount > filters.maxAmount) return false;

      return true;
    });
  }, [filters]);

  const accountOptions = mockAccounts.map((a) => ({
    value: a.id,
    label: a.name,
  }));

  const handleFiltersChange = (newFilters: Partial<FiltersType>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      accountId: transaction.accountId,
      merchant: transaction.merchant || '',
      description: transaction.description || '',
      date: new Date(transaction.date).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      console.log('Deleting transaction:', id);
      // TODO: Implement delete
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction) {
      console.log('Updating transaction:', editingTransaction.id, formData);
    } else {
      console.log('Creating transaction:', formData);
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      type: 'EXPENSE',
      category: 'Food & Dining',
      accountId: mockAccounts[0]?.id || '',
      merchant: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleExport = () => {
    const headers = ['Date', 'Merchant', 'Category', 'Type', 'Amount', 'Description'];
    const rows = filteredTransactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.merchant || '',
      t.category,
      t.type,
      t.amount.toString(),
      t.description || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-500 dark:text-gray-400">
            View and manage all your transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setEditingTransaction(null);
              resetForm();
              setIsModalOpen(true);
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <TransactionFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClear={handleClearFilters}
          accounts={accountOptions}
        />
      </Card>

      {/* Transactions list */}
      <Card padding="none">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredTransactions.length} transactions
          </p>
        </div>
        <TransactionList
          transactions={filteredTransactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              options={transactionTypes}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            />
            <Select
              label="Category"
              options={categories}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <Select
            label="Account"
            options={accountOptions}
            value={formData.accountId}
            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
          />
          <Input
            label="Merchant"
            placeholder="e.g., Starbucks"
            value={formData.merchant}
            onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
          />
          <Input
            label="Description"
            placeholder="Optional notes"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingTransaction(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingTransaction ? 'Save Changes' : 'Add Transaction'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
