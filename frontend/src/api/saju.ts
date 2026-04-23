import axios from 'axios';
import type { BirthInfo, SajuResult } from '../types/saju';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export async function calculateSaju(birthInfo: BirthInfo): Promise<SajuResult> {
  const { data } = await api.post<SajuResult>('/api/saju/calculate', birthInfo);
  return data;
}
