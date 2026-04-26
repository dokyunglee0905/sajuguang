import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSajuStore } from '../store/useSajuStore';
import { getAnnualFortune, getMonthlyFortune } from '../api/yearly';
import type { AnnualFortune, MonthlyFortune } from '../api/yearly';
import LoadingBar from '../components/LoadingBar';

type Tab = 'annual' | 'monthly';

const ANNUAL_CATEGORIES: { key: keyof AnnualFortune; label: string; icon: string }[] = [
  { key: '재물운',   label: '재물운',   icon: '💰' },
  { key: '애정운',   label: '애정운',   icon: '💕' },
  { key: '결혼운',   label: '결혼운',   icon: '💍' },
  { key: '직업운',   label: '직업운',   icon: '💼' },
  { key: '사업운',   label: '사업운',   icon: '🚀' },
  { key: '건강운',   label: '건강운',   icon: '🍀' },
  { key: '인맥운',   label: '인맥운',   icon: '🤝' },
];

const MONTHLY_CATEGORIES: { key: keyof MonthlyFortune; label: string; icon: string }[] = [
  { key: '애정운',     label: '애정운',     icon: '💕' },
  { key: '금전운',     label: '금전운',     icon: '💰' },
  { key: '직업학업운', label: '직업·학업운', icon: '💼' },
  { key: '건강운',     label: '건강운',     icon: '🍀' },
];

function getCachedAnnual(birthKey: string, year: number): AnnualFortune | null {
  try {
    const raw = localStorage.getItem(`sajuguang_annual_${birthKey}_${year}`);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (cached.year === year) return cached.data;
  } catch { /* empty */ }
  return null;
}

function setCachedAnnual(birthKey: string, year: number, data: AnnualFortune) {
  localStorage.setItem(`sajuguang_annual_${birthKey}_${year}`, JSON.stringify({ year, data }));
}

function getCachedMonthly(birthKey: string, year: number, month: number): MonthlyFortune | null {
  try {
    const raw = localStorage.getItem(`sajuguang_monthly_${birthKey}_${year}_${month}`);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (cached.year === year && cached.month === month) return cached.data;
  } catch { /* empty */ }
  return null;
}

function setCachedMonthly(birthKey: string, year: number, month: number, data: MonthlyFortune) {
  localStorage.setItem(`sajuguang_monthly_${birthKey}_${year}_${month}`, JSON.stringify({ year, month, data }));
}

// ─── 공통 서브컴포넌트 ────────────────────────────────────────────────────────

function FortuneCard({ title, icon, text }: { title: string; icon: string; text: string }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{title}</span>
      </div>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, margin: 0 }}>{text}</p>
    </div>
  );
}


function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <p style={{ fontSize: 14, color: '#f87171', marginBottom: 16 }}>{message}</p>
      <button className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }} onClick={onRetry}>
        다시 시도
      </button>
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function YearlyPage() {
  const navigate = useNavigate();
  const { birthInfo } = useSajuStore();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [tab, setTab] = useState<Tab>('annual');

  const [annualFortune, setAnnualFortune] = useState<AnnualFortune | null>(null);
  const [annualLoading, setAnnualLoading] = useState(false);
  const [annualError, setAnnualError] = useState('');

  const [selYear, setSelYear] = useState(currentYear);
  const [selMonth, setSelMonth] = useState(currentMonth);
  const [monthlyFortune, setMonthlyFortune] = useState<MonthlyFortune | null>(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlyError, setMonthlyError] = useState('');

  useEffect(() => {
    if (!birthInfo) { navigate('/'); }
  }, []);

  const birthKey = birthInfo
    ? `${birthInfo.year}-${birthInfo.month}-${birthInfo.day}-${birthInfo.gender}`
    : '';

  // 신년운세 로드
  useEffect(() => {
    if (!birthInfo || tab !== 'annual') return;
    const cached = getCachedAnnual(birthKey, currentYear);
    if (cached) { setAnnualFortune(cached); return; }
    fetchAnnual();
  }, [tab]);

  // 월별운세 로드
  useEffect(() => {
    if (!birthInfo || tab !== 'monthly') return;
    const cached = getCachedMonthly(birthKey, selYear, selMonth);
    if (cached) { setMonthlyFortune(cached); return; }
    fetchMonthly();
  }, [tab, selYear, selMonth]);

  const fetchAnnual = async () => {
    if (!birthInfo) return;
    setAnnualLoading(true);
    setAnnualError('');
    try {
      const res = await getAnnualFortune(birthInfo, currentYear);
      setAnnualFortune(res.fortune);
      setCachedAnnual(birthKey, currentYear, res.fortune);
    } catch {
      setAnnualError('신년운세를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setAnnualLoading(false);
    }
  };

  const fetchMonthly = async () => {
    if (!birthInfo) return;
    setMonthlyLoading(true);
    setMonthlyError('');
    try {
      const res = await getMonthlyFortune(birthInfo, selYear, selMonth);
      setMonthlyFortune(res.fortune);
      setCachedMonthly(birthKey, selYear, selMonth, res.fortune);
    } catch {
      setMonthlyError('월별운세를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setMonthlyLoading(false);
    }
  };

  const prevMonth = () => {
    setMonthlyFortune(null);
    if (selMonth === 1) { setSelMonth(12); setSelYear(y => y - 1); }
    else { setSelMonth(m => m - 1); }
  };

  const nextMonth = () => {
    setMonthlyFortune(null);
    if (selMonth === 12) { setSelMonth(1); setSelYear(y => y + 1); }
    else { setSelMonth(m => m + 1); }
  };

  if (!birthInfo) return null;

  return (
    <div className="page page-scroll" style={{ paddingBottom: 80 }}>
      <div className="top-bar">
        <span className="top-bar__title">신년·월별운세</span>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', padding: '12px 16px 0', gap: 8 }}>
        {([
          { key: 'annual' as Tab, label: `${currentYear}년 운세` },
          { key: 'monthly' as Tab, label: '월별 운세' },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1, padding: '10px 0',
              background: tab === key ? 'rgba(167,139,250,0.2)' : 'transparent',
              border: tab === key ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              color: tab === key ? '#a78bfa' : 'rgba(255,255,255,0.4)',
              fontSize: 13, fontWeight: tab === key ? 700 : 400, cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── 신년운세 ── */}
      {tab === 'annual' && (
        <div style={{ padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {annualFortune?.올해의한마디 && (
            <div style={{
              background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)',
              borderRadius: 16, padding: 16, textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 }}>
                {currentYear}년의 한마디
              </div>
              <p style={{ fontSize: 15, color: '#fff', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                "{annualFortune.올해의한마디}"
              </p>
            </div>
          )}

          {annualLoading && <LoadingBar isLoading={annualLoading} estimatedSeconds={15} label="신년운세를 분석하고 있어요" />}
          {annualError && !annualLoading && <ErrorCard message={annualError} onRetry={fetchAnnual} />}

          {annualFortune && !annualLoading && (
            <>
              <FortuneCard title="총운 풀이" icon="🌟" text={annualFortune.총운풀이} />
              <FortuneCard title="집중해야 할 것" icon="✦" text={annualFortune.집중할것} />
              <FortuneCard title="주의해야 할 것" icon="⚠️" text={annualFortune.주의할것} />
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 700, padding: '4px 4px 0', letterSpacing: 0.3 }}>
                카테고리별 운세
              </div>
              {ANNUAL_CATEGORIES.map(({ key, label, icon }) => (
                <FortuneCard key={key} title={label} icon={icon} text={annualFortune[key] as string} />
              ))}
            </>
          )}
        </div>
      )}

      {/* ── 월별운세 ── */}
      {tab === 'monthly' && (
        <div style={{ padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* 월 네비게이션 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 4px' }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 22, cursor: 'pointer', padding: '0 12px', lineHeight: 1 }}>‹</button>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
              {selYear}년 {selMonth}월
            </span>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 22, cursor: 'pointer', padding: '0 12px', lineHeight: 1 }}>›</button>
          </div>

          {monthlyLoading && <LoadingBar isLoading={monthlyLoading} estimatedSeconds={15} label="월별운세를 분석하고 있어요" />}
          {monthlyError && !monthlyLoading && <ErrorCard message={monthlyError} onRetry={fetchMonthly} />}

          {monthlyFortune && !monthlyLoading && (
            <>
              {/* 이달의 흐름 */}
              <div style={{
                background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: 16, padding: 16,
              }}>
                <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 }}>
                  {selMonth}월의 흐름
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, margin: 0 }}>
                  {monthlyFortune.이달의흐름}
                </p>
              </div>

              {/* 카테고리 */}
              {MONTHLY_CATEGORIES.map(({ key, label, icon }) => (
                <FortuneCard key={key} title={label} icon={icon} text={monthlyFortune[key] as string} />
              ))}

              {/* 좋은 점 / 주의할 점 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="card" style={{ background: 'rgba(96,165,250,0.08)', borderColor: 'rgba(96,165,250,0.2)' }}>
                  <div style={{ fontSize: 12, color: '#60a5fa', fontWeight: 700, marginBottom: 8 }}>이번 달 좋은 점</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, margin: 0 }}>
                    {monthlyFortune.좋은점}
                  </p>
                </div>
                <div className="card" style={{ background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.2)' }}>
                  <div style={{ fontSize: 12, color: '#f87171', fontWeight: 700, marginBottom: 8 }}>주의할 점</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, margin: 0 }}>
                    {monthlyFortune.주의할점}
                  </p>
                </div>
              </div>

              {/* 길일 / 흉일 */}
              <div className="card">
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#a78bfa', fontWeight: 700, marginBottom: 10 }}>✦ 길일</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {monthlyFortune.길일?.map(d => (
                        <span key={d} style={{
                          padding: '4px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                          background: 'rgba(167,139,250,0.2)', color: '#a78bfa',
                        }}>{d}일</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#f87171', fontWeight: 700, marginBottom: 10 }}>⚠ 흉일</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {monthlyFortune.흉일?.map(d => (
                        <span key={d} style={{
                          padding: '4px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                          background: 'rgba(248,113,113,0.2)', color: '#f87171',
                        }}>{d}일</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
