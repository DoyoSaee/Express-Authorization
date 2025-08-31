# ExpressServer

**Express 기반 인증/인가 시스템 템플릿**  
JWT와 Passport 모듈을 활용해 로그인/회원가입, 세션 관리, 토큰 인증을 구현하고  
구글/카카오 소셜 로그인(OAuth)을 포함하는 기본 템플릿 프로젝트입니다.

---

## 주요 기능

- **JWT 인증**
  - Access Token / Refresh Token 발급 및 갱신
  - 토큰 기반 요청 검증
- **Passport 인증**
  - Local Strategy (아이디/비밀번호 기반)
  - 세션 생성 및 관리
  - 비밀번호 암호화 및 안전한 저장
- **소셜 로그인**
  - Google OAuth
  - Kakao OAuth
- **이메일 인증**
  - SMTP를 통한 메일 발송
  - 회원가입/로그인 관련 알림 처리
- **구조화된 라우팅**
  - Express Router 기반 모듈화
  - Middleware를 통한 인증/인가 처리

---

## 기술 스택

- **Backend**: Node.js, Express
- **Auth**: JWT, Passport (Local, Google, Kakao)
- **Database**: MongoDB (Mongoose, Sparse Index 활용)
- **Security**: Bcrypt (비밀번호 암호화)
- **Mailing**: Nodemailer + Gmail SMTP

---

## 프로젝트 구조

```bash
express-server/
├── src/
│   ├── auth/
│   │   ├── jwt/             # JWT 관련 로직
│   │   ├── passport/        # Passport Strategy (Local, Google, Kakao)
│   │   └── middleware/      # 인증/인가 미들웨어
│   ├── routes/              # Express Router
│   ├── views/               # 로그인/회원가입 화면 (템플릿)
│   ├── config/              # 환경변수 및 설정 파일
│   └── db/                  # MongoDB 연결 및 모델
├── package.json
└── .env.example


---

## 향후 개선 방향
- 사용자 역할(Role) 기반 접근 제어 (RBAC)
- 비밀번호 찾기 & 재설정 기능
- Refresh Token 보관 전략 개선 (DB 저장 or Redis)
- 테스트 코드 (Jest) 추가
- 추후 모노레포로 리팩토링
---
```
