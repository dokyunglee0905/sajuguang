import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSajuStore } from '../store/useSajuStore';
import { getFullAnalysis } from '../api/analysis';
import type { FullAnalysis, FullAnalysisResponse } from '../api/analysis';


const SECTIONS = [
  { key: '나는어떤사람인가' as const, label: '나는 어떤 사람인가', icon: '🪞' },
  { key: '일과적성' as const,         label: '일과 적성',         icon: '💼' },
  { key: '돈과재물' as const,          label: '돈과 재물',         icon: '💰' },
  { key: '사람들과어울리는방식' as const, label: '사람들과 어울리는 방식', icon: '🤝' },
  { key: '지금내시기는' as const,      label: '지금 내 시기는',    icon: '⏳' },
  { key: '건강과에너지' as const,      label: '건강과 에너지',     icon: '🍀' },
];

const SECTION_ITEMS: Record<keyof FullAnalysis, { key: string; label: string }[]> = {
  나는어떤사람인가: [
    { key: '핵심기질',       label: '핵심 기질' },
    { key: '내면의나',       label: '내면의 나' },
    { key: '사회적이미지',   label: '사회적 이미지' },
    { key: '강점',           label: '강점' },
    { key: '약점과함정',     label: '약점과 함정' },
    { key: '나에게힘이되는기운', label: '나에게 힘이 되는 기운' },
  ],
  일과적성: [
    { key: '일하는스타일',   label: '일하는 스타일' },
    { key: '잘맞는분야',     label: '잘 맞는 분야' },
    { key: '직장vs독립',     label: '직장 vs 독립·창업' },
    { key: '커리어조심할것', label: '커리어에서 조심할 것' },
  ],
  돈과재물: [
    { key: '돈을대하는방식',     label: '돈을 대하는 방식' },
    { key: '재물운흐름',         label: '재물운 흐름' },
    { key: '돈이들어오는패턴',   label: '돈이 들어오는 패턴' },
    { key: '조심할소비습관',     label: '조심할 소비 습관' },
  ],
  사람들과어울리는방식: [
    { key: '연애스타일',     label: '연애 스타일' },
    { key: '결혼과파트너십', label: '결혼과 파트너십' },
    { key: '친구와인간관계', label: '친구와 인간관계' },
    { key: '조심할관계패턴', label: '조심할 관계 패턴' },
  ],
  지금내시기는: [
    { key: '현재대운해석',       label: '현재 대운 흐름' },
    { key: '올해흐름',           label: '올해 흐름' },
    { key: '지금해야할것',       label: '지금 해야 할 것' },
    { key: '지금하지말아야할것', label: '지금 하지 말아야 할 것' },
  ],
  건강과에너지: [
    { key: '타고난체질',   label: '타고난 체질' },
    { key: '조심할부분',   label: '조심할 부분' },
    { key: '에너지관리법', label: '에너지 관리법' },
  ],
};

const CACHE_KEY = 'sajuguang_analysis';

function getCached(birthKey: string) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (cached.birthKey === birthKey) return cached.data as FullAnalysisResponse;
  } catch { /* empty */ }
  return null;
}

function setCache(birthKey: string, data: FullAnalysisResponse) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ birthKey, data }));
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { birthInfo } = useSajuStore();
  const [result, setResult] = useState<FullAnalysisResponse | null>(null);
  const [activeSection, setActiveSection] = useState<keyof FullAnalysis>('나는어떤사람인가');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const birthKey = birthInfo
    ? `${birthInfo.year}-${birthInfo.month}-${birthInfo.day}-${birthInfo.hour}-${birthInfo.gender}`
    : '';

  useEffect(() => {
    if (!birthInfo) { navigate('/'); return; }
    const cached = getCached(birthKey);
    if (cached) { setResult(cached); return; }
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    if (!birthInfo) return;
    setLoading(true);
    setError('');
    try {
      const data = await getFullAnalysis(birthInfo);
      setResult(data);
      setCache(birthKey, data);
    } catch {
      setError('분석을 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="top-bar">
        <button className="btn-ghost" onClick={() => navigate('/home')}>← 홈</button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>사주 분석</span>
        <div style={{ width: 48 }} />
      </div>

      {/* 섹션 탭 가로 스크롤 */}
      <div style={{
        display: 'flex',
        gap: 8,
        padding: '10px 16px',
        overflowX: 'auto',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(15,12,41,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        flexShrink: 0,
      }}>
        {SECTIONS.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            style={{
              flexShrink: 0,
              padding: '7px 14px',
              borderRadius: 20,
              border: 'none',
              background: activeSection === s.key ? '#a78bfa' : 'rgba(255,255,255,0.08)',
              color: activeSection === s.key ? '#fff' : 'rgba(255,255,255,0.5)',
              fontSize: 13,
              fontWeight: activeSection === s.key ? 700 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>

        {/* 로딩 */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>✦</div>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8 }}>
              만세력을 바탕으로<br />당신의 사주를 깊이 분석하고 있어요<br />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>잠시만 기다려주세요 (약 10~20초)</span>
            </p>
          </div>
        )}

        {/* 에러 */}
        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <p style={{ fontSize: 14, color: '#f87171', marginBottom: 16 }}>{error}</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '12px 28px' }} onClick={fetchAnalysis}>
              다시 시도
            </button>
          </div>
        )}

        {/* 분석 결과 */}
        {result && !loading && (
          <div style={{ padding: '16px 16px 80px', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* 섹션 제목 */}
            <div style={{ marginBottom: 4 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
                {SECTIONS.find(s => s.key === activeSection)?.icon}{' '}
                {SECTIONS.find(s => s.key === activeSection)?.label}
              </h2>
              {activeSection === '지금내시기는' && result.meta.currentDaewoon && (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                  현재 대운: {result.meta.currentDaewoon.cheongan}{result.meta.currentDaewoon.jiji} ({result.meta.currentDaewoon.startAge}~{result.meta.currentDaewoon.endAge}세)
                  · 올해 세운: {result.meta.seun.cheongan}{result.meta.seun.jiji}
                </p>
              )}
            </div>

            {/* 카테고리 카드들 */}
            {SECTION_ITEMS[activeSection].map(({ key, label }) => {
              const content = (result.analysis[activeSection] as any)[key];
              return (
                <div key={key} className="card">
                  <div className="card__title">{label}</div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.8, margin: 0 }}>
                    {content}
                  </p>
                </div>
              );
            })}


            {/* 다시 분석받기 */}
            <button
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px', color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer', marginTop: 4 }}
              onClick={() => { setResult(null); fetchAnalysis(); }}
            >
              분석 다시 받기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
