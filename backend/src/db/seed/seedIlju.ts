/**
 * 일주 분석 DB 시딩 스크립트
 * 60 일주 × 8섹션 = 480개 항목 생성
 * 이미 저장된 섹션은 스킵, 빠진 섹션만 생성
 * 실행: ts-node src/db/seed/seedIlju.ts
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../supabase';
import dotenv from 'dotenv';
dotenv.config();

// ─── 천간 특성 ───────────────────────────────────────────
const CHEONGAN_INFO: Record<string, { hanja: string; element: string; yin_yang: string; nature: string; traits: string }> = {
  갑: { hanja: '甲', element: '목', yin_yang: '양', nature: '큰 나무·소나무', traits: '강한 추진력과 리더십. 성장 의지가 강하고 직선적. 독립심과 고집이 세며 새로운 것을 개척하길 좋아함' },
  을: { hanja: '乙', element: '목', yin_yang: '음', nature: '덩굴·화초', traits: '유연하고 적응력이 뛰어남. 세심하고 끈질기게 목표를 이루어 냄. 부드럽지만 속으로는 강한 의지' },
  병: { hanja: '丙', element: '화', yin_yang: '양', nature: '태양·큰 불', traits: '카리스마 넘치고 밝음. 표현력이 강하고 명예를 중요시. 따뜻하고 주변을 환하게 만드는 에너지' },
  정: { hanja: '丁', element: '화', yin_yang: '음', nature: '촛불·화롯불', traits: '예민하고 섬세함. 집중력이 뛰어나고 신중하게 판단. 예술적 감각이 있고 깊이 있는 사고' },
  무: { hanja: '戊', element: '토', yin_yang: '양', nature: '산·큰 땅', traits: '든든하고 포용력이 큼. 안정감을 주는 존재. 묵직하고 고지식하지만 믿음직스러움' },
  기: { hanja: '己', element: '토', yin_yang: '음', nature: '평지·논밭', traits: '세심하고 현실적. 상황 파악이 빠르고 실용적으로 문제를 해결. 꼼꼼하게 챙기는 성격' },
  경: { hanja: '庚', element: '금', yin_yang: '양', nature: '강철·큰 금속', traits: '결단력이 강하고 원칙주의. 카리스마 있고 냉철함. 직선적이며 의리를 중요시' },
  신: { hanja: '辛', element: '금', yin_yang: '음', nature: '보석·칼날', traits: '섬세하고 완벽주의. 예리한 판단력과 미적 감각. 날카롭지만 정교함' },
  임: { hanja: '壬', element: '수', yin_yang: '양', nature: '강물·바다', traits: '야망이 크고 포용력이 넓음. 자유롭게 큰 그림을 그리며 지략이 뛰어남' },
  계: { hanja: '癸', element: '수', yin_yang: '음', nature: '이슬·비', traits: '직관이 뛰어나고 섬세함. 내면이 깊고 공감력이 높음. 신비로운 분위기와 풍부한 감수성' },
};

// ─── 지지 특성 ───────────────────────────────────────────
const JIJI_INFO: Record<string, { hanja: string; element: string; yin_yang: string; animal: string; traits: string }> = {
  자: { hanja: '子', element: '수', yin_yang: '양', animal: '쥐', traits: '기민하고 지혜로움. 밤의 에너지로 조용히 움직이며 생존 본능이 뛰어남' },
  축: { hanja: '丑', element: '토', yin_yang: '음', animal: '소', traits: '인내심이 강하고 성실함. 느리지만 확실하게 자기 길을 가는 뚝심' },
  인: { hanja: '寅', element: '목', yin_yang: '양', animal: '호랑이', traits: '용감하고 추진력이 강함. 도전을 즐기고 리더십이 넘침. 위풍당당' },
  묘: { hanja: '卯', element: '목', yin_yang: '음', animal: '토끼', traits: '감수성이 풍부하고 부드러움. 재주가 많고 사교적. 주변을 편안하게 만드는 능력' },
  진: { hanja: '辰', element: '토', yin_yang: '양', animal: '용', traits: '야망이 크고 카리스마가 있음. 신비로운 매력과 변화를 이끄는 에너지' },
  사: { hanja: '巳', element: '화', yin_yang: '음', animal: '뱀', traits: '직관이 날카롭고 지혜로움. 신중하게 판단하고 집중력이 탁월함' },
  오: { hanja: '午', element: '화', yin_yang: '양', animal: '말', traits: '활동적이고 자유를 사랑함. 빠른 결단과 열정. 달리는 것을 멈추기 어려움' },
  미: { hanja: '未', element: '토', yin_yang: '음', animal: '양', traits: '온화하고 배려심이 깊음. 예술적 감각과 공감 능력이 뛰어남' },
  신: { hanja: '申', element: '금', yin_yang: '양', animal: '원숭이', traits: '재치 있고 영리함. 변화에 빠르게 적응하고 임기응변에 강함' },
  유: { hanja: '酉', element: '금', yin_yang: '음', animal: '닭', traits: '꼼꼼하고 완벽주의. 심미안이 뛰어나고 분석력이 높음. 정확함을 추구' },
  술: { hanja: '戌', element: '토', yin_yang: '양', animal: '개', traits: '의리 있고 충직함. 정의감이 강하고 고집스러울 만큼 자신의 신념을 지킴' },
  해: { hanja: '亥', element: '수', yin_yang: '음', animal: '돼지', traits: '낙천적이고 관대함. 복이 따르고 생명력이 넘침. 품이 넓고 여유로움' },
};

// 오행 관계 (천간 오행 vs 지지 오행)
const OHAENG_SANGSAENG: Record<string, string> = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' };
const OHAENG_SANGGEUK: Record<string, string> = { 목: '토', 화: '금', 토: '수', 금: '목', 수: '화' };

function getCgJjRelation(cgEl: string, jjEl: string): string {
  if (cgEl === jjEl) return '비화(同氣) — 천간과 지지가 같은 오행으로 에너지가 순수하게 집중됩니다';
  if (OHAENG_SANGSAENG[cgEl] === jjEl) return `상생(${cgEl}生${jjEl}) — 천간이 지지를 생해주며 내면과 외면이 자연스럽게 흘러갑니다`;
  if (OHAENG_SANGSAENG[jjEl] === cgEl) return `상생(${jjEl}生${cgEl}) — 지지가 천간을 받쳐주며 든든한 내면의 지지대가 됩니다`;
  if (OHAENG_SANGGEUK[cgEl] === jjEl) return `상극(${cgEl}克${jjEl}) — 천간이 지지를 극하며 내면과 외면 사이에 긴장과 역동성이 생깁니다`;
  return `상극(${jjEl}克${cgEl}) — 지지가 천간을 극하며 내면의 에너지가 외면에서 부딪히는 긴장감이 있습니다`;
}

// ─── 60 일주 목록 ─────────────────────────────────────────
const YANG_CG = ['갑', '병', '무', '경', '임'];
const YIN_CG  = ['을', '정', '기', '신', '계'];
const YANG_JJ = ['자', '인', '진', '오', '신', '술'];
const YIN_JJ  = ['축', '묘', '사', '미', '유', '해'];

type IljuEntry = { ilju: string; cg: string; jj: string };
const ILJU_LIST: IljuEntry[] = [
  ...YANG_CG.flatMap(cg => YANG_JJ.map(jj => ({ ilju: cg + jj, cg, jj }))),
  ...YIN_CG.flatMap(cg => YIN_JJ.map(jj => ({ ilju: cg + jj, cg, jj }))),
];

// ─── 섹션 정의 ─────────────────────────────────────────────
const SECTIONS = [
  '나는어떤사람인가',
  '일과적성',
  '돈과재물',
  '사람들과어울리는방식',
  '건강과에너지',
  '나의연애코드',
  '소통과갈등방식',
  '나의성장키워드',
] as const;

type Section = typeof SECTIONS[number];

const SECTION_SUBFIELDS: Record<Section, { fields: string[]; focus: string }> = {
  나는어떤사람인가: {
    fields: ['핵심기질', '내면의나', '사회적이미지', '강점', '약점과함정', '나에게힘이되는기운'],
    focus: '이 일주를 가진 사람의 본질적인 기질, 내면, 사회적 모습, 강점과 약점, 그리고 삶에서 힘이 되는 에너지',
  },
  일과적성: {
    fields: ['일하는스타일', '잘맞는분야', '직장vs독립', '커리어조심할것'],
    focus: '어떤 방식으로 일할 때 능률이 오르는지, 잘 맞는 직업과 분야, 조직 vs 독립, 커리어에서 반복되는 패턴',
  },
  돈과재물: {
    fields: ['돈을대하는방식', '재물운흐름', '돈이들어오는패턴', '조심할소비습관'],
    focus: '재물에 대한 태도와 소비 패턴, 전반적인 재물운 특성, 돈 버는 방식, 재물 손실이 생기는 패턴',
  },
  사람들과어울리는방식: {
    fields: ['연애스타일', '결혼과파트너십', '친구와인간관계', '조심할관계패턴'],
    focus: '사랑할 때의 특성, 장기 관계, 대인관계 방식, 반복될 수 있는 관계 문제',
  },
  건강과에너지: {
    fields: ['타고난체질', '조심할부분', '에너지관리법'],
    focus: '타고난 체질과 건강 특성, 주의해야 할 부위, 컨디션 관리법',
  },
  나의연애코드: {
    fields: ['끌리는유형', '연애할때진짜모습', '이별후패턴', '연애에서조심할것'],
    focus: '이성에게 끌리는 유형과 이유, 연애 시작 후 실제 모습과 태도, 이별 후 회복 방식과 반복 패턴, 연애에서 주의해야 할 점',
  },
  소통과갈등방식: {
    fields: ['소통스타일', '갈등상황반응', '상처받는말', '화해하는방식'],
    focus: '평소 대화하는 방식과 습관, 갈등이 생겼을 때 반응 패턴, 어떤 말이나 상황에 상처를 받는지, 관계를 회복하는 방식',
  },
  나의성장키워드: {
    fields: ['인생의테마', '가장빛나는때', '성장을위한조언', '나의인생문장'],
    focus: '이 일주가 평생 반복적으로 마주치는 삶의 테마, 에너지가 가장 빛나는 조건과 시기, 더 나은 삶을 위한 실질적 조언, 이 일주를 한 문장으로 표현',
  },
};

// ─── 프롬프트 빌더 ──────────────────────────────────────────
function buildPrompt(entry: IljuEntry, targetSections: readonly Section[]): string {
  const cg = CHEONGAN_INFO[entry.cg];
  const jj = JIJI_INFO[entry.jj];
  const relation = getCgJjRelation(cg.element, jj.element);

  const sectionSpecs = targetSections.map(s => {
    const spec = SECTION_SUBFIELDS[s];
    const fields = spec.fields.map(f => `    "${f}": "3~5줄"`).join(',\n');
    return `  "${s}": {\n${fields}\n  }`;
  }).join(',\n');

  return `당신은 20년 경력의 명리학 전문가입니다. 아래 일주를 가진 사람의 사주 분석을 작성해주세요.

[일주 정보]
일주: ${entry.ilju} (${cg.hanja}${jj.hanja})
천간 ${entry.cg}(${cg.element}·${cg.yin_yang}·${cg.nature}): ${cg.traits}
지지 ${entry.jj}(${jj.element}·${jj.yin_yang}·${jj.animal}): ${jj.traits}
천간-지지 관계: ${relation}

[작성 원칙]
1. 이 일주의 전통 명리학적 특성에만 근거할 것 (창작·과장 금지)
2. 천간의 특성 + 지지의 특성 + 두 오행의 관계를 종합해서 해석
3. "이 일주를 가진 분은", "당신은" 형태로 2인칭 대화체로 작성
4. 추상적 표현 금지 — 실제 삶 속 구체적 상황과 행동 패턴으로 묘사
5. 강점만 나열하지 말고 약점도 현실적으로, 균형 있게
6. 다른 앱과 차별화: 뻔한 표현("성실하다", "창의적이다") 대신 이 일주만의 고유한 특색을 살릴 것
7. 각 하위 항목은 3~5줄 분량
8. '나에게힘이되는기운' 항목: 전통 명리학 용신 이론 기반으로 좋은 색상·방향·실생활 팁 작성, 마지막에 인연 팁 추가
9. 아래 JSON 형식으로만 응답 (마크다운·설명 없이 순수 JSON)

{
${sectionSpecs}
}`;
}

// ─── 생성 + 저장 ────────────────────────────────────────────
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function generateAndSave(entry: IljuEntry, genAI: GoogleGenerativeAI): Promise<boolean> {
  const cg = CHEONGAN_INFO[entry.cg];
  const jj = JIJI_INFO[entry.jj];

  // 이미 5섹션 모두 있으면 스킵
  const { data: existing } = await supabase
    .from('ilju_analysis')
    .select('section')
    .eq('ilju', entry.ilju);

  const existingSections = new Set((existing ?? []).map((r: any) => r.section));
  const missingSections = SECTIONS.filter(s => !existingSections.has(s));

  if (missingSections.length === 0) {
    process.stdout.write(`⏭  스킵: ${entry.ilju}\n`);
    return true;
  }

  process.stdout.write(`⏳ 생성: ${entry.ilju} (${cg.nature}·${jj.animal}) ... `);

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(buildPrompt(entry, missingSections));
      const text = result.response.text().trim();
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('JSON 없음');

      const parsed = JSON.parse(match[0]);

      // 각 섹션을 개별 행으로 삽입
      for (const section of missingSections) {
        if (!parsed[section]) continue;
        const { error } = await supabase.from('ilju_analysis').upsert({
          ilju: entry.ilju,
          cheongan: entry.cg,
          jiji: entry.jj,
          element: cg.element,
          jiji_element: jj.element,
          section,
          content: parsed[section],
        }, { onConflict: 'ilju,section' });

        if (error) throw error;
      }

      process.stdout.write(`✅\n`);
      return true;
    } catch (e: any) {
      if (attempt === 2) {
        process.stdout.write(`❌ ${e.message}\n`);
        return false;
      }
      await sleep(2000 * (attempt + 1));
    }
  }
  return false;
}

async function seed() {
  console.log(`🌱 일주 분석 DB 시딩 시작 (총 ${ILJU_LIST.length}개 일주 × 5섹션)\n`);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  let success = 0;
  let failed = 0;

  for (const entry of ILJU_LIST) {
    const ok = await generateAndSave(entry, genAI);
    if (ok) success++; else failed++;
    await sleep(2000);
  }

  console.log(`\n🏁 완료 — 성공 ${success} / 실패 ${failed}`);
}

seed().catch(console.error);
