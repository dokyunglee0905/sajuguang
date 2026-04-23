import { useState } from 'react';
import { useSajuStore } from '../store/useSajuStore';
import { useContactsStore } from '../store/useContactsStore';
import type { BirthInfo } from '../types/saju';
import { getCompatResult } from '../api/compat';
import type { CompatResult } from '../api/compat';

type PersonForm = {
  name: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  gender: '남' | '여' | '';
  unknownHour: boolean;
};

const EMPTY_FORM: PersonForm = {
  name: '', year: '', month: '', day: '',
  hour: '', minute: '', gender: '', unknownHour: false,
};

const RELATIONSHIPS = ['연인', '배우자', '친구', '직장동료', '가족', '기타'];

function birthInfoToForm(b: BirthInfo): PersonForm {
  return {
    name: b.name ?? '',
    year: String(b.year),
    month: String(b.month),
    day: String(b.day),
    hour: b.unknownHour ? '' : String(b.hour).padStart(2, '0'),
    minute: b.unknownHour ? '' : String(b.minute).padStart(2, '0'),
    gender: b.gender,
    unknownHour: b.unknownHour,
  };
}

function formToBirthInfo(f: PersonForm): BirthInfo {
  return {
    year: Number(f.year),
    month: Number(f.month),
    day: Number(f.day),
    hour: f.unknownHour ? 0 : Number(f.hour || 0),
    minute: f.unknownHour ? 0 : Number(f.minute || 0),
    gender: f.gender as '남' | '여',
    unknownHour: f.unknownHour,
    name: f.name || undefined,
  };
}

const SCORE_LEVELS = [
  { min: 85, label: '천생연분 ✨', color: '#a78bfa' },
  { min: 70, label: '좋은 궁합이에요', color: '#60a5fa' },
  { min: 55, label: '노력하면 잘 맞아요', color: '#fbbf24' },
  { min: 0,  label: '차이를 이해하는 게 중요해요', color: '#f87171' },
];

function getScoreLevel(score: number) {
  return SCORE_LEVELS.find(s => score >= s.min) ?? SCORE_LEVELS[SCORE_LEVELS.length - 1];
}

// ─── 입력 폼 컴포넌트 ────────────────────────────────────────────────────────

interface PersonInputProps {
  label: string;
  form: PersonForm;
  onChange: (f: PersonForm) => void;
  collapsible?: boolean;
}

function PersonInput({ label, form, onChange, collapsible = false }: PersonInputProps) {
  const [collapsed, setCollapsed] = useState(collapsible);

  if (collapsed) {
    return (
      <div className="card" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 0.3 }}>{label}</span>
          <button type="button"
            style={{ fontSize: 12, color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => setCollapsed(false)}>
            수정
          </button>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 3px' }}>
          {form.name || '이름 없음'}
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          {form.year}.{String(form.month).padStart(2, '0')}.{String(form.day).padStart(2, '0')}
          {form.unknownHour ? ' · 시간 미입력' : ` · ${form.hour}:${form.minute}`}
          {' · '}{form.gender === '남' ? '남성' : '여성'}
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 0.3 }}>{label}</span>
        {collapsible && (
          <button type="button"
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => setCollapsed(true)}>
            접기
          </button>
        )}
      </div>

      <div className="field" style={{ marginBottom: 14 }}>
        <label className="field__label">이름 (선택)</label>
        <input className="input" placeholder="홍길동" value={form.name}
          onChange={e => onChange({ ...form, name: e.target.value })} />
      </div>

      <div className="field" style={{ marginBottom: 14 }}>
        <label className="field__label">생년월일</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" style={{ flex: 2 }} placeholder="1990" maxLength={4} inputMode="numeric"
            value={form.year} onChange={e => onChange({ ...form, year: e.target.value.replace(/\D/g, '') })} />
          <input className="input" style={{ flex: 1 }} placeholder="01" maxLength={2} inputMode="numeric"
            value={form.month} onChange={e => onChange({ ...form, month: e.target.value.replace(/\D/g, '') })} />
          <input className="input" style={{ flex: 1 }} placeholder="01" maxLength={2} inputMode="numeric"
            value={form.day} onChange={e => onChange({ ...form, day: e.target.value.replace(/\D/g, '') })} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['년', '월', '일'].map((l, i) => (
            <div key={l} style={{ flex: i === 0 ? 2 : 1, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{l}</div>
          ))}
        </div>
      </div>

      <div className="field" style={{ marginBottom: 14 }}>
        <label className="field__label">태어난 시간</label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }}>
          <input type="checkbox" checked={form.unknownHour}
            onChange={e => onChange({ ...form, unknownHour: e.target.checked })}
            style={{ width: 16, height: 16, accentColor: '#a78bfa' }} />
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>시간을 모릅니다</span>
        </label>
        {!form.unknownHour && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input className="input" style={{ flex: 1 }} placeholder="00" maxLength={2} inputMode="numeric"
              value={form.hour} onChange={e => onChange({ ...form, hour: e.target.value.replace(/\D/g, '') })} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }}>:</span>
            <input className="input" style={{ flex: 1 }} placeholder="00" maxLength={2} inputMode="numeric"
              value={form.minute} onChange={e => onChange({ ...form, minute: e.target.value.replace(/\D/g, '') })} />
          </div>
        )}
      </div>

      <div className="field">
        <label className="field__label">성별</label>
        <div className="gender-row">
          {(['남', '여'] as const).map(g => (
            <button key={g} type="button"
              className={`gender-btn${form.gender === g ? ' gender-btn--active' : ''}`}
              onClick={() => onChange({ ...form, gender: g })}>
              {g === '남' ? '남성' : '여성'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function CompatPage() {
  const { birthInfo } = useSajuStore();
  const { contacts, addContact, removeContact } = useContactsStore();

  const [p1Form, setP1Form] = useState<PersonForm>(() =>
    birthInfo ? birthInfoToForm(birthInfo) : EMPTY_FORM
  );
  const [p2Form, setP2Form] = useState<PersonForm>(EMPTY_FORM);
  const [relationship, setRelationship] = useState('');
  const [customRelationship, setCustomRelationship] = useState('');

  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input');
  const [result, setResult] = useState<CompatResult | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const activeRelationship = relationship === '기타' ? customRelationship : relationship;

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!p1Form.year || !p1Form.month || !p1Form.day || !p1Form.gender) {
      setError('나의 생년월일과 성별을 입력해주세요.');
      return;
    }
    if (!p2Form.year || !p2Form.month || !p2Form.day || !p2Form.gender) {
      setError('상대방의 생년월일과 성별을 입력해주세요.');
      return;
    }
    setError('');
    setSaved(false);
    setStep('loading');
    try {
      const res = await getCompatResult(
        formToBirthInfo(p1Form),
        formToBirthInfo(p2Form),
        activeRelationship || undefined,
      );
      setResult(res);
      setStep('result');
    } catch {
      setError('궁합 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setStep('input');
    }
  };

  const handleSaveContact = () => {
    if (saved) return;
    addContact(
      p2Form.name || '이름 없음',
      activeRelationship || '기타',
      formToBirthInfo(p2Form),
    );
    setSaved(true);
  };

  const handleSelectContact = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;
    setP2Form(birthInfoToForm(contact.birthInfo));
    const preset = RELATIONSHIPS.includes(contact.relationship) && contact.relationship !== '기타'
      ? contact.relationship
      : contact.relationship ? '기타' : '';
    setRelationship(preset);
    if (preset === '기타') setCustomRelationship(contact.relationship);
  };

  // ─── 로딩 ─────────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <div style={{ textAlign: 'center', padding: '0 24px' }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>♡</div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            두 분의 궁합을 분석하고 있어요<br />잠시만 기다려주세요
          </p>
        </div>
      </div>
    );
  }

  // ─── 결과 ─────────────────────────────────────────────────────────────────
  if (step === 'result' && result) {
    const { compat, meta } = result;
    const level = getScoreLevel(compat.score);

    return (
      <div className="page page-scroll" style={{ paddingBottom: 80 }}>
        <div className="top-bar">
          <button className="top-bar__btn" onClick={() => setStep('input')}>← 다시보기</button>
          <span className="top-bar__title">궁합 결과</span>
          <span />
        </div>

        <div style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* 점수 */}
          <div style={{ textAlign: 'center', padding: '28px 0 16px' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
              {meta.person1.이름} · {meta.person2.이름}
            </div>
            {activeRelationship && (
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 12, padding: '3px 10px', background: 'rgba(167,139,250,0.2)', borderRadius: 20, color: '#a78bfa' }}>
                  {activeRelationship}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: 72, fontWeight: 800, color: level.color, lineHeight: 1 }}>{compat.score}</span>
              <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.4)' }}>점</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: level.color }}>{level.label}</div>
          </div>

          {/* 종합 한마디 */}
          <div style={{
            background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)',
            borderRadius: 16, padding: '16px', textAlign: 'center',
          }}>
            <p style={{ fontSize: 15, color: '#fff', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
              "{compat.종합한마디}"
            </p>
          </div>

          {/* 오행 궁합 */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>🌊</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>오행 궁합</span>
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 20,
                background: meta.ohaengRel.type === '상생' ? 'rgba(96,165,250,0.2)' : meta.ohaengRel.type === '상극' ? 'rgba(248,113,113,0.2)' : 'rgba(167,139,250,0.2)',
                color: meta.ohaengRel.type === '상생' ? '#60a5fa' : meta.ohaengRel.type === '상극' ? '#f87171' : '#a78bfa',
              }}>
                {meta.ohaengRel.type}
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, margin: 0 }}>{compat.오행궁합}</p>
          </div>

          {/* 일주 궁합 */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>☀️</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>일주 궁합</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, margin: 0 }}>{compat.일주궁합}</p>
          </div>

          {/* 성향 궁합 */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>💫</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>성향 궁합</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, margin: 0 }}>{compat.성향궁합}</p>
          </div>

          {/* 함께하면 좋은 것 */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>✨</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>함께하면 좋은 것</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, margin: 0 }}>{compat.함께하면좋은것}</p>
          </div>

          {/* 조심할 부분 */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>조심할 부분</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, margin: 0 }}>{compat.조심할것}</p>
          </div>

          {/* 상대방 저장 */}
          <button
            onClick={handleSaveContact}
            style={{
              marginTop: 4, padding: '14px',
              background: saved ? 'rgba(96,165,250,0.15)' : 'rgba(167,139,250,0.15)',
              border: saved ? '1px solid rgba(96,165,250,0.4)' : '1px solid rgba(167,139,250,0.4)',
              borderRadius: 12, cursor: saved ? 'default' : 'pointer',
              fontSize: 14, fontWeight: 600,
              color: saved ? '#60a5fa' : '#a78bfa',
            }}
          >
            {saved
              ? `${p2Form.name || '상대방'} 저장됨 ✓`
              : `${p2Form.name || '상대방'} 저장하기`}
          </button>

        </div>
      </div>
    );
  }

  // ─── 입력 ─────────────────────────────────────────────────────────────────
  return (
    <div className="page page-scroll" style={{ paddingBottom: 80 }}>
      <div className="top-bar">
        <span className="top-bar__title">궁합</span>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        <PersonInput label="나의 정보" form={p1Form} onChange={setP1Form} collapsible={!!birthInfo} />

        <div style={{ textAlign: 'center', fontSize: 22, color: 'rgba(255,255,255,0.2)', padding: '4px 0' }}>♡</div>

        {/* 저장된 사람 목록 */}
        {contacts.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginBottom: 8, letterSpacing: 0.3 }}>
              저장된 사람
            </div>
            <div style={{
              display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4,
              scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
            } as React.CSSProperties}>
              {contacts.map(c => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                  background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)',
                  borderRadius: 20, padding: '6px 6px 6px 12px',
                }}>
                  <button type="button" onClick={() => handleSelectContact(c.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <span style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600 }}>{c.name}</span>
                    {c.relationship && (
                      <span style={{ fontSize: 11, color: 'rgba(167,139,250,0.6)', marginLeft: 4 }}>· {c.relationship}</span>
                    )}
                  </button>
                  <button type="button" onClick={() => removeContact(c.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'rgba(255,255,255,0.25)', padding: '0 4px', lineHeight: 1 }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <PersonInput label="상대방 정보" form={p2Form} onChange={setP2Form} />

        {/* 관계 선택 */}
        <div className="card">
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 12, letterSpacing: 0.3 }}>
            관계 (선택)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {RELATIONSHIPS.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRelationship(prev => prev === r ? '' : r)}
                style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 13,
                  background: relationship === r ? 'rgba(167,139,250,0.25)' : 'rgba(255,255,255,0.06)',
                  border: relationship === r ? '1px solid rgba(167,139,250,0.6)' : '1px solid rgba(255,255,255,0.1)',
                  color: relationship === r ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', fontWeight: relationship === r ? 700 : 400,
                }}
              >
                {r}
              </button>
            ))}
          </div>
          {relationship === '기타' && (
            <input
              className="input"
              style={{ marginTop: 10 }}
              placeholder="관계를 직접 입력해주세요"
              value={customRelationship}
              onChange={e => setCustomRelationship(e.target.value)}
            />
          )}
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn-primary" style={{ marginTop: 4 }}>
          궁합 보기
        </button>

      </form>
    </div>
  );
}
