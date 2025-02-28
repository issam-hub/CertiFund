// components/AuthInit.tsx
'use client'

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom, isLoadingAtom, userAtom } from '@/app/_store/auth';
import { getCurrentUser } from '@/app/_actions/auth';

// This component synchronizes the server-side auth state with client-side Jotai state
export default function AuthInit() {
  const [, setUser] = useAtom(userAtom);
  const [, setIsLoading] = useAtom(isLoadingAtom);
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  
  useEffect(() => {
    const initAuth = async () => {
        if (isAuthenticated) {
          const res = await getCurrentUser()
          
          if (res !== null && !res.error) {
            setUser(res["user"]);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        }
        setIsLoading(false);
    };
    
    initAuth();
  }, [isAuthenticated, setIsAuthenticated, setIsLoading, setUser]);
  
  return null;
}