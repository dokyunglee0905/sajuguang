export interface Pillar {
  cheongan: string;
  jiji: string;
  element: string;
  jijiElement: string;
}

export interface Daewoon {
  startAge: number;
  endAge: number;
  cheongan: string;
  jiji: string;
  element: string;
}

export interface SipseongInfo {
  name: string;
  score: number;
  group: string;
  short: string;
  personality: string;
  strength: string;
  weakness: string;
}

export interface MainOhaeng {
  element: string;
  icon: string;
  nature: string;
  personality: string;
  sangsaeng_desc: string;
  sanggeuk_desc: string;
}

export interface SajuResult {
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar;
  };
  ilgan: string;
  mainOhaeng: MainOhaeng;
  animal: string;
  ohaengCount: Record<string, number>;
  topSipseong: SipseongInfo[];
  sipseongScores: Record<string, number>;
  singangsinyak: '신강' | '신약' | '중화';
  daewoonList: Daewoon[];
  unknownHour: boolean;
}

export interface BirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: '남' | '여';
  unknownHour: boolean;
  name?: string;
}
