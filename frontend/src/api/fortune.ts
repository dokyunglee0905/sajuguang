import axios from 'axios';
import type { BirthInfo } from '../types/saju';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export interface TodayFortune {
  종합운: string;
  애정운: string;
  금전운: string;
  직업학업운: string;
  건강운: string;
  오늘의한마디: string;
}

export interface TodayFortuneResponse {
  date: string;
  fortune: TodayFortune;
}

export async function getTodayFortune(birthInfo: BirthInfo): Promise<TodayFortuneResponse> {
  const { data } = await api.post<TodayFortuneResponse>('/api/fortune/today', birthInfo);
  return data;
}