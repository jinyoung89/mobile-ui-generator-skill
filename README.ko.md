<p align="center">
  <img src="docs/assets/readme-banner.svg" alt="Mobile UI Generator Skill" width="100%" />
</p>

# Mobile UI Generator Skill — 한국어

<p align="center">
  <em>AI 에이전트가 모바일 UX/UI 화면을 더 구체적으로 만들 수 있도록 브리프, JSON 스펙, 폰트 프로필, 구현 프롬프트를 생성하는 스킬입니다.</em>
</p>

<p align="center">
  <a href="https://jinyoung89.github.io/mobile-ui-generator-skill/">Website</a>
  · <a href="README.md">English</a>
  · <a href="skills/mobile-ui-generator/SKILL.md">Skill</a>
</p>

---

## 무엇인가요?

**Mobile UI Generator Skill**은 AI 에이전트가 실제 제품 흐름에 맞는 모바일 UX/UI를 만들도록 돕는 스킬입니다.

생성 결과에는 다음이 포함될 수 있습니다.

1. 앱 도메인과 화면 흐름 선택
2. 휴대폰 인증, PLP/PDP, 결제, 지도 바텀시트, 채팅 입력창, 리뷰쓰기, 랭킹, 리워드, FAQ, 빈 상태 복구 같은 구체적인 모바일 UI 패턴 선택
3. 레이아웃 아키타입, 내비게이션 모델, 컴포넌트, 상태, 인터랙션, CTA 정의
4. 선택한 언어에 맞는 UI 카피 작성
5. 영어 또는 한국어 중 하나의 언어 모드 선택
6. 서비스 성격에 맞는 폰트 프로필 추가
7. 디자인/코드/Figma/이미지 생성 에이전트에 전달할 Markdown 브리프와 JSON 스펙 생성

이미지 생성은 사용자가 명시적으로 요청할 때만 수행하는 것을 원칙으로 합니다.

## 언어 모드

문서 기본은 영어이지만, 생성 결과는 선택한 언어 하나로 나와야 합니다.

| Mode | 용도 | 규칙 |
|---|---|---|
| `en` | 영어 서비스 또는 영어 문서 | 설명과 UI 카피를 영어로 작성 |
| `ko` | 한국어 서비스 | 설명과 UI 카피를 한국어로 작성 |

사용자가 요청하지 않는 한 영어와 한국어를 한 화면에 섞지 않습니다. 단, 브랜드명이나 제품명은 예외입니다.

## 화면 카테고리

| 흐름 | 화면 유형 |
|---|---|
| 유입 | `splash`, `onboarding`, `permission`, `preference_setup` |
| 인증 | `login`, `signup`, `identity_verification`, `terms` |
| 계정 | `profile`, `settings`, `notification_permission`, `account_cancellation` |
| 커머스 | `product_list`, `product_detail`, `cart`, `checkout`, `payment`, `order_complete` |
| 금융 | `account_home`, `transfer`, `wallet`, `investment_portfolio`, `card_detail` |
| 소셜/콘텐츠 | `feed`, `chat`, `notification`, `creator_profile`, `content_viewer` |
| 모빌리티/여행 | `map_location`, `reservation_booking`, `route`, `stay_booking`, `ticket` |
| 교육/게임 | `lesson_home`, `quiz`, `progress`, `game_lobby`, `reward` |
| 지원 | `customer_support`, `faq`, `empty_state`, `error_recovery` |

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

예시:

```yaml
font_profile:
  family: Pretendard
  css_url: https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css
  fallback: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif
  confidence: recommended fallback
  reason: 한국 모바일 UI와 숫자 가독성에 무난한 기본 폰트.
```

## 웹사이트 예시

웹사이트의 예시 UI는 직접 만든 HTML/CSS 데모입니다. 실제 앱 캡처도 아니고 이미지 생성 결과도 아닙니다. 데스크톱과 모바일 모두 가로 캐러셀로 볼 수 있습니다.

```text
https://jinyoung89.github.io/mobile-ui-generator-skill/
```

## 라이선스

MIT
