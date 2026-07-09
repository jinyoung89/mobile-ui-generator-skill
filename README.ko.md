<p align="center">
  <img src="docs/assets/readme-banner.svg" alt="Mobile UI Generator Skill" width="100%" />
</p>

# Mobile UI Generator Skill — 한국어

<p align="center">
  <em>AI 에이전트가 모바일 UX/UI 화면을 패턴, 디자인 시스템, 상태, 컴포넌트까지 포함해 구체적으로 생성하도록 돕는 스킬입니다.</em>
</p>

<p align="center">
  <a href="https://jinyoung89.github.io/mobile-ui-generator-skill/">Website</a>
  · <a href="README.md">English</a>
  · <a href="skills/mobile-ui-generator/SKILL.md">Skill</a>
</p>

---

## 무엇인가요?

**Mobile UI Generator Skill**은 AI 에이전트가 실제 제품 흐름에 맞는 모바일 UX/UI를 만들도록 돕는 디자인 중심 스킬입니다.

이 스킬은 단순히 “모던한 모바일 화면”을 말하지 않고, 다음을 명시하도록 설계했습니다.

1. 사용자 과업과 앱 도메인
2. 화면 흐름과 위험/신뢰 수준
3. 휴대폰 인증, PLP/PDP, 결제, 지도 바텀시트, 채팅 입력창, 리뷰쓰기, 랭킹, 리워드, FAQ, 빈 상태 복구 같은 구체적인 모바일 UI 패턴
4. 레이아웃 아키타입과 내비게이션 모델
5. 컴포넌트 인벤토리와 상태 매트릭스
6. 시각 스타일, 타이포그래피, 컬러, 모션, 아이콘/에셋 가이드
7. 접근성, safe area, 터치 타깃, 키보드 대응
8. 디자인/코드/Figma/이미지 생성 에이전트에 전달할 Markdown 브리프와 JSON 스펙

이미지 생성은 사용자가 명시적으로 요청할 때만 수행하는 것을 원칙으로 합니다.

## 스킬 reference 구조

설치되는 스킬은 단일 프롬프트가 아니라 `skills/mobile-ui-generator/references/` 아래의 디자인 reference 세트를 포함합니다. 공개 스킬에는 일반화된 디자인 가이드만 포함하고, 원본 reference와 출처 정보는 공개하지 않습니다.

| Reference | 역할 |
|---|---|
| `evidence-and-sanitization.md` | private/local reference 분석을 출처 노출 없이 공개 지식으로 일반화하는 정책 |
| `taxonomy-filter-model.md` | 앱 종류/서비스 카테고리 필터와 UI 패턴/기능 단위 필터를 구분 |
| `design-principles.md` | 모바일 디자인 판단 순서, 위계, 레이아웃, 타이포그래피, 컬러, 모션, 접근성 |
| `mobile-pattern-library.md` | 60개 이상의 모바일 UI 패턴과 컴포넌트, 상태, 인터랙션, 카피, 접근성, 금지 패턴 |
| `visual-style-taxonomy.md` | 모바일 시각 스타일 선택, 컬러 무드, 스타일 조합, anti-pattern |
| `domain-playbooks.md` | 핀테크, 커머스, 모빌리티, 헬스케어, 교육, 게임, 미디어, IoT 등 도메인별 가이드 |
| `component-state-checklist.md` | 구현 가능한 스펙을 위한 컴포넌트 인벤토리와 상태 매트릭스 |
| `quality-review-checklist.md` | 디자인 적합성, 시각 시스템, 상태, 접근성, 핸드오프 품질 검증 |
| `scripts/search.py` | 설치된 스킬 reference를 query/area/pattern ID로 검색 |
| `templates/mobile-ui-brief.md` | 사람이 읽는 모바일 디자인 brief 템플릿 |
| `templates/mobile-ui-spec.json` | 구현 핸드오프용 JSON spec 템플릿 |
| `templates/pattern-observation.md` | 앞으로 패턴을 고도화할 때 쓰는 public-safe 관찰 템플릿 |

### 두 가지 필터 축

- `app_type`: 서비스가 무엇을 하는지, 예: `wallet_payment`, `food_delivery`, `pet_care`, `travel_booking`, `ai_productivity`.
- `ui_pattern`: 서비스를 구성하는 기능 단위, 예: `phone_verification`, `search`, `checkout`, `bottom_sheet_map`, `review_write`.

내부 taxonomy 라벨은 spec/QA용이고 실제 사용자 UI에 보이면 안 됩니다.

### 스킬 내부 검색

설치 후 에이전트가 긴 reference를 전부 읽지 않고 필요한 지식만 찾을 수 있습니다.

```bash
python3 skills/mobile-ui-generator/scripts/search.py "fintech checkout coupon" --area all -n 5
python3 skills/mobile-ui-generator/scripts/search.py --pattern phone_verification
python3 skills/mobile-ui-generator/scripts/search.py "glass dark premium" --area styles -n 3
python3 skills/mobile-ui-generator/scripts/search.py "empty error loading" --area components -n 5
```

검색 영역: `taxonomy`, `patterns`, `domains`, `styles`, `components`, `quality`, `principles`, `evidence`, `all`.

검증:

```bash
python3 scripts/validate_patterns.py
python3 scripts/validate_site.py
```

## 패턴 시스템

이 스킬은 화면 이름만 정하는 것이 아니라, 모바일 UI를 **패턴 시스템**으로 다룹니다. 브리프에는 구체적인 패턴과 각 패턴에 필요한 설계 결정이 들어가야 합니다.

| 패턴 그룹 | 예시 |
|---|---|
| 유입/인증 | 스플래시, 온보딩, 권한 요청, 로그인, 회원가입, 휴대폰 인증, 본인인증, 약관 동의 |
| 홈/내비게이션 | 메인 홈, 하단 탭, 상단 앱바, 메뉴, 마이페이지, 멤버십 |
| 검색/목록 | 검색, 필터/정렬, 카테고리 탐색, PLP, 비교하기, 내주변 |
| 상세/콘텐츠 | PDP, 콘텐츠 뷰어, 미디어 뷰어, 북마크/위시리스트, 공지사항 |
| 커머스/결제 | 장바구니, 체크아웃, 간편결제, 쿠폰/포인트, 주문완료, 주문내역, 리뷰, 리뷰쓰기 |
| 금융 | 계좌 요약, 송금, 거래내역, 카드 상세, 투자 포트폴리오, 보안 인증 |
| 예약/지도 | 지도, 길찾기, 예약, 지도 바텀시트, 배달 추적, 숙소 예약 |
| 소셜/작성 | 피드, 채팅, 알림, 프로필, 글쓰기, 촬영/업로드 |
| 참여/게임화 | 게이미피케이션, 랭킹, 포인트/리워드, 이벤트, 퀘스트 진행률 |
| 지원/상태 | 고객센터, FAQ, 문의하기, 빈 상태, 오류 상태, 로딩 스켈레톤, 성공 상태 |

각 패턴은 컴포넌트 목록, 상태 매트릭스, 인터랙션 모델, 카피 요구사항, 모바일 제약을 함께 정의해야 합니다.

## 서비스 도메인

핀테크, 커머스, 모빌리티, 배달, 헬스케어, 교육, 게임, 메신저, 소셜, 콘텐츠, 여행, SaaS, 고객센터 등 다양한 앱 성격에 맞춰 화면 톤과 레이아웃을 조정합니다.

## 언어와 카피

언어 모드는 첫 번째 디자인 판단이 아니라, 패턴과 화면 구조를 정한 뒤 적용하는 **카피/출력 설정**입니다.

| Mode | 용도 | 규칙 |
|---|---|---|
| `en` | 영어 서비스 또는 영어 문서 | 설명과 UI 카피를 영어로 작성 |
| `ko` | 한국어 서비스 | 설명과 UI 카피를 한국어로 작성 |

사용자가 요청하지 않는 한 영어와 한국어를 한 화면에 섞지 않습니다. 단, 브랜드명이나 제품명은 예외입니다.

## 폰트 프로필

모바일 UI에서는 폰트, 숫자 가독성, 자간이 중요합니다. 확인된 브랜드 폰트가 있으면 그 폰트를 사용하고, 정확한 폰트를 모르면 무료/공개 한국어 UI 폰트를 추천합니다.

| 폰트 | 어울리는 용도 | URL |
|---|---|---|
| Pretendard | 기본 한국 앱 UI, 핀테크, 커머스, 생산성 | https://github.com/orioncactus/pretendard |
| SUIT | 모던하고 조밀한 UI, 온보딩, 설정, 대시보드 | https://github.com/sunn-us/SUIT |
| Noto Sans KR | Android/Web 안전 fallback | https://fonts.google.com/noto/specimen/Noto+Sans+KR |
| IBM Plex Sans KR | 테크, AI, 분석, 에디토리얼 | https://fonts.google.com/specimen/IBM+Plex+Sans+KR |
| Spoqa Han Sans Neo | 친근한 소비자 서비스, 로컬 커머스, 푸드/라이프스타일 | https://github.com/spoqa/spoqa-han-sans |
| Wanted Sans | SaaS, 채용, 생산성, 전문 서비스 | https://github.com/wanteddev/wanted-sans |

## 웹사이트 예시

웹사이트는 프롬프트를 넣으면 어떤 모바일 UI/UX 결과가 나오는지 보여주는 데 집중합니다. 내부 JSON/스펙은 에이전트와 검증용으로 저장하고, 공개 페이지에서는 사용자가 보게 될 화면과 UX 판단을 먼저 보여줍니다.

- 요청 프롬프트
- 생성된 모바일 UI 프리뷰
- UX 목표와 화면 위계
- 화면에 보이는 컴포넌트
- 대응하는 인터랙션 상태
- 시각/폰트 톤

현재 쇼케이스는 한국 핀테크 휴대폰 본인인증, 커머스 결제, 모빌리티 지도 예약, 회원 탈퇴 예시를 포함합니다.

```text
https://jinyoung89.github.io/mobile-ui-generator-skill/
```

## 라이선스

MIT
