import { calculateSaju as manseryeokCalc, SIXTY_PILLARS } from '@fullstackfamily/manseryeok';
import { CHEONGAN } from '../data/cheongan';
import { JIJI, JIJANGGAN } from '../data/jiji';
import { SIPSEONG_TABLE } from '../data/sipseong';
import { OHAENG_SANGSAENG } from '../data/ohaeng';

export interface BirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number;   // 0~23, 시간 모를 경우 0(자시)
  minute: number;
  gender: '남' | '여';
  unknownHour?: boolean;
}

export interface Pillar {
  cheongan: string;
  jiji: string;
  element: string;     // 천간 기준 오행
  jijiElement: string; // 지지 기준 오행
}

export interface SajuResult {
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;
  ilgan: string;
  ohaengCount: Record<string, number>;
  sipseongList: string[];
  sipseongScores: Record<string, number>; // 가중치 적용 점수
  singangsinyak: '신강' | '신약' | '중화';
  daewoonList: Daewoon[];
  unknownHour: boolean;
}

export interface Daewoon {
  startAge: number;
  endAge: number;
  cheongan: string;
  jiji: string;
  element: string;
}

// SIXTY_PILLARS에서 한글 이름으로 Pillar 조회
function parsePillar(hangul: string): Pillar {
  const found = SIXTY_PILLARS.find((p: any) => p.combined.hangul === hangul);
  if (!found) {
    const cg = hangul[0];
    const jj = hangul[1];
    const el = CHEONGAN.find(c => c.name === cg)?.element ?? '';
    const jjEl = JIJI.find(j => j.name === jj)?.element ?? '';
    return { cheongan: cg, jiji: jj, element: el, jijiElement: jjEl };
  }
  return {
    cheongan: found.tiangan.hangul,
    jiji: found.dizhi.hangul,
    element: found.tiangan.element,
    jijiElement: JIJI.find(j => j.name === found.dizhi.hangul)?.element ?? '',
  };
}

// SIXTY_PILLARS에서 인덱스 조회
function getPillarIndex(hangul: string): number {
  return SIXTY_PILLARS.findIndex((p: any) => p.combined.hangul === hangul);
}

// 오행 개수 집계 (천간·지지·지장간 주기 반영)
function countOhaeng(pillars: Pillar[]): Record<string, number> {
  const count: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const p of pillars) {
    const cg = CHEONGAN.find(c => c.name === p.cheongan);
    const jj = JIJI.find(j => j.name === p.jiji);
    if (cg) count[cg.element]++;
    if (jj) count[jj.element]++;
    const jijanggan = JIJANGGAN[p.jiji];
    if (jijanggan?.main) {
      const mainCg = CHEONGAN.find(c => c.name === jijanggan.main);
      if (mainCg) count[mainCg.element] += 0.5;
    }
  }
  return count;
}

// 비겁(같은 오행) 또는 인성(일간을 생해주는 오행) 여부
function isSupport(el: string, ilganEl: string): boolean {
  if (el === ilganEl) return true;                          // 비겁
  if (OHAENG_SANGSAENG[el] === ilganEl) return true;       // 인성
  return false;
}

function getJijangEl(ganName: string): string {
  return CHEONGAN.find(c => c.name === ganName)?.element ?? '';
}

// 신강신약 100점 스케일 계산
// 비겁/인성 위치별 점수, 1~39=신약, 40~60=중화, 61+=신강
function calcSingangsinyak(
  ilgan: string,
  yearPillar: Pillar,
  monthPillar: Pillar,
  dayPillar: Pillar,
  hourPillar: Pillar,
): '신강' | '신약' | '중화' {
  const ilganEl = CHEONGAN.find(c => c.name === ilgan)?.element ?? '';
  let score = 0;

  // 천간 3개 (년간, 월간, 시간): 각 10점
  for (const cg of [yearPillar.cheongan, monthPillar.cheongan, hourPillar.cheongan]) {
    const el = CHEONGAN.find(c => c.name === cg)?.element ?? '';
    if (isSupport(el, ilganEl)) score += 10;
  }

  // 월지 지장간 주기 30점, 중기 10점
  const monthMain = JIJANGGAN[monthPillar.jiji]?.main;
  const monthMiddle = JIJANGGAN[monthPillar.jiji]?.middle;
  if (monthMain && isSupport(getJijangEl(monthMain), ilganEl)) score += 30;
  if (monthMiddle && isSupport(getJijangEl(monthMiddle), ilganEl)) score += 10;

  // 일지 지장간 주기 20점, 중기 6점
  const dayMain = JIJANGGAN[dayPillar.jiji]?.main;
  const dayMiddle = JIJANGGAN[dayPillar.jiji]?.middle;
  if (dayMain && isSupport(getJijangEl(dayMain), ilganEl)) score += 20;
  if (dayMiddle && isSupport(getJijangEl(dayMiddle), ilganEl)) score += 6;

  // 년지, 시지 지장간 주기 각 10점
  const yearMain = JIJANGGAN[yearPillar.jiji]?.main;
  const hourMain = JIJANGGAN[hourPillar.jiji]?.main;
  if (yearMain && isSupport(getJijangEl(yearMain), ilganEl)) score += 10;
  if (hourMain && isSupport(getJijangEl(hourMain), ilganEl)) score += 10;

  if (score >= 61) return '신강';
  if (score <= 39) return '신약';
  return '중화';
}

// 절기 황경 → KST 날짜 계산 (Meeus 단순화 알고리즘)
function calcJeolgiDate(year: number, targetLon: number): Date {
  const JDE_jan1 = 2451544.5 + 365.25 * (year - 2000);
  const approxOffset = ((targetLon - 280.4 + 360) % 360) / 360.0 * 365.25;
  let JDE = JDE_jan1 + approxOffset;
  for (let i = 0; i < 15; i++) {
    const T = (JDE - 2451545.0) / 36525.0;
    const L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360;
    const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360;
    const Mrad = M * Math.PI / 180;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
            + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
            + 0.000289 * Math.sin(3 * Mrad);
    let sunLon = (L0 + C) % 360;
    if (sunLon < 0) sunLon += 360;
    let diff = targetLon - sunLon;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    JDE += diff / 360.0 * 365.25;
  }
  // KST(UTC+9) 기준으로 날짜 결정
  const jd = Math.floor(JDE + 0.5 + 9 / 24);
  const a = jd + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor(146097 * b / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const mm = Math.floor((5 * e + 2) / 153);
  const gy = 100 * b + d - 4800 + Math.floor(mm / 10);
  const gm = mm + 3 - 12 * Math.floor(mm / 10);
  const gd = e - Math.floor((153 * mm + 2) / 5) + 1;
  return new Date(gy, gm - 1, gd);
}

// 12절(節)기 황경: 소한·입춘·경칩·청명·입하·망종·소서·입추·백로·한로·입동·대설
const JEOLGI_LONS = [285, 315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255];

// 출생일 기준 대운수 계산 (3일 = 1년)
function calcDaewoonStartAge(
  birthYear: number, birthMonth: number, birthDay: number,
  gender: '남' | '여',
): number {
  const yearCGIndex = ((birthYear - 4) % 10 + 10) % 10;
  const isYangYear = yearCGIndex % 2 === 0;
  const isForward = (isYangYear && gender === '남') || (!isYangYear && gender === '여');
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay).getTime();

  // 전년·당년·다음년 절기 날짜 수집
  const candidates: Date[] = [];
  for (const dy of [-1, 0, 1]) {
    for (const lon of JEOLGI_LONS) {
      candidates.push(calcJeolgiDate(birthYear + dy, lon));
    }
  }

  let target: Date | undefined;
  if (isForward) {
    target = candidates
      .filter(d => d.getTime() > birthDate)
      .sort((a, b) => a.getTime() - b.getTime())[0];
  } else {
    target = candidates
      .filter(d => d.getTime() < birthDate)
      .sort((a, b) => b.getTime() - a.getTime())[0];
  }

  if (!target) return 5;
  const diffDays = Math.abs(target.getTime() - birthDate) / 86400000;
  return Math.max(1, Math.round(diffDays / 3));
}

// 대운 목록 계산
function calcDaewoonList(
  birthYear: number, birthMonth: number, birthDay: number,
  gender: '남' | '여',
  monthPillarHangul: string,
): Daewoon[] {
  const yearCheonganIndex = ((birthYear - 4) % 10 + 10) % 10;
  const isYangYear = yearCheonganIndex % 2 === 0;
  const isForward = (isYangYear && gender === '남') || (!isYangYear && gender === '여');

  const monthPillarIndex = getPillarIndex(monthPillarHangul);
  const daewoonStartAge = calcDaewoonStartAge(birthYear, birthMonth, birthDay, gender);

  const result: Daewoon[] = [];
  for (let i = 0; i < 9; i++) {
    const offset = isForward ? i + 1 : -(i + 1);
    const index = ((monthPillarIndex + offset) % 60 + 60) % 60;
    const pillar = SIXTY_PILLARS[index] as any;
    const startAge = daewoonStartAge + i * 10;
    result.push({
      startAge,
      endAge: startAge + 9,
      cheongan: pillar.tiangan.hangul,
      jiji: pillar.dizhi.hangul,
      element: pillar.tiangan.element,
    });
  }
  return result;
}

export function calculateSaju(birthInfo: BirthInfo): SajuResult {
  const { year, month, day, hour, gender, unknownHour = false } = birthInfo;

  // 태양시 보정: 서울(동경 127°)은 표준시(동경 135°)보다 태양이 약 32분 늦음
  // 시간을 모를 경우 자정(00:00) 기본값 사용 → 보정 미적용
  let calcYear = year, calcMonth = month, calcDay = day, calcHour = hour, calcMinute = birthInfo.minute;
  if (!unknownHour) {
    const birthDate = new Date(year, month - 1, day, hour, birthInfo.minute);
    birthDate.setMinutes(birthDate.getMinutes() - 32);
    calcYear = birthDate.getFullYear();
    calcMonth = birthDate.getMonth() + 1;
    calcDay = birthDate.getDate();
    calcHour = birthDate.getHours();
    calcMinute = birthDate.getMinutes();
  }

  const raw = manseryeokCalc(calcYear, calcMonth, calcDay, calcHour, calcMinute) as any;

  const yearPillar = parsePillar(raw.yearPillar);
  const monthPillar = parsePillar(raw.monthPillar);
  const dayPillar = parsePillar(raw.dayPillar);
  const hourPillar = parsePillar(raw.hourPillar);

  const ilgan = dayPillar.cheongan;
  const allPillars = [yearPillar, monthPillar, dayPillar, hourPillar];
  const ohaengCount = countOhaeng(allPillars);

  // 십성: 위치별 가중치 적용 (월간·월지 높음, 일지 중간, 나머지 낮음)
  const sipseongWeights: { char: string; weight: number }[] = [
    { char: yearPillar.cheongan,  weight: 1.5 },
    { char: monthPillar.cheongan, weight: 3.0 },
    { char: hourPillar.cheongan,  weight: 1.5 },
    { char: yearPillar.jiji,      weight: 1.0 },
    { char: monthPillar.jiji,     weight: 3.0 },
    { char: dayPillar.jiji,       weight: 2.0 },
    { char: hourPillar.jiji,      weight: 1.0 },
  ];

  const sipseongScores: Record<string, number> = {};
  for (const { char, weight } of sipseongWeights) {
    let ss = '';
    if (CHEONGAN.find(c => c.name === char)) {
      ss = SIPSEONG_TABLE[ilgan]?.[char] ?? '';
    } else {
      const jijanggan = JIJANGGAN[char];
      if (jijanggan?.main) ss = SIPSEONG_TABLE[ilgan]?.[jijanggan.main] ?? '';
    }
    if (ss) sipseongScores[ss] = (sipseongScores[ss] ?? 0) + weight;
  }

  // 원본 목록 (순서 유지, 중복 포함)
  const sipseongList = sipseongWeights.map(({ char }) => {
    if (CHEONGAN.find(c => c.name === char)) return SIPSEONG_TABLE[ilgan]?.[char] ?? '';
    const jijanggan = JIJANGGAN[char];
    if (jijanggan?.main) return SIPSEONG_TABLE[ilgan]?.[jijanggan.main] ?? '';
    return '';
  }).filter(Boolean);

  const singangsinyak = calcSingangsinyak(ilgan, yearPillar, monthPillar, dayPillar, hourPillar);
  const daewoonList = calcDaewoonList(year, month, day, gender, raw.monthPillar);

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    ilgan,
    ohaengCount,
    sipseongList,
    sipseongScores,
    singangsinyak,
    daewoonList,
    unknownHour,
  };
}
