-- ============================================================
-- 사주광 Supabase 스키마
-- ============================================================

-- 궁합: 오행 조합 × 관계유형 (25 × 5 = 125행)
CREATE TABLE IF NOT EXISTS compat_ohaeng (
  id            SERIAL PRIMARY KEY,
  ohaeng_me      TEXT NOT NULL,
  ohaeng_partner TEXT NOT NULL,
  relationship   TEXT NOT NULL,   -- 연인/배우자/친구/직장동료/가족
  score          INTEGER NOT NULL,
  summary        TEXT NOT NULL,
  ohaeng_desc    TEXT NOT NULL,
  strengths      JSONB NOT NULL DEFAULT '[]',
  cautions       JSONB NOT NULL DEFAULT '[]',
  tip            TEXT NOT NULL,
  keywords       JSONB NOT NULL DEFAULT '[]',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT compat_ohaeng_unique UNIQUE (ohaeng_me, ohaeng_partner, relationship)
);

-- 일주 분석: 60일주 × 5섹션 (300행)
-- section 값: 나는어떤사람인가 / 일과적성 / 돈과재물 / 사람들과어울리는방식 / 건강과에너지
-- content는 각 섹션의 하위 항목을 JSON으로 저장
CREATE TABLE IF NOT EXISTS ilju_analysis (
  id           SERIAL PRIMARY KEY,
  ilju         TEXT NOT NULL,   -- 갑자 / 을축 / ... (60종)
  cheongan     TEXT NOT NULL,
  jiji         TEXT NOT NULL,
  element      TEXT NOT NULL,   -- 천간 오행
  jiji_element TEXT NOT NULL,   -- 지지 오행
  section      TEXT NOT NULL,
  content      JSONB NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ilju_analysis_unique UNIQUE (ilju, section)
);

-- 조회 성능을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_compat_ohaeng_lookup
  ON compat_ohaeng (ohaeng_me, ohaeng_partner, relationship);

CREATE INDEX IF NOT EXISTS idx_ilju_analysis_lookup
  ON ilju_analysis (ilju, section);
