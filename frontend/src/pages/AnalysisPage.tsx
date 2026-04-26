import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSajuStore } from '../store/useSajuStore';
import { getFullAnalysis } from '../api/analysis';
import type { FullAnalysis, FullAnalysisResponse } from '../api/analysis';
import LoadingBar from '../components/LoadingBar';

const SECTIONS: {
  key: keyof FullAnalysis;
  label: string;
  icon: string;
  tagline: string;
  color: string;
  items: { key: string; label: string }[];
}[] = [
  {
    key: '나는어떤사람인가',
    label: '나는 어떤 사람인가',
    icon: '🪞',
    tagline: '기질·강점·약점',
    color: '#a78bfa',
    items: [
      { key: '핵심기질', label: '핵심 기질' },
      { key: '내면의나', label: '내면의 나' },
      { key: '사회적이미지', label: '사회적 이미지' },
      { key: '강점', label: '강점' },
      { key: '약점과함정', label: '약점과 함정' },
      { key: '나에게힘이되는기운', label: '나에게 힘이 되는 기운' },
    ],
  },
  {
    key: '일과적성',
    label: '일과 적성',
    icon: '💼',
    tagline: '일하는 방식·잘 맞는 분야',
    color: '#60a5fa',
    items: [
      { key: '일하는스타일', label: '일하는 스타일' },
      { key: '잘맞는분야', label: '잘 맞는 분야' },
      { key: '직장vs독립', label: '직장 vs 독립·창업' },
      { key: '커리어조심할것', label: '커리어에서 조심할 것' },
    ],
  },
  {
    key: '돈과재물',
    label: '돈과 재물',
    icon: '💰',
    tagline: '재물 흐름·소비 패턴',
    color: '#fbbf24',
    items: [
      { key: '돈을대하는방식', label: '돈을 대하는 방식' },
      { key: '재물운흐름', label: '재물운 흐름' },
      { key: '돈이들어오는패턴', label: '돈이 들어오는 패턴' },
      { key: '조심할소비습관', label: '조심할 소비 습관' },
    ],
  },
  {
    key: '사람들과어울리는방식',
    label: '인간관계',
    icon: '🤝',
    tagline: '연애·친구·파트너십',
    color: '#f97316',
    items: [
      { key: '연애스타일', label: '연애 스타일' },
      { key: '결혼과파트너십', label: '결혼과 파트너십' },
      { key: '친구와인간관계', label: '친구와 인간관계' },
      { key: '조심할관계패턴', label: '조심할 관계 패턴' },
    ],
  },
  {
    key: '지금내시기는',
    label: '지금 내 시기는',
    icon: '⏳',
    tagline: '대운·세운 흐름',
    color: '#34d399',
    items: [
      { key: '현재대운해석', label: '현재 대운 흐름' },
      { key: '올해흐름', label: '올해 흐름' },
      { key: '지금해야할것', label: '지금 해야 할 것' },
      { key: '지금하지말아야할것', label: '지금 하지 말아야 할 것' },
    ],
  },
  {
    key: '건강과에너지',
    label: '건강과 에너지',
    icon: '🍀',
    tagline: '체질·에너지 관리법',
    color: '#4ade80',
    items: [
      { key: '타고난체질', label: '타고난 체질' },
      { key: '조심할부분', label: '조심할 부분' },
      { key: '에너지관리법', label: '에너지 관리법' },
    ],
  },
  {
    key: '나의연애코드',
    label: '나의 연애 코드',
    icon: '💕',
    tagline: '끌리는 유형·연애 패턴',
    color: '#f472b6',
    items: [
      { key: '끌리는유형', label: '끌리는 유형' },
      { key: '연애할때진짜모습', label: '연애할 때 진짜 모습' },
      { key: '이별후패턴', label: '이별 후 패턴' },
      { key: '연애에서조심할것', label: '연애에서 조심할 것' },
    ],
  },
  {
    key: '소통과갈등방식',
    label: '소통과 갈등',
    icon: '🗣️',
    tagline: '소통 스타일·갈등 방식',
    color: '#94a3b8',
    items: [
      { key: '소통스타일', label: '소통 스타일' },
      { key: '갈등상황반응', label: '갈등 상황 반응' },
      { key: '상처받는말', label: '상처받는 말' },
      { key: '화해하는방식', label: '화해하는 방식' },
    ],
  },
  {
    key: '나의성장키워드',
    label: '나의 성장',
    icon: '✨',
    tagline: '인생 테마·성장 키워드',
    color: '#c084fc',
    items: [
      { key: '인생의테마', label: '인생의 테마' },
      { key: '가장빛나는때', label: '가장 빛나는 때' },
      { key: '성장을위한조언', label: '성장을 위한 조언' },
      { key: '나의인생문장', label: '나의 인생 문장' },
    ],
  },
];

const CACHE_KEY = 'sajuguang_analysis_v2';
const CACHE_YEAR = new Date().getFullYear();

function getCached(birthKey: string) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (cached.birthKey === birthKey && cached.year === CACHE_YEAR) {
      return cached.data as FullAnalysisResponse;
    }
  } catch { /* empty */ }
  return null;
}

function setCache(birthKey: string, data: FullAnalysisResponse) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ birthKey, year: CACHE_YEAR, data }));
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { birthInfo } = useSajuStore();
  const [result, setResult] = useState<FullAnalysisResponse | null>(null);
  const [selectedSection, setSelectedSection] = useState<keyof FullAnalysis | null>(null);
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

  const activeSectionData = selectedSection ? SECTIONS.find(s => s.key === selectedSection) : null;

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="top-bar">
        {selectedSection ? (
          <button className="btn-ghost" onClick={() => setSelectedSection(null)}>← 목록</button>
        ) : (
          <button className="btn-ghost" onClick={() => navigate('/home')}>← 홈</button>
        )}
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
          {activeSectionData ? `${activeSectionData.icon} ${activeSectionData.label}` : '사주 분석'}
        </span>
        <div style={{ width: 48 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>

        {/* 로딩 */}
        {loading && (
          <LoadingBar isLoading={loading} estimatedSeconds={15} label="사주 분석을 불러오고 있어요" />
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

        {result && !loading && (
          <>
            {/* ── 그리드 뷰 ── */}
            {!selectedSection && (
              <div style={{ padding: '16px 16px 100px' }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                  항목을 선택해 자세한 분석을 확인해보세요
                </p>
                <div className="ai-notice" style={{ marginBottom: 16 }}>
                  <strong>✦ AI 생성 결과</strong> · 사주 원국은 전통 명리학 알고리즘으로 계산되며, 아래 분석 내용은 그 데이터를 바탕으로 AI가 생성했어요.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {SECTIONS.map(s => (
                    <button
                      key={s.key}
                      onClick={() => setSelectedSection(s.key)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${s.color}33`,
                        borderRadius: 16,
                        padding: '16px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'background 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 28 }}>{s.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.4 }}>
                        {s.label}
                      </span>
                      <span style={{ fontSize: 10, color: s.color, textAlign: 'center', lineHeight: 1.3 }}>
                        {s.tagline}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── 섹션 상세 뷰 ── */}
            {selectedSection && activeSectionData && (
              <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedSection === '지금내시기는' && result.meta.currentDaewoon && (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>
                    현재 대운: {result.meta.currentDaewoon.cheongan}{result.meta.currentDaewoon.jiji} ({result.meta.currentDaewoon.startAge}~{result.meta.currentDaewoon.endAge}세)
                    · 올해 세운: {result.meta.seun.cheongan}{result.meta.seun.jiji}
                  </p>
                )}
                {activeSectionData.items.map(({ key, label }) => {
                  const content = (result.analysis[selectedSection] as any)?.[key];
                  if (!content) return null;
                  return (
                    <div key={key} className="card">
                      <div className="card__title" style={{ color: activeSectionData.color }}>{label}</div>
                      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.8, margin: 0 }}>
                        {content}
                      </p>
                    </div>
                  );
                })}
                <div className="ai-notice">
                  <strong>✦ AI 생성 결과</strong> · 사주 원국은 전통 명리학 알고리즘으로 계산한 값이며, 위 해석은 AI가 생성한 결과예요.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
