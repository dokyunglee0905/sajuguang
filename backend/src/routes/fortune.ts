import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateSaju, BirthInfo } from '../saju/calculator';
import { CHEONGAN } from '../data/cheongan';

const router = Router();

function getTodayStr() {
  const now = new Date();
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
}

function buildPrompt(saju: ReturnType<typeof calculateSaju>, today: string, gender: string): string {
  const ilganEl = CHEONGAN.find(c => c.name === saju.ilgan)?.element ?? '';
  const pillars = `년주 ${saju.yearPillar.cheongan}${saju.yearPillar.jiji}, 월주 ${saju.monthPillar.cheongan}${saju.monthPillar.jiji}, 일주 ${saju.dayPillar.cheongan}${saju.dayPillar.jiji}, 시주 ${saju.hourPillar.cheongan}${saju.hourPillar.jiji}`;

  return `당신은 명리학 전문가입니다. 아래 사주 정보를 바탕으로 오늘의 운세를 작성해주세요.

[사주 정보]
- 사주: ${pillars}
- 일간: ${saju.ilgan}(${ilganEl})
- 신강신약: ${saju.singangsinyak}
- 성별: ${gender}
- 오늘 날짜: ${today}

[작성 규칙]
1. 전문 용어(천간, 지지, 십성 등)는 반드시 쉬운 말로 풀어서 설명할 것
2. 너무 캐주얼하지 않게, 전문적이되 이해하기 쉽게 작성
3. 각 카테고리는 모바일 기준 2~3줄 분량
4. 반드시 아래 JSON 형식으로만 응답 (다른 텍스트 없이)

{
  "종합운": "오늘 하루 전체 흐름 (4~5줄)",
  "애정운": "연애·관계 운세 (2~3줄)",
  "금전운": "재물·금전 운세 (2~3줄)",
  "직업학업운": "직업·커리어·학업 운세 (2~3줄)",
  "건강운": "건강·컨디션 운세 (2~3줄)",
  "오늘의한마디": "오늘을 한 문장으로 (1줄)"
}`;
}

router.post('/today', async (req: Request, res: Response) => {
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
    const today = getTodayStr();
    const prompt = buildPrompt(saju, today, gender);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      res.status(500).json({ error: '운세 생성 실패' });
      return;
    }

    const fortune = JSON.parse(jsonMatch[0]);
    res.json({ date: today, fortune });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '운세 생성 중 오류가 발생했습니다.' });
  }
});

export default router;