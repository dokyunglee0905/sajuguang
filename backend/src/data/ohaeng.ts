// 오행 (五行) 상생·상극 관계
export const OHAENG_SANGSAENG: Record<string, string> = {
  목: '화', // 목생화 - 나무가 불을 만들어냄
  화: '토', // 화생토 - 불이 타고나면 흙(재)이 됨
  토: '금', // 토생금 - 흙 속에서 금이 생겨남
  금: '수', // 금생수 - 금속에서 물이 맺힘
  수: '목', // 수생목 - 물이 나무를 키움
};

export const OHAENG_SANGGEUK: Record<string, string> = {
  목: '토', // 목극토 - 나무뿌리가 흙을 파고듦
  화: '금', // 화극금 - 불이 금속을 녹임
  토: '수', // 토극수 - 흙이 물을 막음
  금: '목', // 금극목 - 금속(도끼)이 나무를 벰
  수: '화', // 수극화 - 물이 불을 끔
};

// 오행 비유 설명 (일반인용)
export const OHAENG_DESC: Record<string, { icon: string; nature: string; personality: string; sangsaeng_desc: string; sanggeuk_desc: string }> = {
  목: {
    icon: '🌳',
    nature: '나무',
    personality: '성장, 창의, 인자함, 추진력',
    sangsaeng_desc: '나무가 불을 만나 활활 타오르듯 서로를 빛나게 해줍니다',
    sanggeuk_desc: '나무뿌리가 흙을 파고들듯 서로 부딪힐 수 있습니다',
  },
  화: {
    icon: '🔥',
    nature: '불',
    personality: '열정, 표현력, 예의, 명예',
    sangsaeng_desc: '불이 흙을 따뜻하게 데우듯 서로에게 온기를 줍니다',
    sanggeuk_desc: '불이 금속을 녹이듯 한쪽이 다른 쪽을 압도할 수 있습니다',
  },
  토: {
    icon: '🌍',
    nature: '흙',
    personality: '안정, 신뢰, 포용, 중재',
    sangsaeng_desc: '흙 속에서 금이 자라나듯 서로의 가능성을 끌어냅니다',
    sanggeuk_desc: '흙이 물길을 막듯 서로의 흐름을 방해할 수 있습니다',
  },
  금: {
    icon: '💎',
    nature: '금',
    personality: '결단력, 의리, 정의, 냉철함',
    sangsaeng_desc: '금속 표면에 물이 맺히듯 서로가 자연스럽게 어울립니다',
    sanggeuk_desc: '도끼가 나무를 베듯 날카로운 충돌이 생길 수 있습니다',
  },
  수: {
    icon: '💧',
    nature: '물',
    personality: '지혜, 유연함, 포용, 깊이',
    sangsaeng_desc: '물이 나무를 키우듯 서로를 성장하게 도와줍니다',
    sanggeuk_desc: '물이 불을 끄듯 서로의 열정을 식힐 수 있습니다',
  },
};
