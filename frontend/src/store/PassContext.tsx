import { createContext, useContext, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'sajuguang_pass_expiry';
const PASS_DURATION_MS = 2 * 60 * 60 * 1000; // 2시간

interface PassCtx {
  isActive: boolean;
  activate: () => void;
  getRemainingMs: () => number;
}

const PassContext = createContext<PassCtx>({
  isActive: false,
  activate: () => {},
  getRemainingMs: () => 0,
});

export function PassProvider({ children }: { children: ReactNode }) {
  const [expiry, setExpiry] = useState<number>(() => {
    try { return Number(localStorage.getItem(STORAGE_KEY) ?? '0'); } catch { return 0; }
  });

  const isActive = expiry > Date.now();

  const activate = () => {
    const newExpiry = Date.now() + PASS_DURATION_MS;
    setExpiry(newExpiry);
    localStorage.setItem(STORAGE_KEY, String(newExpiry));
  };

  const getRemainingMs = () => Math.max(0, expiry - Date.now());

  return (
    <PassContext.Provider value={{ isActive, activate, getRemainingMs }}>
      {children}
    </PassContext.Provider>
  );
}

export const usePass = () => useContext(PassContext);
