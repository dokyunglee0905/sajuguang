import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateSaju, BirthInfo } from '../saju/calculator';
import { CHEONGAN } from '../data/cheongan';
import { OHAENG_SANGSAENG, OHAENG_SANGGEUK } from '../data/ohaeng';
import { SIPSEONG_TABLE, SIPSEONG_DESC } from '../data/sipseong';
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

const SIPSEONG_GROUP_TRAITS: Record<string, string> = {
  비겁: '독립적이고 자존심 강한',
  식상: '표현력 풍부하고 창의적인',
  재성: '현실 감각이 뛰어나고 실용적인',
  관성: '책임감 있고 추진력이 강한',
  인성: '배려심 깊고 사려 깊은',
};

const SIPSEONG_GROUP_SYNERGY: Record<string, string> = {
  '비겁+비겁': '서로 비슷한 기질로 공감대가 깊지만, 고집이 맞닥뜨릴 때 한 발씩 양보하는 것이 중요해요.',
  '비겁+식상': '한 분은 확신 있게 나아가고, 다른 분은 풍부하게 표현해 서로의 부족한 부분을 채워줘요.',
  '비겁+재성': '한 분의 뚝심과 다른 분의 현실 감각이 만나 실질적인 성과를 만들어내는 조합이에요.',
  '비겁+관성': '한 분의 독립심과 다른 분의 책임감이 팽팽하게 균형을 이루며 서로를 단단하게 만들어요.',
  '비겁+인성': '한 분은 앞으로 나아가고, 다른 분은 따뜻하게 감싸주는 안정적인 관계예요.',
  '식상+식상': '두 분 모두 표현이 풍부하고 감각적이라 함께하면 즐겁고 창의적인 에너지가 넘쳐요.',
  '식상+재성': '창의적인 아이디어와 현실 실행력이 결합하는 강력한 조합으로, 함께라면 가능성이 커요.',
  '식상+관성': '표현하고 싶은 에너지와 방향을 잡으려는 기운이 만나 긴장과 자극이 공존하는 관계예요.',
  '식상+인성': '한 분은 발산하고, 다른 분은 받아주는 이상적인 음양 구조로 서로를 이해하는 힘이 커요.',
  '재성+재성': '두 분 모두 현실적이고 안정을 추구해 탄탄한 기반을 함께 쌓아가기 좋아요.',
  '재성+관성': '현실 감각과 추진력이 만나 강력한 시너지를 내지만, 때로는 속도 조율이 필요해요.',
  '재성+인성': '한 분의 실용성과 다른 분의 사려 깊음이 균형을 이루는 신뢰감 높은 관계예요.',
  '관성+관성': '두 분 모두 책임감과 카리스마가 강해 서로 존중하며 방향을 함께 결정하는 것이 중요해요.',
  '관성+인성': '한 분의 추진력을 다른 분의 배려가 부드럽게 감싸주는, 서로를 성장시키는 관계예요.',
  '인성+인성': '두 분 모두 깊은 배려와 이해를 갖고 있어 정서적으로 매우 안정된 관계를 만들어요.',
};

function buildIljuCompatDesc(
  ilgan1: string, jijiEl1: string, ilju1: string,
  ilgan2: string, jijiEl2: string, ilju2: string,
  name1: string, name2: string,
): string {
  const ss1sees2 = SIPSEONG_TABLE[ilgan1]?.[ilgan2] ?? '';
  const ss2sees1 = SIPSEONG_TABLE[ilgan2]?.[ilgan1] ?? '';
  const desc1 = SIPSEONG_DESC[ss1sees2];
  const desc2 = SIPSEONG_DESC[ss2sees1];
  const jijiRel = getOhaengRelation(jijiEl1, jijiEl2);

  let mainDesc = '';
  if (ss1sees2 && desc1 && ss2sees1 && desc2) {
    mainDesc = `${name1}님(${ilju1})에게 ${name2}님(${ilju2})은 ${ss1sees2}(${desc1.short})처럼 느껴지고, ${name2}님에게 ${name1}님은 ${ss2sees1}(${desc2.short})처럼 다가오는 사이입니다.`;
  }

  let jijiDesc = '';
  if (jijiRel.type === '비화') jijiDesc = `두 분의 일지 오행이 같아 근본적인 정서 결이 닮아 있어 자연스럽게 통하는 부분이 많아요.`;
  else if (jijiRel.type === '상생') jijiDesc = `일지 오행이 상생 관계라 함께 있을수록 서로의 기운을 살려주는 든든한 조합이에요.`;
  else jijiDesc = `일지 오행이 상극 관계로, 서로의 방식이 충돌할 때 의식적으로 맞춰가려는 노력이 필요해요.`;

  return `${mainDesc} ${jijiDesc}`.trim();
}

function personalizeText(text: string, el1: string, el2: string, name1: string, name2: string): string {
  return text
    .replace(new RegExp(`메인 오행이 ${el1}인 분`, 'g'), `${name1}님`)
    .replace(new RegExp(`메인 오행이 ${el2}인 분`, 'g'), `${name2}님`);
}

function buildSipseongCompatDesc(topSS1: string[], topSS2: string[], name1: string, name2: string): string {
  const g1 = SIPSEONG_DESC[topSS1[0]]?.group ?? topSS1[0];
  const g2 = SIPSEONG_DESC[topSS2[0]]?.group ?? topSS2[0];
  const trait1 = SIPSEONG_GROUP_TRAITS[g1] ?? g1;
  const trait2 = SIPSEONG_GROUP_TRAITS[g2] ?? g2;
  const synergy = SIPSEONG_GROUP_SYNERGY[`${g1}+${g2}`] ?? SIPSEONG_GROUP_SYNERGY[`${g2}+${g1}`] ?? '서로 다른 기질이 만나 새로운 가능성을 열어주는 관계예요.';
  return `${name1}님은 ${trait1} 기질이, ${name2}님은 ${trait2} 기질이 두드러집니다. ${synergy}`;
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

    const ilju1 = `${s1.dayPillar.cheongan}${s1.dayPillar.jiji}`;
    const ilju2 = `${s2.dayPillar.cheongan}${s2.dayPillar.jiji}`;
    const jijiEl1 = s1.dayPillar.jijiElement;
    const jijiEl2 = s2.dayPillar.jijiElement;

    const name1 = person1.name || '나';
    const name2 = person2.name || '상대방';
    const 일주궁합 = buildIljuCompatDesc(s1.ilgan, jijiEl1, ilju1, s2.ilgan, jijiEl2, ilju2, name1, name2);
    const 성향궁합 = buildSipseongCompatDesc(topSS1, topSS2, name1, name2);

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

    const p = (text: string) => personalizeText(text, el1, el2, name1, name2);

    if (dbRow) {
      compat = {
        score: dbRow.score,
        종합한마디: dbRow.summary,
        오행궁합: dbRow.ohaeng_desc,
        일주궁합,
        성향궁합,
        함께하면좋은것: (dbRow.strengths as string[]).map(p).join('\n'),
        조심할것: (dbRow.cautions as string[]).map(p).join('\n'),
        팁: p(dbRow.tip),
        keywords: dbRow.keywords,
      };
    } else {
      source = 'ai';
      const geminiResult = await geminiCompatFallback(p1Data, p2Data, ohaengRel, relationship);
      compat = {
        score: geminiResult.score,
        종합한마디: geminiResult.summary,
        오행궁합: geminiResult.ohaeng_desc,
        일주궁합,
        성향궁합,
        함께하면좋은것: (geminiResult.strengths as string[]).map(p).join('\n'),
        조심할것: (geminiResult.cautions as string[]).map(p).join('\n'),
        팁: p(geminiResult.tip),
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
