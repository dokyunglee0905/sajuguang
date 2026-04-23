// 지지 (地支) - 12개
export const JIJI = [
  { index: 0,  name: '자', hanja: '子', element: '수', yin_yang: '양', animal: '쥐',  month: 11, hour_start: 23, hour_end: 1  },
  { index: 1,  name: '축', hanja: '丑', element: '토', yin_yang: '음', animal: '소',  month: 12, hour_start: 1,  hour_end: 3  },
  { index: 2,  name: '인', hanja: '寅', element: '목', yin_yang: '양', animal: '호랑이', month: 1, hour_start: 3, hour_end: 5 },
  { index: 3,  name: '묘', hanja: '卯', element: '목', yin_yang: '음', animal: '토끼', month: 2, hour_start: 5,  hour_end: 7  },
  { index: 4,  name: '진', hanja: '辰', element: '토', yin_yang: '양', animal: '용',  month: 3, hour_start: 7,  hour_end: 9  },
  { index: 5,  name: '사', hanja: '巳', element: '화', yin_yang: '음', animal: '뱀',  month: 4, hour_start: 9,  hour_end: 11 },
  { index: 6,  name: '오', hanja: '午', element: '화', yin_yang: '양', animal: '말',  month: 5, hour_start: 11, hour_end: 13 },
  { index: 7,  name: '미', hanja: '未', element: '토', yin_yang: '음', animal: '양',  month: 6, hour_start: 13, hour_end: 15 },
  { index: 8,  name: '신', hanja: '申', element: '금', yin_yang: '양', animal: '원숭이', month: 7, hour_start: 15, hour_end: 17 },
  { index: 9,  name: '유', hanja: '酉', element: '금', yin_yang: '음', animal: '닭',  month: 8, hour_start: 17, hour_end: 19 },
  { index: 10, name: '술', hanja: '戌', element: '토', yin_yang: '양', animal: '개',  month: 9, hour_start: 19, hour_end: 21 },
  { index: 11, name: '해', hanja: '亥', element: '수', yin_yang: '음', animal: '돼지', month: 10, hour_start: 21, hour_end: 23 },
] as const;

// 지지 지장간 (地藏干) - 지지 속에 숨어있는 천간
export const JIJANGGAN: Record<string, { main: string; middle?: string; residual?: string }> = {
  자: { main: '계' },
  축: { main: '기', middle: '계', residual: '신' },
  인: { main: '갑', middle: '병', residual: '무' },
  묘: { main: '을' },
  진: { main: '무', middle: '을', residual: '계' },
  사: { main: '병', middle: '경', residual: '무' },
  오: { main: '정', middle: '기' },
  미: { main: '기', middle: '정', residual: '을' },
  신: { main: '경', middle: '임', residual: '무' },
  유: { main: '신' },
  술: { main: '무', middle: '신', residual: '정' },
  해: { main: '임', middle: '갑' },
};

export type JijiName = typeof JIJI[number]['name'];
