// 합·충·형·파·해 관계 (사주관계)

// 천간합 (天干合)
export const CHEONGAN_HAP: Record<string, { partner: string; result_element: string; desc: string }> = {
  갑: { partner: '기', result_element: '토', desc: '갑기합토 - 서로를 완성시켜주는 안정적 결합' },
  을: { partner: '경', result_element: '금', desc: '을경합금 - 부드러움과 강함이 만나는 결합' },
  병: { partner: '신', result_element: '수', desc: '병신합수 - 열정과 냉철함이 균형을 이루는 결합' },
  정: { partner: '임', result_element: '목', desc: '정임합목 - 감성과 이성이 만나는 결합' },
  무: { partner: '계', result_element: '화', desc: '무계합화 - 안정과 지혜가 만나는 결합' },
};

// 천간충 (天干沖)
export const CHEONGAN_CHUNG: Record<string, { partner: string; desc: string }> = {
  갑: { partner: '경', desc: '갑경충 - 강한 의지끼리 충돌, 변화와 도전의 에너지' },
  을: { partner: '신', desc: '을신충 - 유연함과 날카로움의 마찰' },
  병: { partner: '임', desc: '병임충 - 열정과 냉정의 충돌' },
  정: { partner: '계', desc: '정계충 - 감성과 이성의 대립' },
};

// 지지 삼합 (三合)
export const JIJI_SAMHAP: Array<{ group: string[]; result_element: string; desc: string }> = [
  { group: ['인', '오', '술'], result_element: '화', desc: '인오술 삼합 - 화(火)의 기운이 강해지는 강력한 결합' },
  { group: ['사', '유', '축'], result_element: '금', desc: '사유축 삼합 - 금(金)의 기운이 강해지는 강력한 결합' },
  { group: ['신', '자', '진'], result_element: '수', desc: '신자진 삼합 - 수(水)의 기운이 강해지는 강력한 결합' },
  { group: ['해', '묘', '미'], result_element: '목', desc: '해묘미 삼합 - 목(木)의 기운이 강해지는 강력한 결합' },
];

// 지지 육합 (六合)
export const JIJI_YUKHAP: Record<string, { partner: string; result_element: string; desc: string }> = {
  자: { partner: '축', result_element: '토', desc: '자축합토 - 차분하고 안정적인 결합' },
  인: { partner: '해', result_element: '목', desc: '인해합목 - 성장과 시작의 에너지가 모이는 결합' },
  묘: { partner: '술', result_element: '화', desc: '묘술합화 - 따뜻하고 활발한 결합' },
  진: { partner: '유', result_element: '금', desc: '진유합금 - 안정적이고 결실을 맺는 결합' },
  사: { partner: '신', result_element: '수', desc: '사신합수 - 지혜와 활력이 모이는 결합' },
  오: { partner: '미', result_element: '토', desc: '오미합토 - 따뜻하고 풍요로운 결합' },
};

// 지지 육충 (六沖)
export const JIJI_YUKCHUNG: Record<string, { partner: string; desc: string }> = {
  자: { partner: '오', desc: '자오충 - 물과 불의 충돌, 강한 변화의 에너지' },
  축: { partner: '미', desc: '축미충 - 두 토(土)의 충돌, 안정이 흔들림' },
  인: { partner: '신', desc: '인신충 - 시작과 결실의 충돌, 의견 대립' },
  묘: { partner: '유', desc: '묘유충 - 부드러움과 날카로움의 마찰' },
  진: { partner: '술', desc: '진술충 - 두 토(土)의 충돌, 주도권 다툼' },
  사: { partner: '해', desc: '사해충 - 열정과 지혜의 충돌, 방향성 갈등' },
};
