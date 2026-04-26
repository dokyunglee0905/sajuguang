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
      position: 'fixed',
      bottom: `calc(16px + env(safe-area-inset-bottom))`,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
    }}>
      {/* 자유이용권 타이머 */}
      {isActive && remaining > 0 && (
        <div style={{
          fontSize: 11, color: '#a78bfa', fontWeight: 600, letterSpacing: 0.2,
          background: 'rgba(15,12,41,0.85)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(167,139,250,0.25)',
          borderRadius: 20, padding: '4px 14px',
        }}>
          ✦ 자유이용권 {formatRemaining(remaining)}
        </div>
      )}
      {/* 플로팅 탭바 */}
      <div style={{
        display: 'flex',
        background: 'rgba(20,16,50,0.92)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 40,
        padding: '6px 8px',
        gap: 2,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}>
        {TABS.map(tab => {
          const active = pathname === tab.path || (tab.path === '/home' && pathname === '/');
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                padding: active ? '8px 18px' : '8px 14px',
                background: active ? 'rgba(167,139,250,0.2)' : 'none',
                border: 'none', cursor: 'pointer',
                borderRadius: 32,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 18, color: active ? '#a78bfa' : 'rgba(255,255,255,0.4)' }}>
                {tab.icon}
              </span>
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 400,
                color: active ? '#a78bfa' : 'rgba(255,255,255,0.4)',
                letterSpacing: -0.2,
                whiteSpace: 'nowrap',
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
