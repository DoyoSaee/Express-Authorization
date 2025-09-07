# Express-Authorization 모노레포

JWT(4000)와 Passport(3500)를 각각 앱으로 분리한 학습용 모노레포입니다.

## 빠른 시작

- 설치: `pnpm install`
- JWT 서버 실행: `pnpm start:jwt` (포트 4000)
- Passport 서버 실행: `pnpm start:passport` (포트 3500)
- 개발 모드(자동 재실행): `pnpm -F @apps/jwt dev`, `pnpm -F @apps/passport dev`

## 디렉터리 구조

```
.
├── apps/
│   ├── jwt/
│   │   ├── index.js          # JWT 서버 (4000)
│   │   ├── .env              # ACCESS/REFRESH 토큰 시크릿
│   │   └── package.json
│   └── passport/
│       ├── index.js          # Passport(Local/OAuth) 서버 (3500)
│       ├── config/
│       │   └── passport.js   # Local + Google + Kakao 전략 설정
│       ├── controllers/
│       │   ├── users.controller.js
│       │   └── posts.controller.js (stub)
│       ├── routes/
│       │   ├── main.router.js
│       │   └── users.router.js
│       ├── models/
│       │   └── users.model.js
│       ├── middlewares/
│       │   └── auth.js
│       ├── views/            # EJS 템플릿
│       ├── public/           # 정적 파일
│       └── package.json
├── package.json               # 루트 스크립트
├── pnpm-workspace.yaml        # 워크스페이스 설정
└── pnpm-lock.yaml
```

## 앱별 안내

### apps/jwt (포트 4000)

- 환경변수 파일: `apps/jwt/.env`
  - `ACCESS_TOKEN_SECRET`
  - `REFRESH_TOKEN_SECRET`
- 주요 엔드포인트
  - `POST /login`: `{ "userName": "..." }` → accessToken 반환, refreshToken 쿠키 저장
  - `POST /refresh`: refreshToken 쿠키로 accessToken 재발급
  - `GET /posts`: Authorization 헤더 `Bearer <accessToken>` 필요
- 요청 예시
  - 로그인: `POST http://localhost:4000/login` body: `{ "userName": "user1" }`
  - 갱신: `POST http://localhost:4000/refresh` (쿠키 자동 전송 필요)
  - 조회: `GET http://localhost:4000/posts` 헤더: `Authorization: Bearer <token>`

### apps/passport (포트 3500)

- 환경변수 파일: `apps/passport/.env`
  - `MONGODB_URI`: MongoDB 연결 문자열
- LocalStrategy 데모(세션/뷰 사용)
- 엔드포인트 예시: 로그인/회원가입/성공 페이지 등
- 확장 아이디어
  - 세션/쿠키 기반 로그인 고도화(`passport.session()`, serialize/deserialize)
  - OAuth 추가(Google, Kakao)
  - 로그인 성공 시 JWT 발급하여 JWT 서버와 연계

#### Kakao 로그인 설정

- 필수/선택 환경변수(`apps/passport/.env`)
  - `KAKAO_CLIENT_ID` 또는 `KAKAO_REST_KEY`: Kakao Developers REST API 키
  - `KAKAO_CALLBACK_URL` (선택): 기본값 `http://localhost:3500/auth/kakao/callback`
  - `KAKAO_CLIENT_SECRET` (선택): Kakao 콘솔에서 활성화한 경우만 필요
- 라우트
  - 시작: `GET /auth/kakao`
  - 콜백: `GET /auth/kakao/callback`
- 요청 스코프(동의 항목)
  - 코드상 요청: `account_email`, `profile_nickname`
  - Kakao Developers > 내 애플리케이션 > 카카오 로그인 > 동의 항목에서 사용설정 필요
- Kakao Developers 콘솔 설정 가이드
  - 애플리케이션 생성 후 플랫폼(Web) 추가
  - 사이트 도메인: `http://localhost:3500`
  - Redirect URI: `http://localhost:3500/auth/kakao/callback`
  - 동의 항목에서 `account_email`(선택/필수 중 택1), `profile_nickname` 사용 설정
- 동작 메모
  - 최초 가입 시 이메일이 동의/제공된 경우에만 환영 메일이 발송됩니다.
  - 이메일 미동의/미제공이어도 닉네임으로 가입/연동은 진행됩니다.

#### Google 최초 회원가입 환영 메일 발송

- 동작: Google OAuth로 신규 사용자가 처음 생성될 때만 환영 메일을 발송합니다.
- 템플릿/전송:
  - 템플릿: `apps/passport/mail/welcome_template.js`
  - 전송기: `apps/passport/mail/mail.js` (Nodemailer, Gmail 사용)
- 보낸사람 표시: `GMAIL_FROM_NAME`가 있으면 `GMAIL_FROM_NAME <GMAIL_USER>` 형식으로 발송됩니다.
- 환경변수(`apps/passport/.env`):
  - `GMAIL_USER=your_gmail@gmail.com`
  - `GMAIL_PASS=app_password` (Google 계정 2단계 인증 후 생성한 앱 비밀번호)
  - `GMAIL_FROM_NAME=서비스명` (선택)
- 참고: 기존 계정(이미 생성된 사용자)으로 로그인하거나 구글 계정을 로컬 계정에 “연동”만 하는 경우에는 메일을 보내지 않습니다.

예시 스크린샷:

![Google Welcome Mail](apps/passport/public/googleMail.png)

## UI 스크린샷 (Passport)

- 홈(최초 진입, 비로그인):

  ![Passport Index (logged out)](apps/passport/public/index.png)

- 홈(로그인 상태):

  ![Passport Index (authenticated)](<apps/passport/public/index(auth).png>)

- 로그인 성공 화면:

  ![Passport Success](apps/passport/public/success.png)

- 로그인 화면:

  ![Passport Login](apps/passport/public/login.png)

- 회원가입 화면:

  ![Passport Signup](apps/passport/public/signup.png)

- MongoDB users 컬렉션(구글 로그인, 비밀번호 제거):

  ![MongoDB Data (Google Login)](apps/passport/public/mogodata.png)

## 참고 사항

- 두 앱은 서로 독립 실행됩니다. 공통 패키지는 루트에 설치되어도 동작하지만, 필요 시 각 앱 `package.json` 기준으로 관리합니다.
- 환경변수는 각 앱 디렉터리에서 로드됩니다. `.env`는 각 앱 하위에 둡니다.

## 향후 학습/개선 가이드

- Passport에 세션 도입 후 직렬화/역직렬화 구현
- Google/Kakao OAuth 연동 고도화(프로필/동의 항목 최적화)
- JWT Refresh Token 저장 전략(DB/Redis) 실험
- 역할(Role) 기반 접근 제어(RBAC) 적용
- mysql DB변경
