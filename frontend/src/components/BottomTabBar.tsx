import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usePass } from '../store/PassContext';

const TABS = [
  { path: '/home',    label: '홈',        icon: '☰' },
  { path: '/fortune', label: '오늘의 운세', icon: '✦' },
  { path: '/compat',  label: '궁합',       icon: '♡' },
  { path: '/yearly',  label: '신년운세',   icon: '◎' },
];

function formatRemaining(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}시간 ${m}분 남음`;
  return `${m}분 남음`;
}

export default function BottomTabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isActive, getRemainingMs } = usePass();
  const [remaining, setRemaining] = useState(getRemainingMs());

  useEffect(() => {
    if (!isActive) return;
    setRemaining(getRemainingMs());
    const id = setInterval(() => {
      const ms = getRemainingMs();
      setRemaining(ms);
    }, 30000); // 30초마다 갱신
    return () => clearInterval(id);
  }, [isActive]);

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480,
      background: 'rgba(15,12,41,0.95)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {/* 자유이용권 타이머 */}
      {isActive && remaining > 0 && (
        <div style={{
          textAlign: 'center', padding: '6px 0 4px',
          fontSize: 11, color: '#a78bfa', fontWeight: 600, letterSpacing: 0.2,
          borderBottom: '1px solid rgba(167,139,250,0.15)',
        }}>
          ✦ 자유이용권 {formatRemaining(remaining)}
        </div>
      )}
      <div style={{ display: 'flex' }}>
        {TABS.map(tab => {
          const active = pathname === tab.path || (tab.path === '/home' && pathname === '/');
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                flex: 1, padding: '10px 0 12px',
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              }}
            >
              <span style={{ fontSize: 18, color: active ? '#a78bfa' : 'rgba(255,255,255,0.35)' }}>
                {tab.icon}
              </span>
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 400,
                color: active ? '#a78bfa' : 'rgba(255,255,255,0.35)',
                letterSpacing: -0.2,
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
