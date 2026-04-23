import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSajuStore } from '../store/useSajuStore';
import { SIPSEONG_HANJA, SIPSEONG_CONTENT, SINGANGSINYAK_INFO, OHAENG_BRIEF } from '../data/sipseongContent';

const EL_COLORS: Record<string, string> = {
  목: '#4ade80', 화: '#f97316', 토: '#fbbf24', 금: '#94a3b8', 수: '#60a5fa',
};

const ANIMAL_EMOJI: Record<string, string> = {
  쥐: '🐭', 소: '🐮', 호랑이: '🐯', 토끼: '🐰', 용: '🐲', 뱀: '🐍',
  말: '🐴', 양: '🐑', 원숭이: '🐵', 닭: '🐔', 개: '🐶', 돼지: '🐷',
};

export default function HomePage() {
  const navigate = useNavigate();
  const { birthInfo, sajuResult } = useSajuStore();

  useEffect(() => {
    if (!birthInfo || !sajuResult) navigate('/');
  }, [birthInfo, sajuResult, navigate]);

  if (!birthInfo || !sajuResult) return null;

  const { pillars, mainOhaeng, animal, ohaengCount, topSipseong, singangsinyak } = sajuResult;
  const elColor = EL_COLORS[mainOhaeng.element] ?? '#fff';
  const ohaengOrder = ['목', '화', '토', '금', '수'];
  const totalOhaeng = Object.values(ohaengCount).reduce((a, b) => a + b, 0);

  const pillarList = [
    { label: '년주', pillar: pillars.year },
    { label: '월주', pillar: pillars.month },
    { label: '일주', pillar: pillars.day },
    { label: '시주', pillar: pillars.hour },
  ];

  return (
    <div className="page page-scroll">
      {/* 탑바 */}
      <div className="top-bar">
        <span className="top-bar__title">사주광</span>
        <button className="top-bar__btn" onClick={() => navigate('/')}>다시 입력</button>
      </div>

      <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* 인사 카드 */}
        <div style={{ padding: '16px 0 8px' }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
            {birthInfo.name ? `${birthInfo.name}님의 사주` : '나의 사주'}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
            {birthInfo.year}.{String(birthInfo.month).padStart(2, '0')}.{String(birthInfo.day).padStart(2, '0')}
            {!birthInfo.unknownHour && ` ${String(birthInfo.hour).padStart(2, '0')}:${String(birthInfo.minute).padStart(2, '0')}`}
            {birthInfo.unknownHour && ' (시간 미입력)'}
            {' · '}{birthInfo.gender === '남' ? '남성' : '여성'}
          </p>
        </div>

        {/* 메인 오행 + 일주 동물 */}
        <div className={`card el-bg-${mainOhaeng.element}`}>
          <div className="card__title">나의 기운</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ fontSize: 40 }}>{mainOhaeng.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: elColor }}>{mainOhaeng.element}({mainOhaeng.nature})</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>· {ANIMAL_EMOJI[animal] ?? ''} {animal}</span>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, margin: 0 }}>
                {mainOhaeng.personality} 기질을 가졌어요.
                {animal && ` ${animal}의 해에 태어나 ${getAnimalDesc(animal)}`}
              </p>
            </div>
          </div>
        </div>

        {/* 타고난 성향 */}
        <div className="card">
          <div className="card__title">타고난 성향</div>
          {topSipseong.map((s, i) => (
            <div key={s.name} className="sipseong-card">
              <div className="sipseong-card__header">
                <div className="sipseong-card__rank">{i + 1}</div>
                <span className="sipseong-card__name">{s.name}</span>
                <span className="sipseong-card__hanja">{SIPSEONG_HANJA[s.name] ?? ''}</span>
              </div>
              <p className="sipseong-card__desc">
                {SIPSEONG_CONTENT[s.name]?.desc ?? s.short}
              </p>
              {SIPSEONG_CONTENT[s.name]?.env && (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                  <span style={{ color: '#a78bfa', fontWeight: 700, flexShrink: 0 }}>✦ 잘 맞는 환경</span>
                  <span>{SIPSEONG_CONTENT[s.name].env}</span>
                </div>
              )}
              <div className="sipseong-card__details">
                <div className="detail-box">
                  <div className="detail-box__label">강점</div>
                  <div className="detail-box__val">{s.strength}</div>
                </div>
                <div className="detail-box">
                  <div className="detail-box__label">약점</div>
                  <div className="detail-box__val">{s.weakness}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 사주 원국 */}
        <div className="card">
          <div className="card__title">사주 원국</div>
          <div className="pillars-grid">
            {pillarList.map(({ label, pillar }) => (
              <div key={label} className="pillar-card">
                <div className="pillar-card__label">{label}</div>
                <div className="pillar-card__char">{pillar.cheongan}</div>
                <div className={`pillar-card__el el-${pillar.element}`}>{pillar.element}</div>
                <div className="pillar-card__divider" />
                <div className="pillar-card__char">{pillar.jiji}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>신강신약</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#a78bfa' }}>{singangsinyak}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{SINGANGSINYAK_INFO[singangsinyak]?.tag}</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: 0 }}>
              {SINGANGSINYAK_INFO[singangsinyak]?.desc}
            </p>
          </div>
          {!birthInfo.unknownHour && (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '10px 0 0', textAlign: 'right' }}>
              ✦ 태양시 보정 적용 (-32분)
            </p>
          )}
        </div>

        {/* 오행 분포 */}
        <div className="card">
          <div className="card__title">오행 분포</div>
          {ohaengOrder.map(el => {
            const count = ohaengCount[el] ?? 0;
            const pct = totalOhaeng > 0 ? (count / totalOhaeng) * 100 : 0;
            return (
              <div key={el} className="ohaeng-bar-row">
                <span className={`ohaeng-bar-row__label el-${el}`}>{el}</span>
                <div className="ohaeng-bar-row__bg">
                  <div className="ohaeng-bar-row__fill" style={{ width: `${pct}%`, background: EL_COLORS[el] }} />
                </div>
                <span className="ohaeng-bar-row__count">{count}</span>
              </div>
            );
          })}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {ohaengOrder.map(el => (
              <span key={el} style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
                <span className={`el-${el}`} style={{ fontWeight: 700 }}>{el}</span>
                {' '}· {OHAENG_BRIEF[el]?.replace(/^.+ — /, '')}
              </span>
            ))}
          </div>
        </div>

        {/* 사주분석 바로가기 */}
        <button className="btn-primary" style={{ marginTop: 6 }} onClick={() => navigate('/analysis')}>
          상세 사주분석 보기
        </button>
      </div>
    </div>
  );
}

function getAnimalDesc(animal: string): string {
  const map: Record<string, string> = {
    쥐: '눈치가 빠르고 영리하며 적응력이 뛰어납니다.',
    소: '묵묵하고 성실하며 한 번 믿은 사람에게 끝까지 신뢰를 지킵니다.',
    호랑이: '대담하고 카리스마가 강하며 리더십이 있습니다.',
    토끼: '섬세하고 감수성이 풍부하며 주변을 편안하게 만드는 능력이 있습니다.',
    용: '야망이 크고 도전을 즐기며 강한 존재감을 발휘합니다.',
    뱀: '직관이 날카롭고 지혜로우며 신중하게 행동합니다.',
    말: '활동적이고 자유롭게 살기를 원하며 추진력이 강합니다.',
    양: '온화하고 예술적 감각이 뛰어나며 배려심이 깊습니다.',
    원숭이: '재치 있고 영리하며 빠른 판단력을 가졌습니다.',
    닭: '꼼꼼하고 분석적이며 완벽을 추구하는 성향이 있습니다.',
    개: '충직하고 정의감이 강하며 신뢰받는 사람으로 기억됩니다.',
    돼지: '낙천적이고 넉넉한 마음을 가졌으며 복이 따르는 타입입니다.',
  };
  return map[animal] ?? '';
}
