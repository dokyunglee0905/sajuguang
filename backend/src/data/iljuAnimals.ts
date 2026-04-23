// 일주(日柱) 60갑자 동물 캐릭터 매핑
// 일간+일지 조합으로 캐릭터 표현 (일반인 친화적)

export const ILJU_ANIMALS: Record<string, { animal: string; nickname: string; personality: string; strength: string; desc: string }> = {
  // 갑(목·양) 일간
  갑자: { animal: '🐋', nickname: '푸른 고래', personality: '깊고 넓은 사고', strength: '지혜와 포용력', desc: '물 위를 자유롭게 유영하는 고래처럼, 깊은 통찰력과 넓은 마음을 가졌어요' },
  갑인: { animal: '🦁', nickname: '숲의 사자', personality: '당당한 리더십', strength: '카리스마와 추진력', desc: '숲의 왕처럼 당당하고 리더십이 넘쳐요' },
  갑진: { animal: '🐉', nickname: '청룡', personality: '강한 기상과 창의력', strength: '도전정신과 창의성', desc: '하늘을 나는 청룡처럼 큰 뜻을 품고 있어요' },
  갑오: { animal: '🦌', nickname: '봄 사슴', personality: '활발하고 자유로운 영혼', strength: '직관력과 민첩함', desc: '봄 들판을 뛰노는 사슴처럼 자유롭고 활기차요' },
  갑신: { animal: '🐒', nickname: '영리한 원숭이', personality: '영리함과 재치', strength: '빠른 판단력', desc: '나무 사이를 날쌔게 누비는 원숭이처럼 영리하고 재치있어요' },
  갑술: { animal: '🦮', nickname: '믿음직한 사냥개', personality: '의리와 신뢰', strength: '충성심과 용기', desc: '믿음직한 사냥개처럼 의리 있고 한번 결심하면 끝까지 가요' },

  // 을(목·음) 일간
  을축: { animal: '🌸', nickname: '봄꽃 고양이', personality: '섬세하고 감성적', strength: '예술적 감각', desc: '봄꽃처럼 부드럽고 아름다운 감성을 지녔어요' },
  을묘: { animal: '🐰', nickname: '흰 토끼', personality: '온화하고 평화로운', strength: '친화력과 섬세함', desc: '흰 토끼처럼 순하고 친화력이 좋아 주변에 사람이 모여요' },
  을사: { animal: '🦋', nickname: '나비', personality: '변화와 적응력', strength: '유연성과 매력', desc: '나비처럼 어디든 아름답게 적응하고 변화를 두려워하지 않아요' },
  을미: { animal: '🐑', nickname: '양', personality: '온화하고 예술적', strength: '창의력과 공감능력', desc: '양처럼 부드럽고 온화하지만 깊은 내면의 예술성이 있어요' },
  을유: { animal: '🦢', nickname: '백조', personality: '우아하고 기품 있는', strength: '완벽주의와 심미안', desc: '백조처럼 우아하고 기품 있으며 완벽을 추구해요' },
  을해: { animal: '🐬', nickname: '돌고래', personality: '영리하고 사교적', strength: '소통능력과 지혜', desc: '돌고래처럼 밝고 영리하며 어디서든 사랑받아요' },

  // 병(화·양) 일간
  병자: { animal: '🦅', nickname: '불꽃 독수리', personality: '강한 의지와 열정', strength: '리더십과 추진력', desc: '독수리처럼 높이 날며 큰 목표를 향해 돌진해요' },
  병인: { animal: '🐯', nickname: '불호랑이', personality: '용맹하고 열정적', strength: '강인함과 결단력', desc: '불타는 호랑이처럼 강렬하고 용맹한 에너지를 가졌어요' },
  병진: { animal: '🔥', nickname: '불룡', personality: '카리스마와 화려함', strength: '창의력과 열정', desc: '불을 품은 용처럼 강렬하고 화려한 존재감이 있어요' },
  병오: { animal: '☀️', nickname: '태양마', personality: '밝고 에너지 넘치는', strength: '영향력과 열정', desc: '태양처럼 주변을 밝히고 에너지를 나눠주는 존재예요' },
  병신: { animal: '🦊', nickname: '불여우', personality: '영리하고 화려한', strength: '매력과 지략', desc: '불여우처럼 영리하고 매력적이며 상황 판단이 빨라요' },
  병술: { animal: '🦁', nickname: '불사자', personality: '강렬하고 당당한', strength: '카리스마와 용기', desc: '불타는 사자처럼 강렬한 카리스마로 무리를 이끌어요' },

  // 정(화·음) 일간
  정축: { animal: '🕯️', nickname: '촛불 소', personality: '따뜻하고 헌신적', strength: '인내력과 배려심', desc: '촛불처럼 묵묵히 주변을 밝히며 따뜻한 마음으로 살아가요' },
  정묘: { animal: '🦝', nickname: '불꽃 너구리', personality: '영리하고 적응력 강한', strength: '관찰력과 재치', desc: '영리한 너구리처럼 어떤 상황도 재치있게 헤쳐나가요' },
  정사: { animal: '🐍', nickname: '불뱀', personality: '직관력과 신비로움', strength: '통찰력과 신중함', desc: '불뱀처럼 신비롭고 깊은 직관력으로 본질을 꿰뚫어요' },
  정미: { animal: '🐏', nickname: '불양', personality: '따뜻하고 예술적', strength: '감수성과 표현력', desc: '따뜻한 양처럼 예술적 감수성이 풍부하고 배려심이 깊어요' },
  정유: { animal: '🦜', nickname: '불새', personality: '표현력과 재능', strength: '화려함과 소통능력', desc: '불새처럼 화려하고 재능이 넘치며 표현력이 탁월해요' },
  정해: { animal: '🐠', nickname: '불빛 물고기', personality: '감성적이고 신비로운', strength: '공감능력과 직관', desc: '물속의 불빛처럼 신비롭고 깊은 감성으로 사람의 마음을 읽어요' },

  // 무(토·양) 일간
  무자: { animal: '🐻', nickname: '산곰', personality: '듬직하고 포용력 있는', strength: '안정감과 신뢰감', desc: '산처럼 듬직한 곰처럼 믿음직하고 포용력이 넘쳐요' },
  무인: { animal: '🦬', nickname: '황소', personality: '강인하고 성실한', strength: '지구력과 책임감', desc: '황소처럼 묵묵히 앞으로 나아가는 강인한 성실함이 있어요' },
  무진: { animal: '🗻', nickname: '산용', personality: '웅장하고 신뢰 있는', strength: '포용력과 안정감', desc: '산처럼 웅장하고 넉넉한 포용력으로 주변을 감싸요' },
  무오: { animal: '🐎', nickname: '황금마', personality: '활발하고 열정적', strength: '추진력과 활동성', desc: '황금빛 말처럼 활발하고 목표를 향해 힘차게 달려가요' },
  무신: { animal: '🐘', nickname: '지혜로운 코끼리', personality: '지혜롭고 신중한', strength: '기억력과 신뢰', desc: '코끼리처럼 지혜롭고 신중하며 한번 맺은 인연을 소중히 해요' },
  무술: { animal: '🦴', nickname: '충직한 개', personality: '의리있고 헌신적', strength: '충성심과 보호본능', desc: '충직한 개처럼 의리가 있고 소중한 사람을 끝까지 지켜요' },

  // 기(토·음) 일간
  기축: { animal: '🐄', nickname: '젖소', personality: '풍요롭고 헌신적', strength: '베풂과 안정', desc: '젖소처럼 넉넉하게 베풀고 주변에 안정감을 줘요' },
  기묘: { animal: '🐇', nickname: '숲속 토끼', personality: '온화하고 실속 있는', strength: '친화력과 현실감각', desc: '숲속 토끼처럼 온화하면서도 실속 있게 살아가요' },
  기사: { animal: '🐢', nickname: '거북이', personality: '신중하고 꾸준한', strength: '인내력과 장기 안목', desc: '거북이처럼 느리지만 꾸준하게 목표를 향해 나아가요' },
  기미: { animal: '🌾', nickname: '황금 양', personality: '풍요롭고 온화한', strength: '관대함과 현실감각', desc: '황금빛 양처럼 풍요롭고 관대한 마음을 지녔어요' },
  기유: { animal: '🐓', nickname: '황금닭', personality: '성실하고 꼼꼼한', strength: '성실함과 분석력', desc: '황금닭처럼 부지런하고 꼼꼼하게 매사에 임해요' },
  기해: { animal: '🐖', nickname: '복돼지', personality: '복스럽고 넉넉한', strength: '풍요와 친화력', desc: '복돼지처럼 풍요로운 기운을 타고나 주변에 복을 가져다줘요' },

  // 경(금·양) 일간
  경자: { animal: '⚔️', nickname: '백호', personality: '결단력과 정의감', strength: '날카로운 판단력', desc: '백호처럼 날카롭고 결단력이 있으며 정의를 중요시해요' },
  경인: { animal: '🐅', nickname: '백호랑이', personality: '강인하고 결단력 있는', strength: '리더십과 정의감', desc: '백호처럼 강인하고 용맹하며 불의를 참지 못해요' },
  경진: { animal: '🦷', nickname: '강철용', personality: '강인하고 카리스마 있는', strength: '추진력과 결단력', desc: '강철처럼 단단하고 용처럼 웅장한 기상을 지녔어요' },
  경오: { animal: '🐴', nickname: '백마', personality: '자유롭고 강인한', strength: '독립심과 추진력', desc: '백마처럼 자유롭고 강인하게 자신만의 길을 달려가요' },
  경신: { animal: '🦍', nickname: '강철 원숭이', personality: '영리하고 결단력 있는', strength: '분석력과 실행력', desc: '강철처럼 단단한 의지와 원숭이의 영리함을 동시에 갖췄어요' },
  경술: { animal: '🐕', nickname: '백견', personality: '의리있고 날카로운', strength: '정의감과 보호본능', desc: '흰 개처럼 의리가 강하고 날카로운 정의감을 지녔어요' },

  // 신(금·음) 일간
  신축: { animal: '💍', nickname: '보석소', personality: '섬세하고 완벽을 추구하는', strength: '완벽주의와 심미안', desc: '보석처럼 빛나는 감각으로 아름다움을 추구해요' },
  신묘: { animal: '🐇', nickname: '은토끼', personality: '섬세하고 직관적인', strength: '예민한 감각과 직관', desc: '은빛 토끼처럼 섬세하고 예민한 감각으로 세상을 읽어요' },
  신사: { animal: '🐍', nickname: '은뱀', personality: '신중하고 날카로운', strength: '통찰력과 계획성', desc: '은뱀처럼 신중하고 날카로운 통찰력으로 상황을 꿰뚫어요' },
  신미: { animal: '🦙', nickname: '알파카', personality: '온화하고 섬세한', strength: '섬세함과 배려심', desc: '알파카처럼 부드럽고 온화하지만 내면엔 단단한 심지가 있어요' },
  신유: { animal: '🐦', nickname: '은빛 새', personality: '우아하고 예술적인', strength: '심미안과 표현력', desc: '은빛 새처럼 우아하고 예술적 감각이 뛰어나요' },
  신해: { animal: '🐟', nickname: '은빛 물고기', personality: '유연하고 섬세한', strength: '적응력과 감수성', desc: '은빛 물고기처럼 유연하고 섬세하게 흐름을 타요' },

  // 임(수·양) 일간
  임자: { animal: '🐋', nickname: '대양 고래', personality: '깊은 지혜와 포용력', strength: '통찰력과 리더십', desc: '대양을 누비는 고래처럼 깊은 지혜와 광활한 포용력을 지녔어요' },
  임인: { animal: '🐆', nickname: '물표범', personality: '민첩하고 독립적인', strength: '독립심과 직관력', desc: '표범처럼 날쌔고 독립적으로 자신만의 길을 개척해요' },
  임진: { animal: '🌊', nickname: '파도용', personality: '역동적이고 창의적인', strength: '창의력과 변화 적응력', desc: '파도처럼 역동적이고 변화를 두려워하지 않아요' },
  임오: { animal: '🏊', nickname: '물마', personality: '열정적이고 활동적인', strength: '에너지와 표현력', desc: '물 위를 달리는 말처럼 열정적이고 에너지가 넘쳐요' },
  임신: { animal: '🐬', nickname: '영리한 돌고래', personality: '영리하고 사교적인', strength: '지혜와 소통능력', desc: '돌고래처럼 영리하고 사교적이며 어디서든 빛을 발해요' },
  임술: { animal: '🦦', nickname: '수달', personality: '유쾌하고 적응력 있는', strength: '유연성과 친화력', desc: '수달처럼 물과 육지를 자유롭게 오가며 어디든 잘 적응해요' },

  // 계(수·음) 일간
  계축: { animal: '🐧', nickname: '물소', personality: '끈기있고 차분한', strength: '인내력과 신중함', desc: '펭귄처럼 어떤 추위도 이겨내는 끈기와 차분함을 지녔어요' },
  계묘: { animal: '🐰', nickname: '물토끼', personality: '감성적이고 온화한', strength: '공감능력과 직관', desc: '물토끼처럼 감성적이고 온화하며 공감능력이 뛰어나요' },
  계사: { animal: '🐊', nickname: '물뱀', personality: '신중하고 꿰뚫는 통찰력', strength: '직관과 전략적 사고', desc: '물 속 악어처럼 조용하지만 날카로운 통찰력을 숨기고 있어요' },
  계미: { animal: '🦭', nickname: '물범', personality: '유연하고 사교적인', strength: '친화력과 적응력', desc: '물범처럼 유연하고 사교적이며 어디서든 사랑받아요' },
  계유: { animal: '🦩', nickname: '물새', personality: '우아하고 섬세한', strength: '세련됨과 감수성', desc: '물새처럼 우아하고 섬세하며 아름다운 감성을 지녔어요' },
  계해: { animal: '🐙', nickname: '문어', personality: '다재다능하고 신비로운', strength: '다양한 재능과 적응력', desc: '문어처럼 여러 방면에 재능이 있고 신비로운 매력을 지녔어요' },
};
