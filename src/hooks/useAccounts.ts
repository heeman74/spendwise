'use client';

import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import {
  GET_ACCOUNTS,
  GET_ACCOUNT,
  GET_TOTAL_BALANCE,
  CREATE_ACCOUNT,
  UPDATE_ACCOUNT,
  DELETE_ACCOUNT,
} from '@/graphql';

export interface CreateAccountInput {
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT';
  balance: number;
  institution: string;
}

export interface UpdateAccountInput {
  name?: string;
  type?: 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT';
  institution?: string;
}

export function useAccounts() {
  const { data, loading, error, refetch } = useQuery(GET_ACCOUNTS, {
    fetchPolicy: 'cache-and-network',
  });

  return {
    accounts: data?.accounts ?? [],
    loading,
    error,
    refetch,
  };
}

export function useAccount(id: string) {
  const { data, loading, error, refetch } = useQuery(GET_ACCOUNT, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  return {
    account: data?.account,
    loading,
    error,
    refetch,
  };
}

export function useTotalBalance() {
  const { data, loading, error, refetch } = useQuery(GET_TOTAL_BALANCE, {
    fetchPolicy: 'cache-and-network',
  });

  return {
    totalBalance: data?.totalBalance ?? 0,
    loading,
    error,
    refetch,
  };
}

export function useCreateAccount() {
  const client = useApolloClient();
  const [createAccountMutation, { loading, error }] = useMutation(CREATE_ACCOUNT, {
    onCompleted: () => {
      client.refetchQueries({
        include: ['GetAccounts', 'GetDashboardStats', 'GetTotalBalance'],
      });
    },
  });

  const createAccount = (input: CreateAccountInput) =>
    createAccountMutation({ variables: { input } });

  return {
    createAccount,
    loading,
    error,
  };
}

export function useUpdateAccount() {
  const client = useApolloClient();
  const [updateAccountMutation, { loading, error }] = useMutation(UPDATE_ACCOUNT, {
    onCompleted: () => {
      client.refetchQueries({
        include: ['GetAccounts', 'GetDashboardStats', 'GetTotalBalance'],
      });
    },
  });

  const updateAccount = (id: string, input: UpdateAccountInput) =>
    updateAccountMutation({ variables: { id, input } });

  return {
    updateAccount,
    loading,
    error,
  };
}

export function useDeleteAccount() {
  const client = useApolloClient();
  const [deleteAccountMutation, { loading, error }] = useMutation(DELETE_ACCOUNT, {
    onCompleted: () => {
      client.refetchQueries({
        include: ['GetAccounts', 'GetDashboardStats', 'GetTotalBalance'],
      });
    },
  });

  const deleteAccount = (id: string) =>
    deleteAccountMutation({ variables: { id } });

  return {
    deleteAccount,
    loading,
    error,
  };
}
