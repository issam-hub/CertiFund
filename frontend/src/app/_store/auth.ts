import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { User } from '../_lib/types';

// Atoms
export const userAtom = atom<User | null>(null);
export const isLoadingAtom = atom(true);

// This atom will be used for client-side auth state checks
// We're not storing the actual token here, just a flag
export const isAuthenticatedAtom = atomWithStorage('isAuthenticated', false);

// Derived atoms
export const authStateAtom = atom(
  (get) => ({
    user: get(userAtom),
    isLoading: get(isLoadingAtom),
    isAuthenticated: get(isAuthenticatedAtom),
  })
);