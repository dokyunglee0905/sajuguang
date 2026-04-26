import { Router, Request, Response } from 'express';
import { calculateSaju } from '../saju/calculator';
import { CHEONGAN } from '../data/cheongan';
import { calcYongshin, calcTougan, calcHapChung, calcSeun, getJijangganInfo } from '../saju/analysisData';
import { supabase } from '../db/supabase';
import { generateJSON } from '../lib/gemini';
import { validateBirthFields, buildBirthKey, parseBirthInfo } from '../lib/birthUtils';

const router = Router();

// "지금내시기는" 섹션만 Gemini로 생성 (날짜 의존적)
async function generateCurrentPeriod(
  saju: any,
  ilganEl: string,
  gender: string,
  age: number,
  currentDaewoon: any,
  seun: any,
  hapchung: any,
): Promise<any> {
  const prompt = `당신은 명리학 전문가입니다. 아래 사주 정보를 바탕으로 "지금 이 시기"를 분석해주세요.

[사주 원국]
일간: ${saju.ilgan}(${ilganEl}), 신강신약: ${saju.singangsinyak}
성별: ${gender}, 나이: ${age}세

[현재 대운]
${currentDaewoon
  ? `${currentDaewoon.cheongan}${currentDaewoon.jiji}(${currentDaewoon.element}), ${currentDaewoon.startAge}~${currentDaewoon.endAge}세`
  : '대운 정보 없음'}

[올해 세운]
${seun.cheongan}${seun.jiji}(${seun.element})

[합충 관계]
${JSON.stringify(hapchung)}

[작성 원칙]
1. 현재 대운과 세운의 에너지가 이 사람의 사주에 어떻게 작용하는지 분석
2. 전통 명리학에서 검증된 내용만 사용
3. "지금 이 시기는", "올해는" 형태로 작성
4. 구체적이고 현실적으로 (추상적 표현 금지)
5. 아래 JSON 형식으로만 응답

{
  "현재대운해석": "현재 대운 기간의 에너지와 흐름 3~4줄",
  "올해흐름": "올해 세운 기반 전체 흐름 3줄",
  "지금해야할것": "이 시기에 집중해야 할 것 2~3줄",
  "지금하지말아야할것": "이 시기에 피해야 할 것 2줄"
}`;

  return generateJSON(prompt);
}

// DB에 없을 때 Gemini로 전체 분석 폴백
async function geminiFallback(analysisData: Record<string, any>, gender: string, age: number): Promise<any> {
  const prompt = `당신은 20년 경력의 명리학 전문가이자 심리 상담사입니다. 아래 사주 데이터를 바탕으로 분석을 작성해주세요.

[사주 데이터]
${JSON.stringify(analysisData, null, 2)}
- 성별: ${gender}
- 나이: ${age}세

[작성 원칙]
1. 전문 용어는 쉬운 말로 풀어쓸 것
2. "당신은" 형태로 작성
3. 각 항목은 3~5줄
4. 전통 명리학에서 검증된 내용만 사용
5. 아래 JSON 형식으로만 응답

{
  "나는어떤사람인가": { "핵심기질": "", "내면의나": "", "사회적이미지": "", "강점": "", "약점과함정": "", "나에게힘이되는기운": "" },
  "일과적성": { "일하는스타일": "", "잘맞는분야": "", "직장vs독립": "", "커리어조심할것": "" },
  "돈과재물": { "돈을대하는방식": "", "재물운흐름": "", "돈이들어오는패턴": "", "조심할소비습관": "" },
  "사람들과어울리는방식": { "연애스타일": "", "결혼과파트너십": "", "친구와인간관계": "", "조심할관계패턴": "" },
  "지금내시기는": { "현재대운해석": "", "올해흐름": "", "지금해야할것": "", "지금하지말아야할것": "" },
  "건강과에너지": { "타고난체질": "", "조심할부분": "", "에너지관리법": "" },
  "나의연애코드": { "끌리는유형": "", "연애할때진짜모습": "", "이별후패턴": "", "연애에서조심할것": "" },
  "소통과갈등방식": { "소통스타일": "", "갈등상황반응": "", "상처받는말": "", "화해하는방식": "" },
  "나의성장키워드": { "인생의테마": "", "가장빛나는때": "", "성장을위한조언": "", "나의인생문장": "" }
}`;

  return generateJSON(prompt);
}

router.post('/full', async (req: Request, res: Response) => {
  const validationError = validateBirthFields(req.body);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  const { gender } = req.body;
  const birthInfo = parseBirthInfo(req.body);
  const birthKey = buildBirthKey(birthInfo);

  try {
    const saju = calculateSaju(birthInfo);
    const ilganEl = CHEONGAN.find(c => c.name === saju.ilgan)?.element ?? '';
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthInfo.year;

    const yongshin = calcYongshin(saju.singangsinyak, ilganEl);
    const hapchung = calcHapChung(saju);
    const seun = calcSeun(currentYear);
    const currentDaewoon = saju.daewoonList.find(d => age >= d.startAge && age <= d.endAge);

    const ilju = `${saju.dayPillar.cheongan}${saju.dayPillar.jiji}`;

    // ── DB에서 일주 기반 섹션 조회 + 현재시기 캐시 병렬 조회 ──
    const DB_SECTIONS = ['나는어떤사람인가', '일과적성', '돈과재물', '사람들과어울리는방식', '건강과에너지', '나의연애코드', '소통과갈등방식', '나의성장키워드'];
    const periodKey = String(currentYear);

    const [{ data: dbRows }, { data: cachedPeriod }] = await Promise.all([
      supabase
        ? supabase.from('ilju_analysis').select('section, content').eq('ilju', ilju).in('section', DB_SECTIONS)
        : Promise.resolve({ data: null }),
      supabase
        ? supabase.from('fortune_cache').select('fortune').eq('birth_key', birthKey).eq('cache_type', 'current_period').eq('period_key', periodKey).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const dbMap: Record<string, any> = {};
    for (const row of (dbRows ?? [])) {
      dbMap[row.section] = row.content;
    }

    const hasDbContent = DB_SECTIONS.every(s => dbMap[s]);

    let analysis: any;
    let source: 'db' | 'ai' = 'db';

    if (hasDbContent) {
      // 현재시기 캐시 확인 → 없으면 Gemini 생성 후 저장
      let currentPeriod: any = cachedPeriod?.fortune ?? null;
      if (!currentPeriod) {
        try {
          currentPeriod = await generateCurrentPeriod(saju, ilganEl, gender, age, currentDaewoon, seun, hapchung);
          if (supabase) {
            await supabase.from('fortune_cache').upsert(
              { birth_key: birthKey, cache_type: 'current_period', period_key: periodKey, fortune: currentPeriod },
              { onConflict: 'birth_key,cache_type,period_key' },
            );
          }
        } catch {
          currentPeriod = {
            현재대운해석: '현재 시기 분석을 불러오지 못했어요.',
            올해흐름: '', 지금해야할것: '', 지금하지말아야할것: '',
          };
        }
      }

      analysis = {
        나는어떤사람인가: dbMap['나는어떤사람인가'],
        일과적성: dbMap['일과적성'],
        돈과재물: dbMap['돈과재물'],
        사람들과어울리는방식: dbMap['사람들과어울리는방식'],
        지금내시기는: currentPeriod,
        건강과에너지: dbMap['건강과에너지'],
        나의연애코드: dbMap['나의연애코드'],
        소통과갈등방식: dbMap['소통과갈등방식'],
        나의성장키워드: dbMap['나의성장키워드'],
      };
    } else {
      // DB 미구축 시 Gemini 전체 폴백
      source = 'ai';
      const tougan = calcTougan(saju);
      const jijanggan = getJijangganInfo(saju);
      const analysisData = {
        사주원국: {
          년주: `${saju.yearPillar.cheongan}${saju.yearPillar.jiji}(${saju.yearPillar.element})`,
          월주: `${saju.monthPillar.cheongan}${saju.monthPillar.jiji}(${saju.monthPillar.element})`,
          일주: `${saju.dayPillar.cheongan}${saju.dayPillar.jiji}(${saju.dayPillar.element})`,
          시주: `${saju.hourPillar.cheongan}${saju.hourPillar.jiji}(${saju.hourPillar.element})`,
        },
        일간: `${saju.ilgan}(${ilganEl})`, 신강신약: saju.singangsinyak,
        오행분포: saju.ohaengCount, 주요성향: saju.sipseongScores,
        지장간: jijanggan, 투간: tougan, 합충관계: hapchung,
        용신: yongshin.yongshin, 기신: yongshin.gishin,
        현재대운: currentDaewoon
          ? `${currentDaewoon.cheongan}${currentDaewoon.jiji}(${currentDaewoon.element}), ${currentDaewoon.startAge}~${currentDaewoon.endAge}세`
          : '없음',
        올해세운: `${seun.cheongan}${seun.jiji}(${seun.element})`,
      };
      analysis = await geminiFallback(analysisData, gender, age);
    }

    res.json({
      analysis,
      meta: {
        singangsinyak: saju.singangsinyak,
        yongshin: yongshin.yongshin,
        currentDaewoon,
        seun,
        hapchung,
        source,
        ilju,
      },
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: '분석 중 오류가 발생했습니다.', detail: e?.message });
  }
});

export default router;
