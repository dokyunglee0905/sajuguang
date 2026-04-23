import { useState, useEffect } from 'react';
import type { BirthInfo, SajuResult } from '../types/saju';

const STORAGE_KEY = 'sajuguang_user';

interface SajuStore {
  birthInfo: BirthInfo | null;
  sajuResult: SajuResult | null;
  setBirthInfo: (info: BirthInfo) => void;
  setSajuResult: (result: SajuResult) => void;
  clear: () => void;
}

export function useSajuStore(): SajuStore {
  const [birthInfo, setBirthInfoState] = useState<BirthInfo | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).birthInfo ?? null : null;
    } catch {
      return null;
    }
  });

  const [sajuResult, setSajuResultState] = useState<SajuResult | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).sajuResult ?? null : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ birthInfo, sajuResult }));
  }, [birthInfo, sajuResult]);

  const setBirthInfo = (info: BirthInfo) => setBirthInfoState(info);
  const setSajuResult = (result: SajuResult) => setSajuResultState(result);
  const clear = () => {
    setBirthInfoState(null);
    setSajuResultState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { birthInfo, sajuResult, setBirthInfo, setSajuResult, clear };
}
