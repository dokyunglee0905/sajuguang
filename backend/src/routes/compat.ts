import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateSaju, BirthInfo } from '../saju/calculator';
import { CHEONGAN } from '../data/cheongan';
import { OHAENG_SANGSAENG, OHAENG_SANGGEUK } from '../data/ohaeng';
import { supabase } from '../db/supabase';

const router = Router();

function getOhaengRelation(el1: string, el2: string): { type: string; detail: string } {
  if (el1 === el2) return { type: '비화', detail: `두 분 모두 ${el1}의 기운을 지니고 있어 비슷한 에너지를 공유합니다` };
  if (OHAENG_SANGSAENG[el1] === el2) return { type: '상생', detail: `${el1}이 ${el2}을 생해주는 관계로, 자연스럽게 서로를 북돋아주는 흐름` };
  if (OHAENG_SANGSAENG[el2] === el1) return { type: '상생', detail: `${el2}이 ${el1}을 생해주는 관계로, 자연스럽게 서로를 북돋아주는 흐름` };
  if (OHAENG_SANGGEUK[el1] === el2) return { type: '상극', detail: `${el1}이 ${el2}을 극하는 관계로, 에너지 방향이 엇갈릴 수 있음` };
  if (OHAENG_SANGGEUK[el2] === el1) return { type: '상극', detail: `${el2}이 ${el1}을 극하는 관계로, 에너지 방향이 엇갈릴 수 있음` };
  return { type: '중립', detail: '직접적인 상생·상극 관계가 없는 중립적 조합' };
}

// DB에 없을 때 Gemini 폴백
const RELATIONSHIP_CONTEXT: Record<string, string> = {
  연인: '두 사람은 현재 연인 관계입니다. 감정적 교감, 매력, 연애 지속성, 갈등 패턴에 초점을 맞춰 분석해주세요.',
  배우자: '두 사람은 부부 관계이거나 결혼을 고려 중입니다. 장기적 동반자 관계, 생활 방식의 조화, 가정 운영 방식에 초점을 맞춰 분석해주세요.',
  친구: '두 사람은 친구 관계입니다. 우정의 지속성, 공통 관심사, 서로에게 미치는 영향에 초점을 맞춰 분석해주세요.',
  직장동료: '두 사람은 직장 동료 관계입니다. 업무 시너지, 소통 방식, 협업 시 주의할 점에 초점을 맞춰 분석해주세요.',
  가족: '두 사람은 가족 관계입니다. 가족 내 역할, 유대감, 갈등 해소 방식에 초점을 맞춰 분석해주세요.',
};

async function geminiCompatFallback(
  p1Data: Record<string, any>,
  p2Data: Record<string, any>,
  ohaengRel: { type: string; detail: string },
  relationship?: string,
): Promise<any> {
  const relationshipLine = relationship
    ? `\n[두 분의 관계]\n${relationship}${RELATIONSHIP_CONTEXT[relationship] ? '\n' + RELATIONSHIP_CONTEXT[relationship] : ''}\n`
    : '';

  const prompt = `당신은 20년 경력의 명리학 전문가입니다. 두 사람의 사주를 바탕으로 궁합을 분석해주세요.
${relationshipLine}
[첫 번째 사람]
${JSON.stringify(p1Data, null, 2)}

[두 번째 사람]
${JSON.stringify(p2Data, null, 2)}

[오행 관계]
- 관계 유형: ${ohaengRel.type}
- 설명: ${ohaengRel.detail}

[작성 원칙]
1. 전통 명리학에서 검증된 내용만 사용
2. 쉬운 현대어로 풀어쓸 것
3. 반드시 아래 JSON 형식으로만 응답

{
  "score": 75,
  "summary": "한 문장 요약",
  "ohaeng_desc": "오행 케미 설명 4~5줄",
  "strengths": ["강점1", "강점2", "강점3"],
  "cautions": ["주의점1", "주의점2"],
  "tip": "함께 잘 지내는 팁 2~3줄",
  "keywords": ["키워드1", "키워드2", "키워드3"]
}`;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Gemini 응답 파싱 실패');
  return JSON.parse(match[0]);
}

router.post('/one-to-one', async (req: Request, res: Response) => {
  const { person1, person2, relationship } = req.body;

  if (!person1 || !person2) {
    res.status(400).json({ error: '두 사람의 정보가 필요합니다.' });
    return;
  }

  const p1Info: BirthInfo = {
    year: Number(person1.year), month: Number(person1.month), day: Number(person1.day),
    hour: person1.unknownHour ? 0 : Number(person1.hour ?? 0),
    minute: person1.unknownHour ? 0 : Number(person1.minute ?? 0),
    gender: person1.gender, unknownHour: !!person1.unknownHour,
  };
  const p2Info: BirthInfo = {
    year: Number(person2.year), month: Number(person2.month), day: Number(person2.day),
    hour: person2.unknownHour ? 0 : Number(person2.hour ?? 0),
    minute: person2.unknownHour ? 0 : Number(person2.minute ?? 0),
    gender: person2.gender, unknownHour: !!person2.unknownHour,
  };

  try {
    const s1 = calculateSaju(p1Info);
    const s2 = calculateSaju(p2Info);

    const el1 = CHEONGAN.find(c => c.name === s1.ilgan)?.element ?? '';
    const el2 = CHEONGAN.find(c => c.name === s2.ilgan)?.element ?? '';
    const ohaengRel = getOhaengRelation(el1, el2);

    const topSS1 = Object.entries(s1.sipseongScores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    const topSS2 = Object.entries(s2.sipseongScores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);

    const p1Data = {
      이름: person1.name || '나', 성별: p1Info.gender === '남' ? '남성' : '여성',
      메인오행: el1, 일주: `${s1.dayPillar.cheongan}${s1.dayPillar.jiji}`,
      신강신약: s1.singangsinyak, 주요성향: topSS1,
    };
    const p2Data = {
      이름: person2.name || '상대방', 성별: p2Info.gender === '남' ? '남성' : '여성',
      메인오행: el2, 일주: `${s2.dayPillar.cheongan}${s2.dayPillar.jiji}`,
      신강신약: s2.singangsinyak, 주요성향: topSS2,
    };

    // ── DB에서 조회 ──────────────────────────────────────
    const relKey = relationship && RELATIONSHIP_CONTEXT[relationship] ? relationship : '친구';
    const { data: dbRow } = supabase ? await supabase
      .from('compat_ohaeng')
      .select('*')
      .eq('ohaeng_me', el1)
      .eq('ohaeng_partner', el2)
      .eq('relationship', relKey)
      .maybeSingle() : { data: null };

    let compat: any;
    let source: 'db' | 'ai' = 'db';

    if (dbRow) {
      compat = {
        score: dbRow.score,
        종합한마디: dbRow.summary,
        오행궁합: dbRow.ohaeng_desc,
        함께하면좋은것: (dbRow.strengths as string[]).join('\n'),
        조심할것: (dbRow.cautions as string[]).join('\n'),
        팁: dbRow.tip,
        keywords: dbRow.keywords,
      };
    } else {
      // DB 미등록 시 Gemini 폴백
      source = 'ai';
      const geminiResult = await geminiCompatFallback(p1Data, p2Data, ohaengRel, relationship);
      compat = {
        score: geminiResult.score,
        종합한마디: geminiResult.summary,
        오행궁합: geminiResult.ohaeng_desc,
        함께하면좋은것: (geminiResult.strengths as string[]).join('\n'),
        조심할것: (geminiResult.cautions as string[]).join('\n'),
        팁: geminiResult.tip,
        keywords: geminiResult.keywords,
      };
    }

    res.json({
      compat,
      meta: { person1: p1Data, person2: p2Data, ohaengRel, source },
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: '궁합 분석 중 오류가 발생했습니다.', detail: e?.message });
  }
});

export default router;
