import { SajuResult } from './calculator';
import { CHEONGAN } from '../data/cheongan';
import { JIJI, JIJANGGAN } from '../data/jiji';
import { OHAENG_SANGSAENG, OHAENG_SANGGEUK } from '../data/ohaeng';
import { CHEONGAN_HAP, CHEONGAN_CHUNG, JIJI_SAMHAP, JIJI_YUKHAP, JIJI_YUKCHUNG } from '../data/hapchung';
import { calculateSaju as manseryeokCalc, SIXTY_PILLARS } from '@fullstackfamily/manseryeok';

// 용신 계산 (신강신약 기반)
export function calcYongshin(singangsinyak: string, ilganEl: string): { yongshin: string[]; gishin: string[] } {
  const allEl = ['목', '화', '토', '금', '수'];

  if (singangsinyak === '신강') {
    // 신강: 일간과 인성(일간을 생해주는 오행)이 기신, 나머지가 용신
    const supportEl = Object.keys(OHAENG_SANGSAENG).find(k => OHAENG_SANGSAENG[k] === ilganEl) ?? '';
    const gishin = [ilganEl, supportEl].filter(Boolean);
    const yongshin = allEl.filter(el => !gishin.includes(el));
    return { yongshin, gishin };
  } else if (singangsinyak === '신약') {
    // 신약: 일간과 같거나 생해주는 오행이 용신
    const supportEl = Object.keys(OHAENG_SANGSAENG).find(k => OHAENG_SANGSAENG[k] === ilganEl) ?? '';
    const yongshin = [ilganEl, supportEl].filter(Boolean);
    const gishin = allEl.filter(el => !yongshin.includes(el));
    return { yongshin, gishin };
  } else {
    // 중화: 가장 부족한 오행 보충
    return { yongshin: [], gishin: [] };
  }
}

// 투간 계산 - 지장간 주기가 천간에 나타나는 경우
export function calcTougan(saju: SajuResult): string[] {
  const cheonganList = [
    saju.yearPillar.cheongan,
    saju.monthPillar.cheongan,
    saju.dayPillar.cheongan,
    saju.hourPillar.cheongan,
  ];
  const jijiList = [
    saju.yearPillar.jiji,
    saju.monthPillar.jiji,
    saju.dayPillar.jiji,
    saju.hourPillar.jiji,
  ];

  const tougan: string[] = [];
  for (const jj of jijiList) {
    const jijanggan = JIJANGGAN[jj];
    if (!jijanggan) continue;
    const mains = [jijanggan.main, jijanggan.middle, jijanggan.residual].filter(Boolean) as string[];
    for (const hidden of mains) {
      if (cheonganList.includes(hidden)) {
        tougan.push(`${jj}의 지장간 ${hidden}이 천간에 투출`);
      }
    }
  }
  return tougan;
}

// 합충형파해 탐지
export function calcHapChung(saju: SajuResult): {
  cheonganHap: string[];
  cheonganChung: string[];
  jijiHap: string[];
  jijiChung: string[];
  samhap: string[];
} {
  const cgs = [saju.yearPillar.cheongan, saju.monthPillar.cheongan, saju.dayPillar.cheongan, saju.hourPillar.cheongan];
  const jjs = [saju.yearPillar.jiji, saju.monthPillar.jiji, saju.dayPillar.jiji, saju.hourPillar.jiji];

  const cheonganHap: string[] = [];
  const cheonganChung: string[] = [];
  const jijiHap: string[] = [];
  const jijiChung: string[] = [];
  const samhap: string[] = [];

  // 천간합/충
  for (let i = 0; i < cgs.length; i++) {
    for (let j = i + 1; j < cgs.length; j++) {
      if (CHEONGAN_HAP[cgs[i]]?.partner === cgs[j]) cheonganHap.push(CHEONGAN_HAP[cgs[i]].desc);
      if (CHEONGAN_CHUNG[cgs[i]]?.partner === cgs[j]) cheonganChung.push(CHEONGAN_CHUNG[cgs[i]].desc);
    }
  }

  // 지지 육합/충
  for (let i = 0; i < jjs.length; i++) {
    for (let j = i + 1; j < jjs.length; j++) {
      if (JIJI_YUKHAP[jjs[i]]?.partner === jjs[j]) jijiHap.push(JIJI_YUKHAP[jjs[i]].desc);
      if (JIJI_YUKCHUNG[jjs[i]]?.partner === jjs[j]) jijiChung.push(JIJI_YUKCHUNG[jjs[i]].desc);
    }
  }

  // 삼합
  for (const s of JIJI_SAMHAP) {
    const matched = s.group.filter(g => jjs.includes(g));
    if (matched.length >= 2) samhap.push(`${s.desc} (${matched.join('·')} 포함)`);
  }

  return { cheonganHap, cheonganChung, jijiHap, jijiChung, samhap };
}

// 세운 계산 (올해 천간지지)
export function calcSeun(year: number): { cheongan: string; jiji: string; element: string } {
  const raw = manseryeokCalc(year, 1, 1, 0, 0) as any;
  const yearPillar = raw.yearPillar as string;
  const cg = yearPillar[0];
  const jj = yearPillar[1];
  const el = CHEONGAN.find(c => c.name === cg)?.element ?? '';
  return { cheongan: cg, jiji: jj, element: el };
}

// 지장간 전체 정보
export function getJijangganInfo(saju: SajuResult): Record<string, { main: string; middle?: string; residual?: string }> {
  const result: Record<string, any> = {};
  for (const [label, pillar] of [
    ['년지', saju.yearPillar.jiji],
    ['월지', saju.monthPillar.jiji],
    ['일지', saju.dayPillar.jiji],
    ['시지', saju.hourPillar.jiji],
  ] as [string, string][]) {
    result[label] = JIJANGGAN[pillar] ?? {};
  }
  return result;
}