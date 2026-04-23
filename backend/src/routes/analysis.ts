import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateSaju, BirthInfo } from '../saju/calculator';
import { CHEONGAN } from '../data/cheongan';
import { calcYongshin, calcTougan, calcHapChung, calcSeun, getJijangganInfo } from '../saju/analysisData';

const router = Router();

function buildAnalysisPrompt(data: Record<string, any>, gender: string, age: number): string {
  return `당신은 20년 경력의 명리학 전문가이자 심리 상담사입니다. 아래 사주 데이터를 바탕으로 분석을 작성해주세요.

[사주 데이터]
${JSON.stringify(data, null, 2)}
- 성별: ${gender}
- 나이: ${age}세

[작성 원칙]
1. 전문 용어(천간, 지지, 십성 등)는 절대 그대로 쓰지 말고 쉬운 말로 풀어쓸 것
2. "당신은", "이 분은" 같은 2인칭으로 작성
3. 각 항목은 모바일 기준 3~5줄 분량
4. 너무 캐주얼하지 않게, 전문적이되 따뜻하고 공감되게 작성
5. 추상적인 나열이 아닌 실제 삶과 연결되는 구체적인 이야기로
6. 오행·용신 관련 해석은 전통 명리학에서 오랫동안 검증되고 널리 통용되는 내용만 사용할 것 (근거 없는 창작 금지)
6. 반드시 아래 JSON 형식으로만 응답 (마크다운, 설명 없이 순수 JSON만)

{
  "나는어떤사람인가": {
    "핵심기질": "이 사람의 가장 본질적인 기질과 에너지를 3~4줄로",
    "내면의나": "겉으로 잘 드러나지 않는 내면의 모습, 속마음 3~4줄",
    "사회적이미지": "타인의 눈에 비치는 모습, 첫인상과 사회적 페르소나 3줄",
    "강점": "이 사주에서 타고난 핵심 강점 3~4줄",
    "약점과함정": "조심해야 할 성향이나 반복되는 패턴 3줄",
    "나에게힘이되는기운": "전통 명리학에서 널리 통용되고 검증된 오행별 해석을 바탕으로 작성할 것. 용신 오행을 먼저 나열한 뒤, 각 오행마다 ① 좋은 색상 ② 좋은 방향 ③ 실생활 활용 팁(인테리어·소품·자연 소재·악세사리 등)을 구체적으로 작성. 친근하고 따뜻한 말투로, 바로 실천할 수 있는 내용으로 5~7줄 분량. 마지막에는 줄바꿈 후 '💑 인연 팁' 제목으로, 용신 오행을 일간으로 가진 분(예: 목이면 갑·을목 일간)이 곁에 있으면 서로에게 좋은 기운이 된다는 내용을 2~3줄로 자연스럽게 덧붙일 것."
  },
  "일과적성": {
    "일하는스타일": "어떤 방식으로 일할 때 능률이 오르는지 3줄",
    "잘맞는분야": "적성에 맞는 직업군과 그 이유 3~4줄",
    "직장vs독립": "조직 생활과 독립·창업 중 어느 쪽이 맞는지 3줄",
    "커리어조심할것": "직업적으로 반복될 수 있는 문제 패턴 2~3줄"
  },
  "돈과재물": {
    "돈을대하는방식": "재물에 대한 태도와 소비 패턴 3줄",
    "재물운흐름": "전반적인 재물운의 특성과 흐름 3~4줄",
    "돈이들어오는패턴": "어떤 방식으로 돈을 버는 게 맞는지 3줄",
    "조심할소비습관": "재물 손실이 생기는 패턴 2줄"
  },
  "사람들과어울리는방식": {
    "연애스타일": "사랑할 때의 특성과 패턴 3~4줄",
    "결혼과파트너십": "장기적 관계에서의 특성 3줄",
    "친구와인간관계": "대인관계에서의 특성과 강점 3줄",
    "조심할관계패턴": "반복될 수 있는 관계 문제 2~3줄"
  },
  "지금내시기는": {
    "현재대운해석": "현재 대운 기간의 에너지와 흐름 3~4줄",
    "올해흐름": "올해 세운 기반 전체 흐름 3줄",
    "지금해야할것": "이 시기에 집중해야 할 것 2~3줄",
    "지금하지말아야할것": "이 시기에 피해야 할 것 2줄"
  },
  "건강과에너지": {
    "타고난체질": "오행 기반 타고난 체질 특성 3줄",
    "조심할부분": "건강에서 주의해야 할 장기나 부위 2~3줄",
    "에너지관리법": "이 사주에 맞는 컨디션 관리 방법 2~3줄"
  }
}`;
}

router.post('/full', async (req: Request, res: Response) => {
  const { year, month, day, hour, minute, gender, unknownHour } = req.body;

  if (!year || !month || !day || !gender) {
    res.status(400).json({ error: '생년월일과 성별은 필수입니다.' });
    return;
  }

  const birthInfo: BirthInfo = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: unknownHour ? 0 : Number(hour ?? 0),
    minute: unknownHour ? 0 : Number(minute ?? 0),
    gender,
    unknownHour: !!unknownHour,
  };

  try {
    const saju = calculateSaju(birthInfo);
    const ilganEl = CHEONGAN.find(c => c.name === saju.ilgan)?.element ?? '';
    const currentYear = new Date().getFullYear();
    const age = currentYear - Number(year);

    const yongshin = calcYongshin(saju.singangsinyak, ilganEl);
    const tougan = calcTougan(saju);
    const hapchung = calcHapChung(saju);
    const seun = calcSeun(currentYear);
    const jijanggan = getJijangganInfo(saju);

    const currentDaewoon = saju.daewoonList.find(d => age >= d.startAge && age <= d.endAge);

    const analysisData = {
      사주원국: {
        년주: `${saju.yearPillar.cheongan}${saju.yearPillar.jiji} (${saju.yearPillar.element})`,
        월주: `${saju.monthPillar.cheongan}${saju.monthPillar.jiji} (${saju.monthPillar.element})`,
        일주: `${saju.dayPillar.cheongan}${saju.dayPillar.jiji} (${saju.dayPillar.element})`,
        시주: `${saju.hourPillar.cheongan}${saju.hourPillar.jiji} (${saju.hourPillar.element})`,
      },
      일간: `${saju.ilgan} (${ilganEl})`,
      신강신약: saju.singangsinyak,
      오행분포: saju.ohaengCount,
      주요성향: saju.sipseongScores,
      지장간: jijanggan,
      투간: tougan,
      합충관계: hapchung,
      용신: yongshin.yongshin,
      기신: yongshin.gishin,
      현재대운: currentDaewoon
        ? `${currentDaewoon.cheongan}${currentDaewoon.jiji} (${currentDaewoon.element}), ${currentDaewoon.startAge}~${currentDaewoon.endAge}세`
        : '없음',
      올해세운: `${seun.cheongan}${seun.jiji} (${seun.element})`,
    };

    const prompt = buildAnalysisPrompt(analysisData, gender, age);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      res.status(500).json({ error: '분석 생성 실패' });
      return;
    }

    res.json({
      analysis: JSON.parse(jsonMatch[0]),
      meta: {
        singangsinyak: saju.singangsinyak,
        yongshin: yongshin.yongshin,
        currentDaewoon,
        seun,
        hapchung,
      },
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: '분석 중 오류가 발생했습니다.', detail: e?.message });
  }
});

export default router;