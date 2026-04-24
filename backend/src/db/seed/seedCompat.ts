/**
 * 궁합 DB 시딩 스크립트
 * 오행 5 × 5 × 관계유형 5 = 125개 항목 생성
 * 실행: ts-node src/db/seed/seedCompat.ts
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../supabase';
import dotenv from 'dotenv';
dotenv.config();

const ELEMENTS = ['목', '화', '토', '금', '수'] as const;
const RELATIONSHIPS = ['연인', '배우자', '친구', '직장동료', '가족'] as const;

const ELEMENT_INFO: Record<string, { nature: string; traits: string; desc: string }> = {
  목: {
    nature: '나무',
    traits: '성장, 창의, 추진력, 인자함, 도전 정신',
    desc: '새로운 것을 향해 뻗어나가는 나무의 기운. 성장과 확장을 추구하며 창의적이고 인정이 많습니다.',
  },
  화: {
    nature: '불',
    traits: '열정, 표현력, 직관, 명예, 활발함',
    desc: '활활 타오르는 불의 기운. 표현력이 넘치고 열정적이며 주변을 밝게 만드는 카리스마가 있습니다.',
  },
  토: {
    nature: '흙',
    traits: '안정, 신뢰, 포용, 중재, 묵직함',
    desc: '모든 것을 품는 흙의 기운. 신뢰롭고 안정적이며 중재자 역할을 잘합니다.',
  },
  금: {
    nature: '금속',
    traits: '결단력, 의리, 정의감, 냉철함, 원칙',
    desc: '날카롭고 단단한 금속의 기운. 원칙이 분명하고 결단력이 있으며 의리를 중요시합니다.',
  },
  수: {
    nature: '물',
    traits: '지혜, 유연함, 깊이, 포용력, 내성적',
    desc: '깊고 유연하게 흐르는 물의 기운. 지혜롭고 상황 적응력이 뛰어나며 내면이 풍부합니다.',
  },
};

// 오행 관계 표: [me][partner] → {type, principle}
const OHAENG_REL: Record<string, Record<string, { type: string; principle: string; direction: string }>> = {
  목: {
    목: { type: '비화(比和)', principle: '같은 나무끼리 비슷한 에너지를 공유합니다', direction: '동등' },
    화: { type: '상생(木生火)', principle: '나무가 불을 살린다 — 내가 상대를 북돋아주는 관계', direction: '내가 생함' },
    토: { type: '상극(木克土)', principle: '나무뿌리가 흙을 파고든다 — 내가 상대를 압박하는 관계', direction: '내가 극함' },
    금: { type: '상극(金克木)', principle: '도끼가 나무를 벤다 — 상대가 나를 억누르는 관계', direction: '상대가 극함' },
    수: { type: '상생(水生木)', principle: '물이 나무를 키운다 — 상대가 나를 보살펴주는 관계', direction: '상대가 생함' },
  },
  화: {
    목: { type: '상생(木生火)', principle: '나무가 불을 살린다 — 상대가 나를 북돋아주는 관계', direction: '상대가 생함' },
    화: { type: '비화(比和)', principle: '같은 불끼리 강렬하게 공명합니다', direction: '동등' },
    토: { type: '상생(火生土)', principle: '불이 재를 만든다 — 내가 상대를 생해주는 관계', direction: '내가 생함' },
    금: { type: '상극(火克金)', principle: '불이 금속을 녹인다 — 내가 상대를 압박하는 관계', direction: '내가 극함' },
    수: { type: '상극(水克火)', principle: '물이 불을 끈다 — 상대가 나를 억제하는 관계', direction: '상대가 극함' },
  },
  토: {
    목: { type: '상극(木克土)', principle: '나무뿌리가 흙을 파고든다 — 상대가 나를 압박하는 관계', direction: '상대가 극함' },
    화: { type: '상생(火生土)', principle: '불이 재(흙)를 만든다 — 상대가 나를 생해주는 관계', direction: '상대가 생함' },
    토: { type: '비화(比和)', principle: '같은 흙끼리 묵직하게 공명합니다', direction: '동등' },
    금: { type: '상생(土生金)', principle: '흙 속에서 금이 생긴다 — 내가 상대를 키워주는 관계', direction: '내가 생함' },
    수: { type: '상극(土克水)', principle: '흙이 물길을 막는다 — 내가 상대를 억제하는 관계', direction: '내가 극함' },
  },
  금: {
    목: { type: '상극(金克木)', principle: '도끼가 나무를 벤다 — 내가 상대를 압박하는 관계', direction: '내가 극함' },
    화: { type: '상극(火克金)', principle: '불이 금속을 녹인다 — 상대가 나를 억누르는 관계', direction: '상대가 극함' },
    토: { type: '상생(土生金)', principle: '흙 속에서 금이 생긴다 — 상대가 나를 키워주는 관계', direction: '상대가 생함' },
    금: { type: '비화(比和)', principle: '같은 금끼리 날카롭게 공명합니다', direction: '동등' },
    수: { type: '상생(金生水)', principle: '금속에서 물이 맺힌다 — 내가 상대를 생해주는 관계', direction: '내가 생함' },
  },
  수: {
    목: { type: '상생(水生木)', principle: '물이 나무를 키운다 — 내가 상대를 성장시키는 관계', direction: '내가 생함' },
    화: { type: '상극(水克火)', principle: '물이 불을 끈다 — 내가 상대를 억제하는 관계', direction: '내가 극함' },
    토: { type: '상극(土克水)', principle: '흙이 물길을 막는다 — 상대가 나를 압박하는 관계', direction: '상대가 극함' },
    금: { type: '상생(金生水)', principle: '금속에서 물이 맺힌다 — 상대가 나를 생해주는 관계', direction: '상대가 생함' },
    수: { type: '비화(比和)', principle: '같은 물끼리 깊이 공명합니다', direction: '동등' },
  },
};

const REL_CONTEXT: Record<string, string> = {
  연인: '두 사람이 연인으로 만날 때의 감정적 교감, 설렘, 매력, 갈등 패턴, 사랑을 나누는 방식',
  배우자: '평생 동반자로 살아갈 때의 조화, 생활 방식 맞춤, 가정 운영, 장기적 관계 안정성',
  친구: '친구로 만날 때의 우정 지속성, 함께하면 즐거운 것, 서로에게 미치는 영향, 의지가 되는 부분',
  직장동료: '함께 일할 때의 업무 시너지, 소통 방식 차이, 협업 강점, 갈등 예방법',
  가족: '가족으로 함께 살 때의 유대감, 역할, 서로 다른 성향이 가정 안에서 작용하는 방식',
};

// 관계 유형별 점수 보정값
const REL_SCORE_MODIFIER: Record<string, Record<string, number>> = {
  비화: { 연인: 0, 배우자: -5, 친구: 5, 직장동료: 3, 가족: 0 },
  상생: { 연인: 5, 배우자: 8, 친구: 3, 직장동료: 5, 가족: 5 },
  상극: { 연인: -5, 배우자: -8, 친구: -3, 직장동료: -3, 가족: -3 },
};

function getBaseScore(direction: string): number {
  if (direction === '동등') return 72;
  if (direction.includes('생')) return 80;
  if (direction === '내가 극함') return 58;
  if (direction === '상대가 극함') return 55;
  return 65;
}

async function generate(el1: string, el2: string, rel: string, retries = 3): Promise<any> {
  const relInfo = OHAENG_REL[el1][el2];
  const e1 = ELEMENT_INFO[el1];
  const e2 = ELEMENT_INFO[el2];
  const baseScore = getBaseScore(relInfo.direction);
  const mod = REL_SCORE_MODIFIER[relInfo.type.includes('비화') ? '비화' : relInfo.type.includes('상생') ? '상생' : '상극'][rel] ?? 0;
  const scoreHint = Math.min(95, Math.max(40, baseScore + mod));

  const prompt = `당신은 20년 경력의 명리학 전문가입니다. 전통 명리학 오행 이론에 근거해 두 사람의 궁합을 분석해주세요.

[두 사람의 오행 정보]
나 (메인 오행: ${el1}·${e1.nature}): ${e1.desc}
상대방 (메인 오행: ${el2}·${e2.nature}): ${e2.desc}

[두 오행의 관계 — 전통 명리학 이론]
관계: ${relInfo.type}
원리: ${relInfo.principle}

[관계 유형]
${rel} 관계 — 분석 초점: ${REL_CONTEXT[rel]}

[작성 원칙]
1. 전통 명리학 오행 이론에만 근거할 것 (창작 금지)
2. 전문 용어(오행 이름 제외)는 쉬운 현대어로 풀어쓸 것
3. "두 분은", "함께할 때" 형태로 따뜻하게 작성
4. 성향·패턴으로 표현 ("~하는 경향이 있어요", "~할 때 빛나요")
5. 상생이라고 무조건 좋지 않고, 상극이라고 무조건 나쁘지 않음 — 현실적으로 균형 있게
6. 다른 앱과 차별화: 추상적 표현 금지, 실제 생활 속 구체적 상황 묘사
7. ${rel} 관계의 맥락에 딱 맞게 작성

점수 기준: ${scoreHint}점 내외 (±5 조정 가능, 오행 관계·관계유형 종합)

아래 JSON 형식으로만 응답 (마크다운·설명 없이 순수 JSON만):

{
  "score": ${scoreHint},
  "summary": "${rel}으로 만난 두 분의 관계를 한 문장으로 — 구체적이고 따뜻하게",
  "ohaeng_desc": "${relInfo.type} 관계가 ${rel}에서 실제로 어떻게 나타나는지 4~5줄로 구체적으로",
  "strengths": ["이 조합이 ${rel}에서 특히 잘 되는 점 1", "강점 2", "강점 3"],
  "cautions": ["주의해야 할 점 1 — 구체적인 상황으로", "주의할 점 2"],
  "tip": "이 조합이 ${rel}에서 더 잘 지내기 위한 실천 가능한 팁 2~3줄",
  "keywords": ["이 궁합을 표현하는 키워드1", "키워드2", "키워드3"]
}`;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('JSON 없음');
      const parsed = JSON.parse(match[0]);
      // score 범위 강제
      parsed.score = Math.min(95, Math.max(40, Number(parsed.score) || scoreHint));
      return parsed;
    } catch (e) {
      if (attempt === retries - 1) throw e;
      await sleep(2000 * (attempt + 1));
    }
  }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function seed() {
  console.log('🌱 궁합 DB 시딩 시작 (총 125개)\n');
  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const el1 of ELEMENTS) {
    for (const el2 of ELEMENTS) {
      for (const rel of RELATIONSHIPS) {
        const key = `${el1}+${el2} [${rel}]`;

        // 이미 존재하면 스킵
        const { data: existing } = await supabase
          .from('compat_ohaeng')
          .select('id')
          .eq('ohaeng_me', el1)
          .eq('ohaeng_partner', el2)
          .eq('relationship', rel)
          .maybeSingle();

        if (existing) {
          process.stdout.write(`⏭  스킵: ${key}\n`);
          skipped++;
          continue;
        }

        try {
          process.stdout.write(`⏳ 생성: ${key} ... `);
          const content = await generate(el1, el2, rel);

          const { error } = await supabase.from('compat_ohaeng').insert({
            ohaeng_me: el1,
            ohaeng_partner: el2,
            relationship: rel,
            score: content.score,
            summary: content.summary,
            ohaeng_desc: content.ohaeng_desc,
            strengths: content.strengths,
            cautions: content.cautions,
            tip: content.tip,
            keywords: content.keywords,
          });

          if (error) throw error;
          process.stdout.write(`✅ (${content.score}점)\n`);
          success++;
        } catch (e: any) {
          process.stdout.write(`❌ 실패: ${e.message}\n`);
          failed++;
        }

        await sleep(1500); // 레이트 리밋 방지
      }
    }
  }

  console.log(`\n🏁 완료 — 성공 ${success} / 스킵 ${skipped} / 실패 ${failed}`);
}

seed().catch(console.error);
