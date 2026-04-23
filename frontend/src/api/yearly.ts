import axios from 'axios';
import type { BirthInfo } from '../types/saju';

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export interface AnnualFortune {
  총운풀이: string;
  집중할것: string;
  주의할것: string;
  재물운: string;
  애정운: string;
  결혼운: string;
  직업운: string;
  사업운: string;
  건강운: string;
  인맥운: string;
  올해의한마디: string;
}

export interface MonthlyFortune {
  이달의흐름: string;
  애정운: string;
  금전운: string;
  직업학업운: string;
  건강운: string;
  좋은점: string;
  주의할점: string;
  길일: number[];
  흉일: number[];
}

export async function getAnnualFortune(birthInfo: BirthInfo, targetYear: number): Promise<{ year: number; fortune: AnnualFortune }> {
  const { data } = await client.post('/api/yearly/annual', { ...birthInfo, targetYear });
  return data;
}

export async function getMonthlyFortune(birthInfo: BirthInfo, targetYear: number, targetMonth: number): Promise<{ year: number; month: number; fortune: MonthlyFortune }> {
  const { data } = await client.post('/api/yearly/monthly', { ...birthInfo, targetYear, targetMonth });
  return data;
}
