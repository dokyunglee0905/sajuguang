import { calculateSaju, BirthInfo } from './calculator';
import { CHEONGAN } from '../data/cheongan';
import { JIJI } from '../data/jiji';
import { OHAENG_DESC } from '../data/ohaeng';
import { SIPSEONG_DESC } from '../data/sipseong';

// 메인 오행 = 일간(日干)의 오행
function getMainOhaeng(ilgan: string): string {
  return CHEONGAN.find(c => c.name === ilgan)?.element ?? '';
}

// 일주 동물 = 일지(日支)의 12지 동물
function getIljuAnimal(dayJiji: string): string {
  return JIJI.find(j => j.name === dayJiji)?.animal ?? '';
}

function getTopSipseong(sipseongScores: Record<string, number>): { name: string; score: number }[] {
  return Object.entries(sipseongScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, score]) => ({ name, score }));
}

function runTest(name: string, birthInfo: BirthInfo) {
  console.log('\n' + '='.repeat(50));
  console.log(`📋 ${name}`);
  console.log(`생년월일시: ${birthInfo.year}년 ${birthInfo.month}월 ${birthInfo.day}일 ${birthInfo.hour}시 (${birthInfo.gender})`);
  if (birthInfo.unknownHour) console.log('⚠️  시간 미입력 → 자정(00시) 기준 계산');
  console.log('='.repeat(50));

  const result = calculateSaju(birthInfo);

  function jijiEl(jijiName: string): string {
    return JIJI.find(j => j.name === jijiName)?.element ?? '';
  }
  function pillarStr(label: string, p: typeof result.yearPillar, suffix = '') {
    const jEl = jijiEl(p.jiji);
    return `${label}: ${p.cheongan}(${p.element}) ${p.jiji}(${jEl})${suffix}`;
  }

  console.log('\n[사주원국]');
  console.log(pillarStr('년주', result.yearPillar));
  console.log(pillarStr('월주', result.monthPillar));
  console.log(pillarStr('일주', result.dayPillar, ' ← 일간'));
  console.log(pillarStr('시주', result.hourPillar));

  console.log('\n[오행 분포]');
  for (const [el, cnt] of Object.entries(result.ohaengCount)) {
    console.log(`  ${el}: ${cnt}`);
  }

  // 메인 오행 (일간 기준)
  const mainOhaeng = getMainOhaeng(result.ilgan);
  const ohaengInfo = OHAENG_DESC[mainOhaeng];
  console.log(`\n[메인 오행] ${ohaengInfo.icon} ${mainOhaeng}(${ohaengInfo.nature}) - 일간: ${result.ilgan}`);
  console.log(`  → "${ohaengInfo.personality}"`);

  // 일주 동물 (일지 12지 기준)
  const animal = getIljuAnimal(result.dayPillar.jiji);
  console.log(`\n[일주 동물] ${animal} - 일지: ${result.dayPillar.jiji}`);

  // 타고난 성향 TOP 3
  const topSipseong = getTopSipseong(result.sipseongScores);
  console.log('\n[타고난 성향 TOP3]');
  for (const { name, score } of topSipseong) {
    const desc = SIPSEONG_DESC[name];
    console.log(`  ${name} (가중치 ${score}) - ${desc?.short}`);
    console.log(`    강점: ${desc?.strength}`);
  }

  console.log(`\n[신강신약] ${result.singangsinyak}`);

  console.log('\n[대운 흐름]');
  for (const d of result.daewoonList.slice(0, 5)) {
    console.log(`  ${d.startAge}세~${d.endAge}세: ${d.cheongan}${d.jiji} (${d.element})`);
  }
}

const TEST_CASES: Array<{ name: string; info: BirthInfo }> = [
  {
    name: '검증 1 - 1990.09.05 여 15:00',
    info: { year: 1990, month: 9, day: 5, hour: 15, minute: 0, gender: '여' },
  },
  {
    name: '검증 2 - 1990.02.08 남 시간모름',
    info: { year: 1990, month: 2, day: 8, hour: 0, minute: 0, gender: '남', unknownHour: true },
  },
  {
    name: '검증 3 - 1996.08.06 여 23:00',
    info: { year: 1996, month: 8, day: 6, hour: 23, minute: 0, gender: '여' },
  },
  {
    name: '검증 4 - 1982.07.24 남 19:14',
    info: { year: 1982, month: 7, day: 24, hour: 19, minute: 14, gender: '남' },
  },
  {
    name: '검증 5 - 1990.11.03 남 13:31',
    info: { year: 1990, month: 11, day: 3, hour: 13, minute: 31, gender: '남' },
  },
];

for (const tc of TEST_CASES) {
  runTest(tc.name, tc.info);
}
