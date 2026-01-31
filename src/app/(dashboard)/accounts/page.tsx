'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import BalanceSummary from '@/components/accounts/BalanceSummary';
import AccountTypeGroup from '@/components/accounts/AccountTypeGroup';
import PlaidLinkButton from '@/components/plaid/PlaidLinkButton';
import LinkSuccessModal from '@/components/plaid/LinkSuccessModal';
import { useAccounts } from '@/hooks/useAccounts';
import { usePlaidItems } from '@/hooks/usePlaid';
import type { AccountType } from '@/types';

export default function AccountsPage() {
  const { accounts, loading: accountsLoading } = useAccounts();
  const { plaidItems, loading: plaidLoading } = usePlaidItems();
  const [showLinkSuccess, setShowLinkSuccess] = useState(false);
  const [linkResult, setLinkResult] = useState<any>(null);
  const [triggerPlaidLink, setTriggerPlaidLink] = useState(0);

  const isLoading = accountsLoading || plaidLoading;

  // Handler for PlaidLinkButton success
  const handlePlaidSuccess = (result: any) => {
    setLinkResult(result);
    setShowLinkSuccess(true);
  };

  // Handler for connecting another account from success modal
  const handleConnectAnother = () => {
    setShowLinkSuccess(false);
    setLinkResult(null);
    // Trigger PlaidLinkButton to open again (will be handled externally if needed)
    setTriggerPlaidLink((prev) => prev + 1);
  };

  // Handler for done from success modal
  const handleDone = () => {
    setShowLinkSuccess(false);
    setLinkResult(null);
  };

  // Handler for re-authentication
  const handleReAuth = (itemId: string) => {
    console.log('Re-authenticate item:', itemId);
    // TODO: Implement re-auth flow with PlaidLinkButton in update mode
  };

  // If showing success modal, render it
  if (showLinkSuccess && linkResult) {
    return (
      <LinkSuccessModal
        institutionName={linkResult.plaidItem?.institutionName || 'Bank'}
        accounts={linkResult.plaidItem?.accounts || []}
        onDone={handleDone}
        onConnectAnother={handleConnectAnother}
      />
    );
  }

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
        <PlaidLinkButton mode="create" onSuccess={handlePlaidSuccess}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Connect Bank
        </PlaidLinkButton>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : accounts.length === 0 ? (
        /* Empty state when no accounts at all */
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No accounts connected
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Connect your bank accounts to get started with SpendWise. Track balances, transactions, and get personalized financial insights.
          </p>
          <div className="flex items-center justify-center gap-4">
            <PlaidLinkButton mode="create" onSuccess={handlePlaidSuccess} />
          </div>
        </div>
      ) : (
        <>
          {/* Balance Summary */}
          <BalanceSummary accounts={accounts} />

          {/* Account Type Groups */}
          <div className="space-y-8">
            <AccountTypeGroup
              type="CHECKING"
              accounts={accounts.filter((a: any) => a.type === 'CHECKING')}
              plaidItems={plaidItems}
              onConnectBank={handlePlaidSuccess}
              onReAuth={handleReAuth}
            />

            <AccountTypeGroup
              type="SAVINGS"
              accounts={accounts.filter((a: any) => a.type === 'SAVINGS')}
              plaidItems={plaidItems}
              onConnectBank={handlePlaidSuccess}
              onReAuth={handleReAuth}
            />

            <AccountTypeGroup
              type="CREDIT"
              accounts={accounts.filter((a: any) => a.type === 'CREDIT')}
              plaidItems={plaidItems}
              onConnectBank={handlePlaidSuccess}
              onReAuth={handleReAuth}
            />

            <AccountTypeGroup
              type="INVESTMENT"
              accounts={accounts.filter((a: any) => a.type === 'INVESTMENT')}
              plaidItems={plaidItems}
              onConnectBank={handlePlaidSuccess}
              onReAuth={handleReAuth}
            />
          </div>
        </>
      )}
    </div>
  );
}
