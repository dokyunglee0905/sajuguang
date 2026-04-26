import { useEffect, useState, useRef } from 'react';

const MESSAGES = [
  '만세력을 계산하고 있어요',
  '일간과 오행을 분석하고 있어요',
  '대운·세운 흐름을 읽고 있어요',
  '당신만의 패턴을 찾고 있어요',
  '마지막으로 정리하고 있어요',
];

interface Props {
  isLoading: boolean;
  estimatedSeconds?: number;
  label?: string;
}

export default function LoadingBar({ isLoading, estimatedSeconds = 15, label }: Props) {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      setMsgIndex(0);

      // 진행률: 90%까지 점점 느려지는 방식으로
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          const remaining = 90 - p;
          const increment = remaining * (0.1 / estimatedSeconds);
          return Math.min(p + increment, 90);
        });
      }, 100);

      // 메시지 순환
      msgIntervalRef.current = setInterval(() => {
        setMsgIndex(i => (i + 1) % MESSAGES.length);
      }, Math.floor((estimatedSeconds * 1000) / MESSAGES.length));
    } else {
      // 완료 → 100%로 스냅
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (msgIntervalRef.current) clearInterval(msgIntervalRef.current);
      setProgress(100);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (msgIntervalRef.current) clearInterval(msgIntervalRef.current);
    };
  }, [isLoading, estimatedSeconds]);

  if (!isLoading && progress === 0) return null;

  return (
    <div style={{ textAlign: 'center', padding: '72px 32px' }}>
      <div style={{ fontSize: 40, marginBottom: 24 }}>✦</div>

      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 6, fontWeight: 600 }}>
        {label ?? '사주를 분석하고 있어요'}
      </p>
      <p style={{
        fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 32,
        minHeight: 20, transition: 'opacity 0.3s',
      }}>
        {MESSAGES[msgIndex]}
      </p>

      {/* 프로그레스 바 */}
      <div style={{
        width: '100%', height: 6, background: 'rgba(255,255,255,0.08)',
        borderRadius: 99, overflow: 'hidden', marginBottom: 10,
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
          borderRadius: 99,
          transition: progress === 100 ? 'width 0.3s ease-out' : 'width 0.1s linear',
        }} />
      </div>

      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
        {progress < 90
          ? `약 ${Math.max(1, Math.round(estimatedSeconds * (1 - progress / 90)))}초 남았어요`
          : '거의 다 됐어요...'}
      </p>
    </div>
  );
}
