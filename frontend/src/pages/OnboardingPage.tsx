import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateSaju } from '../api/saju';
import type { BirthInfo } from '../types/saju';
import { useSajuStore } from '../store/useSajuStore';
import { usePass } from '../store/PassContext';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setBirthInfo, setSajuResult } = useSajuStore();
  const { isActive } = usePass();

  const [form, setForm] = useState({
    name: '',
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
    gender: '' as '남' | '여' | '',
    unknownHour: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.year || !form.month || !form.day || !form.gender) {
      setError('생년월일과 성별을 입력해주세요.');
      return;
    }
    const y = Number(form.year);
    const m = Number(form.month);
    const d = Number(form.day);
    const currentYear = new Date().getFullYear();
    if (y < 1900 || y > currentYear) {
      setError('올바른 연도를 입력해주세요.');
      return;
    }
    if (m < 1 || m > 12) {
      setError('월은 1~12 사이로 입력해주세요.');
      return;
    }
    const maxDay = new Date(y, m, 0).getDate();
    if (d < 1 || d > maxDay) {
      setError(`${m}월은 최대 ${maxDay}일까지 있어요. 날짜를 다시 확인해주세요.`);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const birthInfo: BirthInfo = {
        year: Number(form.year),
        month: Number(form.month),
        day: Number(form.day),
        hour: form.unknownHour ? 0 : Number(form.hour || 0),
        minute: form.unknownHour ? 0 : Number(form.minute || 0),
        gender: form.gender as '남' | '여',
        unknownHour: form.unknownHour,
        name: form.name || undefined,
      };
      const result = await calculateSaju(birthInfo);
      setBirthInfo(birthInfo);
      setSajuResult(result);
      navigate('/home');
    } catch {
      setError('사주 계산 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <div style={{ textAlign: 'center', padding: '48px 24px 32px' }}>
        <div style={{ fontSize: 42, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>사주광</div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', letterSpacing: 4, marginTop: 4 }}>四柱狂</div>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginTop: 16 }}>
          생년월일시를 입력하면<br />나의 사주를 분석해드립니다
        </p>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} style={{ flex: 1, padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div className="field">
          <label className="field__label">이름 (선택)</label>
          <input
            className="input"
            placeholder="홍길동"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div className="field">
          <label className="field__label">생년월일</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              style={{ flex: 2 }}
              placeholder="1990"
              maxLength={4}
              inputMode="numeric"
              value={form.year}
              onChange={e => setForm(f => ({ ...f, year: e.target.value.replace(/\D/g, '') }))}
            />
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder="01"
              maxLength={2}
              inputMode="numeric"
              value={form.month}
              onChange={e => setForm(f => ({ ...f, month: e.target.value.replace(/\D/g, '') }))}
            />
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder="01"
              maxLength={2}
              inputMode="numeric"
              value={form.day}
              onChange={e => setForm(f => ({ ...f, day: e.target.value.replace(/\D/g, '') }))}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['년', '월', '일'].map((l, i) => (
              <div key={l} style={{ flex: i === 0 ? 2 : 1, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{l}</div>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field__label">태어난 시간</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.unknownHour}
              onChange={e => setForm(f => ({ ...f, unknownHour: e.target.checked }))}
              style={{ width: 16, height: 16, accentColor: '#a78bfa' }}
            />
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>시간을 모릅니다</span>
          </label>
          {!form.unknownHour && (
            <>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  className="input"
                  style={{ flex: 1 }}
                  placeholder="00"
                  maxLength={2}
                  inputMode="numeric"
                  value={form.hour}
                  onChange={e => setForm(f => ({ ...f, hour: e.target.value.replace(/\D/g, '') }))}
                />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }}>:</span>
                <input
                  className="input"
                  style={{ flex: 1 }}
                  placeholder="00"
                  maxLength={2}
                  inputMode="numeric"
                  value={form.minute}
                  onChange={e => setForm(f => ({ ...f, minute: e.target.value.replace(/\D/g, '') }))}
                />
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '6px 0 0', lineHeight: 1.6 }}>
                ✦ 사주광은 태양시 기준으로 계산해요. 입력하신 시간에서 32분이 자동 보정됩니다.
              </p>
            </>
          )}
        </div>

        <div className="field">
          <label className="field__label">성별</label>
          <div className="gender-row">
            {(['남', '여'] as const).map(g => (
              <button
                key={g}
                type="button"
                className={`gender-btn${form.gender === g ? ' gender-btn--active' : ''}`}
                onClick={() => setForm(f => ({ ...f, gender: g }))}
              >
                {g === '남' ? '남성' : '여성'}
              </button>
            ))}
          </div>
        </div>

        <div className="ai-notice">
          <strong>✦ 서비스 안내</strong><br />
          사주 원국(년·월·일·시의 간지)은 전통 명리학 알고리즘으로 계산돼요.
          심층 분석·운세 해석은 명리학 데이터를 기반으로 AI가 생성한 결과예요.
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? '분석 중...' : isActive ? '나의 사주 보기' : '광고 보고 내 만세력 보기'}
        </button>
      </form>
    </div>
  );
}
