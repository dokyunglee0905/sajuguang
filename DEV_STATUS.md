# 사주광 — 개발 현황 문서

> 마지막 업데이트: 2026-04-23  
> 상태: 1차 배포 준비 중

---

## 프로젝트 구조

```
sajuguang/
├── PLANNING.md          ← 기획 및 향후 계획
├── DEV_STATUS.md        ← 이 파일 (개발 현황)
├── frontend/            ← React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/       ← 화면 컴포넌트
│   │   ├── components/  ← 공통 컴포넌트
│   │   ├── store/       ← 상태관리 (Zustand + localStorage)
│   │   ├── api/         ← 백엔드 API 호출
│   │   └── types/       ← TypeScript 타입 정의
│   └── .env             ← VITE_API_URL 설정
└── backend/
    └── src/
        ├── routes/      ← API 라우터
        ├── saju/        ← 사주 계산 엔진
        └── data/        ← 천간·지지·오행 데이터
```

---

## 완성된 기능

### ① 온보딩 (`/`)
- 생년월일·시간·성별 입력
- 태양시(-32분) 보정 안내 문구 포함
- 시간 모를 경우 "시간을 모릅니다" 체크박스 → 자정(00:00) 기본 처리
- 입력 정보 localStorage에 저장
- 버튼 텍스트: 프리패스 有 → "나의 사주 보기" / 無 → "광고 보고 내 만세력 보기"

### ② 홈 (`/home`)
- 만세력: 년주·월주·일주·시주 표시
- 메인오행, 일주동물, 타고난 성향 TOP3
- 오행 분포 시각화
- 광고 게이팅(AdGate) 적용

### ③ 사주 분석 (`/analysis`)
- AI(Gemini) 기반 사주 분석 텍스트 생성
- 분석 항목: 나에게 힘이 되는 기운, 타고난 성향, 사주 특성, 대운 흐름
- 대운수·대운 목록 표시 (절기 기반 정밀 계산)
- 결과 localStorage 캐싱
- 광고 게이팅 적용

### ④ 오늘의 운세 (`/fortune`)
- AI(Gemini) 기반 일별 운세 생성
- 카테고리: 종합운·애정운·금전운·직업학업운·건강운
- 날짜 기준 캐싱 (같은 날 재진입 시 재생성 없음)
- 광고 게이팅 적용

### ⑤ 신년·월별운세 (`/yearly`)
- 탭: 신년운세 | 월별운세
- 신년운세: 총운풀이·집중할것·주의할것·7개 카테고리·올해의한마디
- 월별운세: 이달의흐름·4개 카테고리·좋은점·주의할점·길일·흉일
- 연도/월 선택 네비게이션
- 연도·월별 캐싱
- 광고 게이팅 적용

### ⑥ 궁합 (`/compat`)
- 나의 정보 자동 pre-fill (저장된 사주 정보 활용), 수정 가능
- 상대방 정보 입력 (이름·생년월일시·성별)
- 관계 유형 선택: 연인·배우자·친구·직장동료·가족·기타(직접 입력)
- 관계 유형에 따라 Gemini AI 분석 초점 변경
- 결과: 종합 점수·오행궁합·일주궁합·성향궁합·함께하면좋은것·조심할것
- 상대방 저장/불러오기 (localStorage, 관계 유형 포함)
- 저장된 연락처 칩 형태로 표시 ("이름 · 관계")
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

### 백엔드
| 항목 | 내용 |
|------|------|
| 런타임 | Node.js + TypeScript (ts-node) |
| 프레임워크 | Express |
| AI | Google Gemini 2.5-flash |
| 사주 계산 | @fullstackfamily/manseryeok |
| 환경변수 | dotenv |

### 데이터 레이어
| 항목 | 방식 |
|------|------|
| 사용자 사주 정보 | localStorage (useSajuStore) |
| 연락처 (상대방 목록) | localStorage (useContactsStore) |
| 광고 프리패스 만료시간 | localStorage (PassContext) |
| 운세 캐시 | localStorage (날짜/월/연도 키) |

---

## API 엔드포인트

### 백엔드 (Express, 기본 포트 3001)

| 메서드 | 경로 | 역할 |
|--------|------|------|
| POST | `/api/saju/calculate` | 사주팔자 계산 (만세력 기반) |
| POST | `/api/analysis` | Gemini 사주 분석 텍스트 생성 |
| POST | `/api/fortune` | 오늘의 운세 생성 |
| POST | `/api/yearly/annual` | 신년운세 생성 |
| POST | `/api/yearly/monthly` | 월별운세 생성 |
| POST | `/api/compat/one-to-one` | 1:1 궁합 분석 |

---

## 사주 계산 엔진

### calculator.ts 주요 로직

| 기능 | 구현 방식 |
|------|----------|
| 만세력 (년/월/일/시주) | @fullstackfamily/manseryeok |
| 태양시 보정 | 입력 시간 -32분 (서울 기준, 동경 127° vs 135°) |
| 십성 계산 | SIPSEONG_TABLE 조회 + 위치별 가중치 |
| 신강신약 | 비겁/인성 위치별 점수 (100점 스케일) |
| 대운수 | Meeus 천문 알고리즘으로 절기 날짜 계산 후 3일=1년 공식 |
| 대운 방향 | 양간+남/음간+여 → 순행, 반대 → 역행 |

### 대운수 계산 상세
- 입력: 출생년·월·일, 성별
- 절기: 12 절(節)기 황경값(285°~255°) → Meeus 반복 알고리즘으로 KST 날짜 도출
- 계산: 출생일 ↔ 목표 절기 간 일수 ÷ 3 = 대운수 (최소 1세)

---

## 환경변수

### backend/.env
```
GEMINI_API_KEY=...
PORT=3001
```

### frontend/.env
```
VITE_API_URL=http://localhost:3001   ← 배포 시 Railway URL로 변경
```

---

## 주요 파일 목록

### 백엔드
| 파일 | 역할 |
|------|------|
| `src/saju/calculator.ts` | 사주 계산 핵심 엔진 |
| `src/routes/saju.ts` | 사주 계산 API |
| `src/routes/analysis.ts` | 사주 분석 AI API |
| `src/routes/fortune.ts` | 오늘의 운세 AI API |
| `src/routes/yearly.ts` | 신년·월별운세 AI API |
| `src/routes/compat.ts` | 1:1 궁합 AI API |
| `src/data/cheongan.ts` | 천간 데이터 (오행·음양 포함) |
| `src/data/jiji.ts` | 지지 데이터 (지장간 포함) |
| `src/data/sipseong.ts` | 십성 조견표 |
| `src/data/ohaeng.ts` | 오행 상생·상극 관계 |

### 프론트엔드
| 파일 | 역할 |
|------|------|
| `src/App.tsx` | 라우팅 + PassProvider 루트 |
| `src/pages/OnboardingPage.tsx` | 사주 정보 입력 |
| `src/pages/HomePage.tsx` | 만세력 홈 |
| `src/pages/AnalysisPage.tsx` | 사주 분석 |
| `src/pages/FortunePage.tsx` | 오늘의 운세 |
| `src/pages/YearlyPage.tsx` | 신년·월별운세 |
| `src/pages/CompatPage.tsx` | 1:1 궁합 |
| `src/components/AdGate.tsx` | 광고 게이팅 컴포넌트 |
| `src/components/BottomTabBar.tsx` | 하단 탭바 + 프리패스 타이머 |
| `src/store/useSajuStore.ts` | 사주 정보 전역 상태 |
| `src/store/useContactsStore.ts` | 연락처 목록 상태 |
| `src/store/PassContext.tsx` | 광고 프리패스 Context |

---

## 알려진 제약사항 / 기술 부채

| 항목 | 내용 | 우선순위 |
|------|------|---------|
| 광고 SDK 미연동 | 버튼 클릭 시 즉시 패스 발급 (실제 광고 없음) | 런칭 전 필수 |
| localStorage 데이터 | 기기 초기화 시 데이터 소실 | 토스 SDK 연동 후 Supabase 이관 |
| 절기 계산 정확도 | ±1일 오차 가능 (KST 경계 날짜) | 낮음 |
| Gemini API 비용 | 사용량 증가 시 비용 발생 | 중간 (DB 전환 예정) |
