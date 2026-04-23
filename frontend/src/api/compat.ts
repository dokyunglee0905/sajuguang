import axios from 'axios';
import type { BirthInfo } from '../types/saju';

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export interface CompatAnalysis {
  score: number;
  종합한마디: string;
  오행궁합: string;
  일주궁합: string;
  성향궁합: string;
  함께하면좋은것: string;
  조심할것: string;
}

export interface CompatMeta {
  person1: { 이름: string; 메인오행: string; 일간: string; 일주: string; 신강신약: string };
  person2: { 이름: string; 메인오행: string; 일간: string; 일주: string; 신강신약: string };
  ohaengRel: { type: string; detail: string };
}

export interface CompatResult {
  compat: CompatAnalysis;
  meta: CompatMeta;
}

export async function getCompatResult(
  person1: BirthInfo,
  person2: BirthInfo,
  relationship?: string,
): Promise<CompatResult> {
  const { data } = await client.post<CompatResult>('/api/compat/one-to-one', { person1, person2, relationship });
  return data;
}
