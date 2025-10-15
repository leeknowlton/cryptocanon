import React, { createContext, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { sdk } from '@farcaster/miniapp-sdk';

const FarcasterSolanaProvider = dynamic(
  () => import('@farcaster/mini-app-solana').then(mod => mod.FarcasterSolanaProvider),
  { ssr: false }
);

type SafeFarcasterSolanaProviderProps = {
  endpoint: string;
  children: React.ReactNode;
};

const SolanaProviderContext = createContext<{ hasSolanaProvider: boolean }>({ hasSolanaProvider: false });

export function SafeFarcasterSolanaProvider({ endpoint, children }: SafeFarcasterSolanaProviderProps) {
  const isClient = typeof window !== "undefined";
  const [hasSolanaProvider, setHasSolanaProvider] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);

  useEffect(() => {
    if (!isClient) return;
    let cancelled = false;
    (async () => {
      try {
        const provider = await sdk.wallet.getSolanaProvider();
        if (!cancelled) {
          setHasSolanaProvider(!!provider);
        }
      } catch {
        if (!cancelled) {
          setHasSolanaProvider(false);
        }
      } finally {
        if (!cancelled) {
          setChecked(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isClient]);

  // Suppress Solana provider errors in development
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes("WalletConnectionError") ||
        event.message?.includes("could not get Solana provider")
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('error', handleError);
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (!isClient || !checked) {
    return null;
  }

  return (
    <SolanaProviderContext.Provider value={{ hasSolanaProvider }}>
      {hasSolanaProvider ? (
        <FarcasterSolanaProvider endpoint={endpoint}>
          {children}
        </FarcasterSolanaProvider>
      ) : (
        <>{children}</>
      )}
    </SolanaProviderContext.Provider>
  );
}

export function useHasSolanaProvider() {
  return React.useContext(SolanaProviderContext).hasSolanaProvider;
}
