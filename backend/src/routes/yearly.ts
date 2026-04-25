import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateSaju as manseryeokCalc } from '@fullstackfamily/manseryeok';
import { calculateSaju, BirthInfo } from '../saju/calculator';
import { CHEONGAN } from '../data/cheongan';
import { calcSeun } from '../saju/analysisData';
import { supabase } from '../db/supabase';

const router = Router();

function getMonthPillar(year: number, month: number): { cheongan: string; jiji: string; element: string } {
  const raw = manseryeokCalc(year, month, 15, 0, 0) as any;
  const mp = raw.monthPillar as string;
  const cg = mp[0];
  const el = CHEONGAN.find(c => c.name === cg)?.element ?? '';
  return { cheongan: cg, jiji: mp[1], element: el };
}

function buildBirthKey(info: BirthInfo): string {
  return `${info.year}-${info.month}-${info.day}-${info.hour}-${info.minute}-${info.gender}`;
}

function buildAnnualPrompt(data: Record<string, any>, gender: string, targetYear: number): string {
  return `당신은 20년 경력의 명리학 전문가입니다. 아래 사주 데이터를 바탕으로 ${targetYear}년 신년운세를 작성해주세요.

[사주 데이터]
${JSON.stringify(data, null, 2)}
- 성별: ${gender}

[작성 원칙]
1. 천간·지지·십성 등 전문 용어는 반드시 쉬운 말로 풀어쓸 것
2. "당신은", "올해는" 같은 2인칭으로 작성
3. 각 항목은 모바일 기준 3~4줄 분량
4. 전문적이되 따뜻하고 공감되게 작성
5. 전통 명리학에서 검증된 내용만 사용
6. 반드시 아래 JSON 형식으로만 응답 (마크다운, 설명 없이 순수 JSON만)

{
  "총운풀이": "${targetYear}년 전체 에너지 흐름과 핵심 키워드 4~5줄",
  "집중할것": "올해 좋은 기운이 있는 분야, 집중해야 할 것 3~4줄",
  "주의할것": "올해 조심해야 할 것, 피해야 할 상황 3~4줄",
  "재물운": "올해 재물·금전 흐름 3~4줄",
  "애정운": "올해 연애·사랑 흐름 3~4줄",
  "결혼운": "올해 결혼·파트너십 흐름 3~4줄",
  "직업운": "올해 직업·커리어 흐름 3~4줄",
  "사업운": "올해 사업·창업 흐름 3~4줄",
  "건강운": "올해 건강·컨디션 흐름 3~4줄",
  "인맥운": "올해 인간관계·인맥 흐름 3~4줄",
  "올해의한마디": "${targetYear}년을 한 문장으로 표현 (1줄)"
}`;
}

function buildMonthlyPrompt(data: Record<string, any>, gender: string, targetYear: number, targetMonth: number): string {
  return `당신은 20년 경력의 명리학 전문가입니다. 아래 사주 데이터를 바탕으로 ${targetYear}년 ${targetMonth}월 운세를 작성해주세요.

[사주 데이터]
${JSON.stringify(data, null, 2)}
- 성별: ${gender}

[작성 원칙]
1. 천간·지지·십성 등 전문 용어는 반드시 쉬운 말로 풀어쓸 것
2. "당신의", "이번 달은" 같은 표현으로 작성
3. 각 항목은 모바일 기준 2~3줄 분량
4. 전문적이되 따뜻하고 공감되게 작성
5. 전통 명리학에서 검증된 내용만 사용
6. 길일·흉일은 ${targetYear}년 ${targetMonth}월 실제 날짜(1일~말일) 중 각 3~5개를 정수 배열로 제시
7. 반드시 아래 JSON 형식으로만 응답 (마크다운, 설명 없이 순수 JSON만)

{
  "이달의흐름": "${targetMonth}월 전체 에너지 흐름과 핵심 방향 3~4줄",
  "애정운": "이번 달 연애·관계 흐름 2~3줄",
  "금전운": "이번 달 재물·금전 흐름 2~3줄",
  "직업학업운": "이번 달 직업·학업 흐름 2~3줄",
  "건강운": "이번 달 건강·컨디션 2~3줄",
  "좋은점": "이번 달 잘 풀리는 부분, 기회가 오는 영역 2~3줄",
  "주의할점": "이번 달 조심해야 할 부분, 피해야 할 상황 2~3줄",
  "길일": [14, 19, 23],
  "흉일": [5, 12, 28]
}`;
}

router.post('/annual', async (req: Request, res: Response) => {
  const { year, month, day, hour, minute, gender, unknownHour, targetYear } = req.body;
  if (!year || !month || !day || !gender) {
    res.status(400).json({ error: '생년월일과 성별은 필수입니다.' });
    return;
  }

  const birthInfo: BirthInfo = {
    year: Number(year), month: Number(month), day: Number(day),
    hour: unknownHour ? 0 : Number(hour ?? 0),
    minute: unknownHour ? 0 : Number(minute ?? 0),
    gender, unknownHour: !!unknownHour,
  };
  const ty = Number(targetYear) || new Date().getFullYear();
  const birthKey = buildBirthKey(birthInfo);
  const periodKey = String(ty);

  try {
    // ── 캐시 조회 ──────────────────────────────────────────
    if (supabase) {
      const { data: cached } = await supabase
        .from('fortune_cache')
        .select('fortune')
        .eq('birth_key', birthKey)
        .eq('cache_type', 'annual')
        .eq('period_key', periodKey)
        .maybeSingle();

      if (cached) {
        res.json({ year: ty, fortune: cached.fortune, cached: true });
        return;
      }
    }

    // ── Gemini 생성 ────────────────────────────────────────
    const saju = calculateSaju(birthInfo);
    const ilganEl = CHEONGAN.find(c => c.name === saju.ilgan)?.element ?? '';
    const seun = calcSeun(ty);
    const ageInYear = ty - Number(year);
    const currentDaewoon = saju.daewoonList.find(d => ageInYear >= d.startAge && ageInYear <= d.endAge);

    const analysisData = {
      사주원국: {
        년주: `${saju.yearPillar.cheongan}${saju.yearPillar.jiji}`,
        월주: `${saju.monthPillar.cheongan}${saju.monthPillar.jiji}`,
        일주: `${saju.dayPillar.cheongan}${saju.dayPillar.jiji}`,
        시주: `${saju.hourPillar.cheongan}${saju.hourPillar.jiji}`,
      },
      일간: `${saju.ilgan}(${ilganEl})`,
      신강신약: saju.singangsinyak,
      대상연도: `${ty}년`,
      세운: `${seun.cheongan}${seun.jiji}(${seun.element})`,
      현재대운: currentDaewoon
        ? `${currentDaewoon.cheongan}${currentDaewoon.jiji}(${currentDaewoon.element}), ${currentDaewoon.startAge}~${currentDaewoon.endAge}세`
        : '없음',
      나이: `${ageInYear}세`,
    };

    const prompt = buildAnnualPrompt(analysisData, gender, ty);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) { res.status(500).json({ error: '운세 생성 실패' }); return; }

    const fortune = JSON.parse(jsonMatch[0]);

    // ── DB 저장 ────────────────────────────────────────────
    if (supabase) {
      await supabase.from('fortune_cache').upsert(
        { birth_key: birthKey, cache_type: 'annual', period_key: periodKey, fortune },
        { onConflict: 'birth_key,cache_type,period_key' },
      );
    }

    res.json({ year: ty, fortune, cached: false });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: '신년운세 생성 중 오류가 발생했습니다.', detail: e?.message });
  }
});

router.post('/monthly', async (req: Request, res: Response) => {
  const { year, month, day, hour, minute, gender, unknownHour, targetYear, targetMonth } = req.body;
  if (!year || !month || !day || !gender) {
    res.status(400).json({ error: '생년월일과 성별은 필수입니다.' });
    return;
  }

  const birthInfo: BirthInfo = {
    year: Number(year), month: Number(month), day: Number(day),
    hour: unknownHour ? 0 : Number(hour ?? 0),
    minute: unknownHour ? 0 : Number(minute ?? 0),
    gender, unknownHour: !!unknownHour,
  };
  const now = new Date();
  const ty = Number(targetYear) || now.getFullYear();
  const tm = Number(targetMonth) || (now.getMonth() + 1);
  const birthKey = buildBirthKey(birthInfo);
  const periodKey = `${ty}-${String(tm).padStart(2, '0')}`;

  try {
    // ── 캐시 조회 ──────────────────────────────────────────
    if (supabase) {
      const { data: cached } = await supabase
        .from('fortune_cache')
        .select('fortune')
        .eq('birth_key', birthKey)
        .eq('cache_type', 'monthly')
        .eq('period_key', periodKey)
        .maybeSingle();

      if (cached) {
        res.json({ year: ty, month: tm, fortune: cached.fortune, cached: true });
        return;
      }
    }

    // ── Gemini 생성 ────────────────────────────────────────
    const saju = calculateSaju(birthInfo);
    const ilganEl = CHEONGAN.find(c => c.name === saju.ilgan)?.element ?? '';
    const seun = calcSeun(ty);
    const monthPillar = getMonthPillar(ty, tm);
    const ageInYear = ty - Number(year);
    const currentDaewoon = saju.daewoonList.find(d => ageInYear >= d.startAge && ageInYear <= d.endAge);

    const analysisData = {
      사주원국: {
        년주: `${saju.yearPillar.cheongan}${saju.yearPillar.jiji}`,
        월주: `${saju.monthPillar.cheongan}${saju.monthPillar.jiji}`,
        일주: `${saju.dayPillar.cheongan}${saju.dayPillar.jiji}`,
        시주: `${saju.hourPillar.cheongan}${saju.hourPillar.jiji}`,
      },
      일간: `${saju.ilgan}(${ilganEl})`,
      신강신약: saju.singangsinyak,
      대상월: `${ty}년 ${tm}월`,
      세운: `${seun.cheongan}${seun.jiji}(${seun.element})`,
      월운: `${monthPillar.cheongan}${monthPillar.jiji}(${monthPillar.element})`,
      현재대운: currentDaewoon
        ? `${currentDaewoon.cheongan}${currentDaewoon.jiji}(${currentDaewoon.element}), ${currentDaewoon.startAge}~${currentDaewoon.endAge}세`
        : '없음',
      나이: `${ageInYear}세`,
    };

    const prompt = buildMonthlyPrompt(analysisData, gender, ty, tm);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) { res.status(500).json({ error: '운세 생성 실패' }); return; }

    const fortune = JSON.parse(jsonMatch[0]);

    // ── DB 저장 ────────────────────────────────────────────
    if (supabase) {
      await supabase.from('fortune_cache').upsert(
        { birth_key: birthKey, cache_type: 'monthly', period_key: periodKey, fortune },
        { onConflict: 'birth_key,cache_type,period_key' },
      );
    }

    res.json({ year: ty, month: tm, fortune, cached: false });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: '월별운세 생성 중 오류가 발생했습니다.', detail: e?.message });
  }
});

export default router;
