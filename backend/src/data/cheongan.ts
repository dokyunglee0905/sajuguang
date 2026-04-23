// 천간 (天干) - 10개
export const CHEONGAN = [
  { index: 0, name: '갑', hanja: '甲', element: '목', yin_yang: '양', english: 'Gab' },
  { index: 1, name: '을', hanja: '乙', element: '목', yin_yang: '음', english: 'Eul' },
  { index: 2, name: '병', hanja: '丙', element: '화', yin_yang: '양', english: 'Byeong' },
  { index: 3, name: '정', hanja: '丁', element: '화', yin_yang: '음', english: 'Jeong' },
  { index: 4, name: '무', hanja: '戊', element: '토', yin_yang: '양', english: 'Mu' },
  { index: 5, name: '기', hanja: '己', element: '토', yin_yang: '음', english: 'Gi' },
  { index: 6, name: '경', hanja: '庚', element: '금', yin_yang: '양', english: 'Gyeong' },
  { index: 7, name: '신', hanja: '辛', element: '금', yin_yang: '음', english: 'Sin' },
  { index: 8, name: '임', hanja: '壬', element: '수', yin_yang: '양', english: 'Im' },
  { index: 9, name: '계', hanja: '癸', element: '수', yin_yang: '음', english: 'Gye' },
] as const;

export type CheongganName = typeof CHEONGAN[number]['name'];
export type Element = '목' | '화' | '토' | '금' | '수';
export type YinYang = '음' | '양';
