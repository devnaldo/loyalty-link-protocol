// store/useSolanaStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SavedMint } from '../types';

interface SolanaStore {
  // State
  savedMints: SavedMint[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addMint: (mint: SavedMint) => void;
  removeMint: (mintAddress: string) => void;
  updateMint: (mintAddress: string, updates: Partial<SavedMint>) => void;
  clearMints: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSolanaStore = create<SolanaStore>()(
  persist(
    (set, get) => ({
      // Initial state
      savedMints: [],
      isLoading: false,
      error: null,
      
      // Actions
      addMint: (mint) => 
        set((state) => ({
          savedMints: [...state.savedMints, mint],
          error: null
        })),
      
      removeMint: (mintAddress) =>
        set((state) => ({
          savedMints: state.savedMints.filter(mint => mint.address !== mintAddress)
        })),
      
      updateMint: (mintAddress, updates) =>
        set((state) => ({
          savedMints: state.savedMints.map(mint =>
            mint.address === mintAddress ? { ...mint, ...updates } : mint
          )
        })),
      
      clearMints: () => set({ savedMints: [] }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
    }),
    {
      name: 'solana-storage', // localStorage key
      storage: createJSONStorage(() => {
        // This handles SSR - only use localStorage on client
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);