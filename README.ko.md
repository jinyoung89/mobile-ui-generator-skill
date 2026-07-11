# Mobile UI Generator

Mobile UI Generator는 화면 요청을 하나의 수치 기반 canonical spec으로
정리하고 HTML/CSS, React Native, Flutter, SwiftUI의 완전한 소스 코드를
생성합니다. 포함된 proof set은 반응형, 한영 지원, 로컬 fixture 전용이며
정적 검증이 가능합니다.

[쇼케이스](https://jinyoung89.github.io/mobile-ui-generator-skill/) ·
[English](README.md) ·
[스킬 안내](skills/mobile-ui-generator/SKILL.md) ·
[Canonical schema](skills/mobile-ui-generator/schemas/mobile-ui-spec.schema.json)

## 생성 결과

- 레이아웃, safe area, 상태, 인터랙션, 다국어, 접근성, 플랫폼 mapping을
  정의하는 엄격한 JSON spec
- 같은 spec에서 파생된 완전한 HTML/CSS, React Native, Flutter, SwiftUI
  소스와 API가 필요 없는 로컬 fixture
- 320, 390, 430 px 기준 너비를 위한 수치 기반 레이아웃 token
- 정적 검증 결과, 소스 hash, canonical IR, 공개 provenance
- 네 가지 target의 반응형 preview와 코드 tab을 제공하는 생성형 웹사이트

## 다섯 가지 proof 예시

| 예시 | Preview | Canonical artifact |
|---|---|---|
| 핀테크 회원가입 | [휴대폰 본인 확인](https://jinyoung89.github.io/mobile-ui-generator-skill/examples/fintech-signup/) | [소스와 spec](examples/proof/fintech-signup/) |
| 커머스 결제 | [배송지와 결제 검토](https://jinyoung89.github.io/mobile-ui-generator-skill/examples/commerce-checkout-address/) | [소스와 spec](examples/proof/commerce-checkout/) |
| 모빌리티 예약 | [지도와 차량 예약](https://jinyoung89.github.io/mobile-ui-generator-skill/examples/mobility-map-booking/) | [소스와 spec](examples/proof/mobility-map-booking/) |
| 소셜 피드 | [커뮤니티 피드](https://jinyoung89.github.io/mobile-ui-generator-skill/examples/social-feed/) | [소스와 spec](examples/proof/social-feed/) |
| 메신저 채팅 | [대화와 입력창](https://jinyoung89.github.io/mobile-ui-generator-skill/examples/messenger-chat/) | [소스와 spec](examples/proof/messenger-chat/) |

각 proof 디렉터리에는 요청문, canonical `spec.json`, compiled IR, 네 가지
target 소스, 공개 provenance, 정적 검증 결과가 들어 있습니다.
[쇼케이스](https://jinyoung89.github.io/mobile-ui-generator-skill/)에서는 같은
artifact를 반응형 preview와 HTML/CSS, React Native, Flutter, SwiftUI 코드
tab으로 확인할 수 있습니다.

## 설치

```bash
git clone https://github.com/jinyoung89/mobile-ui-generator-skill.git
cp -R mobile-ui-generator-skill/skills/mobile-ui-generator "$CODEX_HOME/skills/"
```

## 사용

설치한 스킬을 사용하도록 에이전트에 요청하고, 제품 과업, 필요한 상태,
언어, viewport 범위, target 플랫폼을 지정합니다.

```text
320–430 px 너비에 맞는 결제 화면을 만들어 주세요. 빈 상태, 로딩,
오류, 성공 상태를 포함하고 HTML/CSS, React Native, Flutter, SwiftUI로
반환해 주세요.
```

새 spec은
[`templates/mobile-ui-spec.json`](skills/mobile-ui-generator/templates/mobile-ui-spec.json)에서
시작하고 스킬 내부 validator로 확인합니다.

```bash
python3 skills/mobile-ui-generator/scripts/validate_spec.py path/to/spec.json
```

## Canonical 생성과 정적 검증

JSON spec이 단일 source of truth입니다. 플랫폼 소스, 반응형 preview,
compiled IR, hash, provenance는 이 spec에서 생성되며, 플랫폼별 값이 별도의
디자인 contract가 되지 않습니다.

저장소 검증 명령:

```bash
npm install
npm test -- tooling/test/proof-set.test.ts
npm run typecheck
python3 scripts/validate_patterns.py
python3 scripts/validate_site.py
npm run validate:boundary -- examples/proof
```

첫 릴리스의 proof 범위는 의도적으로 정적 검증에 한정됩니다. Canonical
spec 검증, 생성 소스 재현성, 파일과 hash의 일치, 공개 boundary 통과를
검증합니다. Native build, native run, device/simulator 실행, native capture는
**검증 완료라고 주장하지 않으며 이 proof set의 필수 조건도 아닙니다.**

## 개인정보 보호 boundary

공개 artifact에는 일반화된 가이드, 합성 로컬 fixture, 저장소에서 생성한
결과만 포함됩니다. Boundary checker는 private 경로, credential, 출처 식별
정보, 허용되지 않은 link와 안전하지 않은 파일을 차단합니다. 원본
screenshot, private 수집 데이터, 숨겨진 provenance는 공개하지 않습니다.

## 저장소 구조

```text
skills/mobile-ui-generator/   # 설치형 스킬, schema, template, reference
examples/proof/               # canonical spec 5개와 네 target 소스
tooling/                      # compiler, generator, validator, test
site/                         # 생성형 showcase 소스
docs/                         # 배포된 static site
```

## 라이선스

MIT
