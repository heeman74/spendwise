'use client';

import { useState } from 'react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AccountList from '@/components/accounts/AccountList';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { mockAccounts } from '@/data/mockData';
import { formatCurrency } from '@/lib/utils';
import type { Account, AccountType } from '@/types';

const accountTypes = [
  { value: 'CHECKING', label: 'Checking' },
  { value: 'SAVINGS', label: 'Savings' },
  { value: 'CREDIT', label: 'Credit Card' },
  { value: 'INVESTMENT', label: 'Investment' },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState(mockAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'CHECKING' as AccountType,
    balance: '',
    institution: '',
  });

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalAssets = accounts
    .filter((acc) => acc.balance > 0)
    .reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilities = accounts
    .filter((acc) => acc.balance < 0)
    .reduce((sum, acc) => sum + Math.abs(acc.balance), 0);

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      institution: account.institution,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    }
  };

  const handleSync = (id: string) => {
    console.log('Syncing account:', id);
    // TODO: Implement sync
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAccount) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === editingAccount.id
            ? {
                ...acc,
                name: formData.name,
                type: formData.type,
                balance: parseFloat(formData.balance),
                institution: formData.institution,
                updatedAt: new Date(),
              }
            : acc
        )
      );
    } else {
      const newAccount: Account = {
        id: `acc_${Date.now()}`,
        userId: 'user_1',
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance),
        institution: formData.institution,
        lastSynced: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setAccounts((prev) => [...prev, newAccount]);
    }

    setIsModalOpen(false);
    setEditingAccount(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'CHECKING',
      balance: '',
      institution: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your connected financial accounts
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingAccount(null);
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Account
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Net Worth</p>
          <p className={`mt-1 text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(totalBalance)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Assets</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalAssets)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Liabilities</p>
          <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalLiabilities)}
          </p>
        </Card>
      </div>

      {/* Account groups */}
      <div className="space-y-6">
        {/* Cash accounts */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cash Accounts
          </h2>
          <AccountList
            accounts={accounts.filter((a) => a.type === 'CHECKING' || a.type === 'SAVINGS')}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSync={handleSync}
          />
        </div>

        {/* Credit accounts */}
        {accounts.some((a) => a.type === 'CREDIT') && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Credit Cards
            </h2>
            <AccountList
              accounts={accounts.filter((a) => a.type === 'CREDIT')}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSync={handleSync}
            />
          </div>
        )}

        {/* Investment accounts */}
        {accounts.some((a) => a.type === 'INVESTMENT') && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Investment Accounts
            </h2>
            <AccountList
              accounts={accounts.filter((a) => a.type === 'INVESTMENT')}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSync={handleSync}
            />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAccount(null);
        }}
        title={editingAccount ? 'Edit Account' : 'Add Account'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Account Name"
            placeholder="e.g., Primary Checking"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Select
            label="Account Type"
            options={accountTypes}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as AccountType })}
          />
          <Input
            label="Institution"
            placeholder="e.g., Chase Bank"
            value={formData.institution}
            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            required
          />
          <Input
            label="Current Balance"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.balance}
            onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
            helperText="For credit cards, enter a negative balance"
            required
          />
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingAccount(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingAccount ? 'Save Changes' : 'Add Account'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
