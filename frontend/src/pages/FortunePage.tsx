import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSajuStore } from '../store/useSajuStore';
import { getTodayFortune } from '../api/fortune';
import type { TodayFortune } from '../api/fortune';

const CATEGORIES: { key: keyof TodayFortune; label: string; icon: string }[] = [
  { key: '종합운',     label: '종합운',     icon: '🌟' },
  { key: '애정운',     label: '애정운',     icon: '💕' },
  { key: '금전운',     label: '금전운',     icon: '💰' },
  { key: '직업학업운', label: '직업·학업운', icon: '💼' },
  { key: '건강운',     label: '건강운',     icon: '🍀' },
];

const CACHE_KEY = 'sajuguang_fortune';

function getCachedFortune(birthKey: string) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    const today = new Date().toDateString();
    if (cached.birthKey === birthKey && cached.date === today) return cached.data;
  } catch { /* empty */ }
  return null;
}

function setCachedFortune(birthKey: string, data: TodayFortune) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    birthKey,
    date: new Date().toDateString(),
    data,
  }));
}

export default function FortunePage() {
  const navigate = useNavigate();
  const { birthInfo } = useSajuStore();
  const [fortune, setFortune] = useState<TodayFortune | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const birthKey = birthInfo
    ? `${birthInfo.year}-${birthInfo.month}-${birthInfo.day}-${birthInfo.gender}`
    : '';

  useEffect(() => {
    if (!birthInfo) { navigate('/'); return; }
    const cached = getCachedFortune(birthKey);
    if (cached) { setFortune(cached); return; }
    fetchFortune();
  }, []);

  const fetchFortune = async () => {
    if (!birthInfo) return;
    setLoading(true);
    setError('');
    try {
      const res = await getTodayFortune(birthInfo);
      setFortune(res.fortune);
      setCachedFortune(birthKey, res.fortune);
    } catch {
      setError('운세를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <div className="page page-scroll" style={{ paddingBottom: 80 }}>
      <div className="top-bar">
        <span className="top-bar__title">오늘의 운세</span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{todayStr}</span>
      </div>

      <div style={{ padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* 오늘의 한마디 */}
        {fortune?.오늘의한마디 && (
          <div style={{
            background: 'rgba(167,139,250,0.12)',
            border: '1px solid rgba(167,139,250,0.3)',
            borderRadius: 16,
            padding: '16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 }}>오늘의 한마디</div>
            <p style={{ fontSize: 15, color: '#fff', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
              "{fortune.오늘의한마디}"
            </p>
          </div>
        )}

        {/* 로딩 */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>✦</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
              오늘의 운세를 분석하고 있어요<br />잠시만 기다려주세요
            </p>
          </div>
        )}

        {/* 에러 */}
        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: 14, color: '#f87171', marginBottom: 16 }}>{error}</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }} onClick={fetchFortune}>
              다시 시도
            </button>
          </div>
        )}

        {/* 운세 카테고리 */}
        {fortune && !loading && CATEGORIES.map(({ key, label, icon }) => (
          <div key={key} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{label}</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, margin: 0 }}>
              {fortune[key]}
            </p>
          </div>
        ))}

      </div>
    </div>
  );
}