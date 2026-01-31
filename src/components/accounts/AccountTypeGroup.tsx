'use client';

import AccountCard from './AccountCard';
import PlaidLinkButton from '@/components/plaid/PlaidLinkButton';
import type { Account, AccountType } from '@/types';

interface PlaidItem {
  id: string;
  status: 'active' | 'error' | 'pending_disconnect';
  institutionName: string;
  accounts: Array<{
    id: string;
    name: string;
    mask?: string;
    isLinked: boolean;
  }>;
}

interface AccountTypeGroupProps {
  type: AccountType;
  accounts: Account[];
  plaidItems: PlaidItem[];
  onConnectBank?: () => void;
  onReAuth?: (itemId: string) => void;
}

const typeLabels: Record<AccountType, string> = {
  CHECKING: 'Checking',
  SAVINGS: 'Savings',
  CREDIT: 'Credit Cards',
  INVESTMENT: 'Investments',
};

export default function AccountTypeGroup({
  type,
  accounts,
  plaidItems,
  onConnectBank,
  onReAuth,
}: AccountTypeGroupProps) {
  const typeLabel = typeLabels[type];

  // Helper function to find connection status for an account
  const getConnectionStatus = (accountId: string) => {
    for (const item of plaidItems) {
      const linkedAccount = item.accounts.find((a) => a.id === accountId);
      if (linkedAccount && linkedAccount.isLinked) {
        return {
          status: item.status,
          itemId: item.id,
          mask: linkedAccount.mask,
        };
      }
    }
    return null;
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {typeLabel} ({accounts.length})
      </h2>

      {accounts.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center bg-gray-50 dark:bg-gray-800/50">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            No {typeLabel.toLowerCase()} accounts
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Connect a bank account to get started
          </p>
          {onConnectBank && (
            <PlaidLinkButton mode="create" onSuccess={onConnectBank}>
              Connect Bank
            </PlaidLinkButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const connectionInfo = getConnectionStatus(account.id);
            return (
              <AccountCard
                key={account.id}
                account={account}
                connectionStatus={connectionInfo?.status}
                mask={connectionInfo?.mask}
                onReAuthClick={
                  connectionInfo?.status === 'error' && onReAuth
                    ? () => onReAuth(connectionInfo.itemId)
                    : undefined
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
