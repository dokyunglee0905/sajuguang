import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePass } from '../store/PassContext';

export default function AdGate({ children }: { children: ReactNode }) {
  const { isActive, activate } = usePass();
  const navigate = useNavigate();

  if (isActive) return <>{children}</>;

  return (
    <div className="page" style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100dvh', padding: '0 32px',
    }}>
      <div style={{ textAlign: 'center', width: '100%', maxWidth: 320 }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>✦</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
          2시간 자유이용권
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: '0 0 36px' }}>
          짧은 광고를 보고<br />
          모든 기능을 2시간 동안<br />
          자유롭게 이용해요
        </p>
        <button className="btn-primary" onClick={activate}>
          광고 보고 무료 이용하기
        </button>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: 16, background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.35)', fontSize: 14,
            cursor: 'pointer', padding: '8px 0', width: '100%',
          }}
        >
          나중에 하기
        </button>
      </div>
    </div>
  );
}
