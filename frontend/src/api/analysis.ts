import axios from 'axios';
import type { BirthInfo } from '../types/saju';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export interface FullAnalysis {
  나는어떤사람인가: {
    핵심기질: string;
    내면의나: string;
    사회적이미지: string;
    강점: string;
    약점과함정: string;
    나에게힘이되는기운: string;
  };
  일과적성: {
    일하는스타일: string;
    잘맞는분야: string;
    직장vs독립: string;
    커리어조심할것: string;
  };
  돈과재물: {
    돈을대하는방식: string;
    재물운흐름: string;
    돈이들어오는패턴: string;
    조심할소비습관: string;
  };
  사람들과어울리는방식: {
    연애스타일: string;
    결혼과파트너십: string;
    친구와인간관계: string;
    조심할관계패턴: string;
  };
  지금내시기는: {
    현재대운해석: string;
    올해흐름: string;
    지금해야할것: string;
    지금하지말아야할것: string;
  };
  건강과에너지: {
    타고난체질: string;
    조심할부분: string;
    에너지관리법: string;
  };
  나의연애코드: {
    끌리는유형: string;
    연애할때진짜모습: string;
    이별후패턴: string;
    연애에서조심할것: string;
  };
  소통과갈등방식: {
    소통스타일: string;
    갈등상황반응: string;
    상처받는말: string;
    화해하는방식: string;
  };
  나의성장키워드: {
    인생의테마: string;
    가장빛나는때: string;
    성장을위한조언: string;
    나의인생문장: string;
  };
}

export interface FullAnalysisResponse {
  analysis: FullAnalysis;
  meta: {
    singangsinyak: string;
    yongshin: string[];
    currentDaewoon: any;
    seun: { cheongan: string; jiji: string; element: string };
    hapchung: any;
  };
}

export async function getFullAnalysis(birthInfo: BirthInfo): Promise<FullAnalysisResponse> {
  const { data } = await api.post<FullAnalysisResponse>('/api/analysis/full', birthInfo);
  return data;
}
