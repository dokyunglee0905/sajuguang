# 사주광 — 개발 현황 문서

> 마지막 업데이트: 2026-04-23  
> 상태: **1차 배포 완료 ✅**

---

## 배포 현황

| 서비스 | URL | 상태 |
|--------|-----|------|
| 프론트엔드 (Vercel) | https://sajuguang.vercel.app | ✅ 운영 중 |
| 백엔드 (Railway) | https://sajuguang-production.up.railway.app | ✅ 운영 중 |
| GitHub 레포 | https://github.com/dokyunglee0905/sajuguang | ✅ private |

---

## 프로젝트 구조

```
sajuguang/
├── PLANNING.md          ← 기획 및 향후 계획
├── DEV_STATUS.md        ← 이 파일 (개발 현황)
├── AI_PROMPTS.md        ← AI 모델·프롬프트 관리
├── frontend/            ← React + TypeScript + Vite (Vercel 배포)
│   ├── src/
│   │   ├── pages/       ← 화면 컴포넌트
│   │   ├── components/  ← 공통 컴포넌트
│   │   ├── store/       ← 상태관리 (Zustand + localStorage)
│   │   ├── api/         ← 백엔드 API 호출
│   │   └── types/       ← TypeScript 타입 정의
│   └── .env             ← VITE_API_URL (로컬용, Vercel 환경변수로 관리)
├── backend/             ← Node.js + TypeScript (Railway 배포)
│   └── src/
│       ├── routes/      ← API 라우터
│       ├── saju/        ← 사주 계산 엔진
│       └── data/        ← 천간·지지·오행 데이터
└── qa/                  ← Playwright UI/UX 테스트 스위트
```

---

## 완성된 기능

### ① 온보딩 (`/`)
- 생년월일·시간·성별 입력
- 태양시(-32분) 보정 안내 문구 포함
- 시간 모를 경우 "시간을 모릅니다" 체크박스 → 자정(00:00) 기본 처리
- 입력 정보 localStorage에 저장

### ② 홈 (`/home`)
- 만세력: 년주·월주·일주·시주 표시
- 메인오행, 일주동물, 타고난 성향 TOP3
- 오행 분포 시각화
- 신강신약 표시
- 광고 게이팅(AdGate) 적용

### ③ 사주 분석 (`/analysis`)
- AI(Gemini 2.5-flash) 기반 사주 분석 텍스트 생성
- 6개 섹션 탭: 나는어떤사람인가 / 일과적성 / 돈과재물 / 사람들과어울리는방식 / 지금내시기는 / 건강과에너지
- 대운수·대운 목록 표시 (Meeus 절기 기반 정밀 계산)
- 결과 localStorage 캐싱 (무기한)
- 광고 게이팅 적용

### ④ 오늘의 운세 (`/fortune`)
- AI(Gemini 2.5-flash) 기반 일별 운세 생성
- 카테고리: 종합운·애정운·금전운·직업학업운·건강운·오늘의한마디
- 날짜 기준 캐싱 (같은 날 재진입 시 재생성 없음)
- 광고 게이팅 적용

### ⑤ 신년·월별운세 (`/yearly`)
- 탭: 신년운세 | 월별운세
- 신년운세: 총운풀이·집중할것·주의할것·7개 카테고리·올해의한마디
- 월별운세: 이달의흐름·4개 카테고리·좋은점·주의할점·길일·흉일
- 연도/월 선택 네비게이션
- 연도·월별 localStorage 캐싱
- 광고 게이팅 적용

### ⑥ 궁합 (`/compat`)
- 나의 정보 자동 pre-fill (저장된 사주 정보 활용), 수정 가능
- 상대방 정보 입력 (이름·생년월일시·성별)
- 관계 유형 선택: 연인·배우자·친구·직장동료·가족·기타(직접 입력)
- 관계 유형에 따라 Gemini AI 분석 초점 변경
- 결과: 종합 점수·오행궁합·일주궁합·성향궁합·함께하면좋은것·조심할것
- 상대방 저장/불러오기 (localStorage, 관계 유형 포함)
- 광고 게이팅 적용

### ⑦ 광고 게이팅 시스템
- 모든 콘텐츠 탭 진입 시 AdGate 컴포넌트 표시
- "광고 보고 무료 이용하기" 버튼 → 2시간 프리패스 발급
- PassContext (React Context)로 앱 전체 공유
- 프리패스 잔여시간 탭바 상단에 표시 (30초마다 갱신)
- 실제 광고 SDK는 런칭 준비 단계에서 연동 예정

---

## 기술 스택

### 프론트엔드
| 항목 | 내용 |
|------|------|
| 프레임워크 | React 18 + TypeScript + Vite |
| 상태관리 | Zustand (useSajuStore) + localStorage |
| HTTP 클라이언트 | Axios |
| 스타일링 | CSS-in-JS (inline style) |
| 라우팅 | React Router v6 |
| 배포 | Vercel (GitHub 연동, 자동 배포) |

### 백엔드
| 항목 | 내용 |
|------|------|
| 런타임 | Node.js 22 + TypeScript |
| 프레임워크 | Express |
| AI | Google Gemini 2.5-flash |
| 사주 계산 | @fullstackfamily/manseryeok |
| 환경변수 | dotenv |
| 배포 | Railway (GitHub 연동, 자동 배포) |

### 데이터 레이어
| 항목 | 방식 |
|------|------|
| 사용자 사주 정보 | localStorage (useSajuStore) |
| 연락처 (상대방 목록) | localStorage (useContactsStore) |
| 광고 프리패스 만료시간 | localStorage (PassContext) |
| 운세 캐시 | localStorage (날짜/월/연도 키) |

---

## API 엔드포인트

| 메서드 | 경로 | 역할 |
|--------|------|------|
| POST | `/api/saju/calculate` | 사주팔자 계산 (만세력 기반) |
| POST | `/api/analysis/full` | Gemini 사주 분석 텍스트 생성 |
| POST | `/api/fortune/today` | 오늘의 운세 생성 |
| POST | `/api/yearly/annual` | 신년운세 생성 |
| POST | `/api/yearly/monthly` | 월별운세 생성 |
| POST | `/api/compat/one-to-one` | 1:1 궁합 분석 |

---

## 사주 계산 엔진

| 기능 | 구현 방식 |
|------|----------|
| 만세력 (년/월/일/시주) | @fullstackfamily/manseryeok |
| 태양시 보정 | 입력 시간 -32분 (서울 기준) |
| 십성 계산 | SIPSEONG_TABLE 조회 + 위치별 가중치 |
| 신강신약 | 비겁/인성 위치별 점수 (100점 스케일) |
| 대운수 | Meeus 천문 알고리즘으로 절기 날짜 계산 후 3일=1년 공식 |
| 대운 방향 | 양간+남/음간+여 → 순행, 반대 → 역행 |

---

## 환경변수

### backend (Railway 환경변수로 관리)
```
GEMINI_API_KEY=...
PORT=3001
```

### frontend (Vercel 환경변수로 관리)
```
VITE_API_URL=https://sajuguang-production.up.railway.app
```

---

## QA 현황 (2026-04-23)

### API QA (curl 기반)
- 총 21개 테스트 중 **20 통과 / 1 오탐** (실제 버그 없음)

### UI/UX QA (Playwright)
- 총 39개 테스트 중 **28 통과**
- 11개 실패 → Gemini API 월 한도 초과 (코드 버그 아님)
- 발견·수정된 버그: 홈 하단 버튼이 탭바에 가려지는 문제 → padding-bottom 40→100px 수정

---

## 알려진 제약사항 / 기술 부채

| 항목 | 내용 | 우선순위 |
|------|------|---------|
| 광고 SDK 미연동 | 버튼 클릭 시 즉시 패스 발급 (실제 광고 없음) | 런칭 전 필수 |
| localStorage 데이터 | 기기 초기화 시 데이터 소실 | Supabase 이관 예정 |
| Gemini API 비용 | 사용량 증가 시 비용 발생 | 궁합 DB 전환 예정 |
| 절기 계산 정확도 | ±1일 오차 가능 (KST 경계) | 낮음 |
| Gemini API 한도 | 월 무료 한도 초과 시 운세 기능 중단 | Gemini API 키 재발급/유료 전환 필요 |

---

## 앞으로 해야 할 일

### 🔴 즉시 (QA 후 버그 수정)
- [ ] 내일 Dorothy QA 테스트 결과 기반 버그 수정
- [ ] Gemini API 키 재발급 (보안상 권장)

### 🟠 런칭 준비 (토스 심사 전)

#### 토스 광고 SDK 연동
- [ ] 토스 미니앱 개발자 계정 등록
- [ ] 토스 광고 SDK 문서 확인 및 연동
- [ ] `AdGate.tsx` 버튼 클릭 → 실제 광고 재생 후 패스 발급으로 교체
- [ ] 결과 화면 하단 배너 광고 슬롯 연동

#### 데이터 영속성 개선 (Supabase 이관)
- [ ] Supabase 프로젝트 생성
- [ ] 연락처 테이블 스키마 설계
- [ ] `useContactsStore` → Supabase API 호출로 교체
- [ ] 토스 사용자 식별자(user_id) 연동

#### AI 비용 최적화
- [ ] 오행 25가지 조합별 궁합 텍스트 → Supabase DB 저장
- [ ] `/api/compat/one-to-one` Gemini 호출 → DB 조회로 교체

### 🟡 1차 배포 이후 신규 기능

#### 그룹 궁합
- [ ] 기획 확정 (인원: 3~8명)
- [ ] 그룹 전체 케미 점수 + 요약
- [ ] 1:1 궁합 매트릭스
- [ ] 역할 분석 (리더형, 에너지 메이커 등)
- [ ] 보완자 분석

#### 사주 분석 고도화
- [ ] 대운 타임라인 UI (출생~90세 시각화)
- [ ] 합·충·형·파·해 계산 및 표시

#### 콘텐츠 고도화
- [ ] 운세 프롬프트 개선
- [ ] 일주동물 캐릭터 이미지 추가
