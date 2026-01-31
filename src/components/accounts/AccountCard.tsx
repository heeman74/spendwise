'use client';

import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Account, AccountType } from '@/types';

interface AccountCardProps {
  account: Account;
  connectionStatus?: 'active' | 'error' | 'pending_disconnect';
  mask?: string;
  onEdit?: (account: Account) => void;
  onDelete?: (id: string) => void;
  onSync?: (id: string) => void;
  onReAuthClick?: () => void;
}

const accountTypeColors: Record<AccountType, string> = {
  CHECKING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SAVINGS: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CREDIT: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  INVESTMENT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const accountTypeIcons: Record<AccountType, React.ReactNode> = {
  CHECKING: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  SAVINGS: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  CREDIT: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  INVESTMENT: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
};

export default function AccountCard({
  account,
  connectionStatus,
  mask,
  onEdit,
  onDelete,
  onSync,
  onReAuthClick,
}: AccountCardProps) {
  const isNegativeBalance = account.balance < 0;
  const isLinked = connectionStatus !== undefined;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${accountTypeColors[account.type]}`}>
            {accountTypeIcons[account.type]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{account.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {account.institution}
              {mask && <span className="ml-2">****{mask}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Connection status indicator */}
          {isLinked && connectionStatus === 'active' && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-green-700 dark:text-green-400">Connected</span>
            </div>
          )}
          {isLinked && connectionStatus === 'error' && (
            <button
              onClick={onReAuthClick}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors cursor-pointer"
              title="Re-authenticate to restore connection"
            >
              <svg className="w-3 h-3 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-amber-700 dark:text-amber-400">Reconnect</span>
            </button>
          )}
          {isLinked && connectionStatus === 'pending_disconnect' && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <svg className="w-3 h-3 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-yellow-700 dark:text-yellow-400">Pending</span>
            </div>
          )}
          {!isLinked && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
              <span className="text-xs text-gray-600 dark:text-gray-400">Manual</span>
            </div>
          )}
          <Badge className={accountTypeColors[account.type]}>{account.type}</Badge>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
        <p
          className={`text-2xl font-bold ${
            isNegativeBalance
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-900 dark:text-white'
          }`}
        >
          {formatCurrency(account.balance)}
        </p>
      </div>

      {account.lastSynced && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Last synced: {formatDate(account.lastSynced, 'relative')}
        </p>
      )}

      <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
        {onSync && (
          <Button variant="outline" size="sm" onClick={() => onSync(account.id)}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Sync
          </Button>
        )}
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={() => onEdit(account)}>
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(account.id)}
            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 ml-auto"
          >
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
}
