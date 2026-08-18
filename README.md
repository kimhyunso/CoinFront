# 📊 CoinDash Frontend

React + TypeScript 기반의 실시간 암호화폐 대시보드 프론트엔드입니다.
Apollo Client를 통해 Spring Boot GraphQL 서버와 통신하며, WebSocket으로 실시간 코인 가격을 구독합니다.

---

## 🛠 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | React 19 + TypeScript |
| 빌드 도구 | Vite |
| 스타일 | Tailwind CSS 4.x |
| GraphQL 클라이언트 | Apollo Client 4.x |
| 실시간 구독 | graphql-ws + Apollo useSubscription |
| 라우팅 | React Router DOM 7.x |
| 차트 | Recharts |

---

## 📁 프로젝트 구조

```
src/
├── apollo/
│   └── client.ts               # Apollo Client 설정 (HTTP + WebSocket + JWT)
├── components/
│   ├── CoinCard.tsx            # 실시간 코인 가격 카드 (즐겨찾기 토글 포함)
│   └── PriceChart.tsx          # 실시간 가격 라인 차트 (Recharts)
├── hooks/
│   └── useAuth.ts              # JWT 인증 상태 관리 훅
├── pages/
│   ├── LoginPage.tsx           # 로그인/회원가입 페이지
│   ├── MainPage.tsx            # 메인 대시보드 (실시간 차트 + 코인 카드)
│   └── MyPage.tsx              # 마이페이지 (사이드바 + 회원정보 + 즐겨찾기)
├── types.ts                    # TypeScript 타입 정의
├── App.tsx                     # 라우터 설정 + TokenHandler
└── main.tsx                    # 앱 진입점
```

---

## 📦 패키지 설치

```bash
npm install
```

### 주요 패키지
```bash
npm install @apollo/client graphql graphql-ws graphql-tag
npm install react-router-dom
npm install recharts
npm install tailwindcss @tailwindcss/vite
```

---

## ⚙️ Vite 설정 (`vite.config.ts`)

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

---

## 🎨 컬러 팔레트

| 용도 | 색상 |
|------|------|
| Primary | `#03A9F4` |
| Dark Primary | `#0288D1` |
| Light Primary | `#B3E5FC` |
| Accent | `#00BCD4` |
| Primary Text | `#212121` |
| Secondary Text | `#757575` |
| Divider | `#BDBDBD` |
| Text on Primary | `#FFFFFF` |

---

## 🔌 Apollo Client 설정 (`src/apollo/client.ts`)

```ts
import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { setContext } from '@apollo/client/link/context';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

// JWT 토큰을 HTTP 요청 헤더에 추가
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const httpLink = new HttpLink({
  uri: 'http://localhost:8080/graphql',
});

// WebSocket 연결 시 JWT 토큰 포함
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:8080/graphql',
    connectionParams: () => {
      const token = localStorage.getItem('token');
      return {
        Authorization: token ? `Bearer ${token}` : '',
      };
    },
  })
);

// Query/Mutation → HTTP, Subscription → WebSocket
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),
);

export default new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

---

## 🔐 인증 (`src/hooks/useAuth.ts`)

JWT 토큰을 `localStorage`에 저장하고 관리해요.

```ts
export function useAuth() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    window.dispatchEvent(new Event('tokenChanged'));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    window.location.href = '/login';
  };

  return { token, login, logout, isLoggedIn: !!token };
}
```

---

## 🗺 라우팅 (`src/App.tsx`)

```
/         → MainPage  (메인 대시보드)
/login    → LoginPage (로그인/회원가입)
/mypage   → MyPage    (마이페이지)
```

### TokenHandler
구글 소셜 로그인 후 URL의 `?token=xxx`를 자동으로 파싱해서 저장해요.

```tsx
function TokenHandler() {
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      login(token);
      window.location.replace('/');
    }
  }, []);

  return null;
}
```

---

## 📄 페이지 설명

### MainPage (`/`)
- 실시간 코인 가격 라인 차트 (Bitcoin, Ethereum, BNB, Solana, XRP)
- 코인 탭 클릭으로 차트 전환
- 실시간 코인 가격 카드 목록
- 로그인 시 ★ 즐겨찾기 토글 버튼
- 헤더: 로그인/마이페이지/로그아웃 버튼

### LoginPage (`/login`)
- 로그인/회원가입 탭 전환
- 구글 소셜 로그인
- 이메일 실시간 형식 검증
- 비밀번호 강도 바 (8자/영문/숫자/특수문자)
- 소셜 로그인 이메일 일반 가입 차단

### MyPage (`/mypage`)
- 사이드바 네비게이션 (회원정보 / 즐겨찾기)
- 회원정보 탭: 이름/이메일/로그인방식 표시
- 비밀번호 변경 (일반 로그인 사용자만)
- 즐겨찾기 탭: 즐겨찾기한 코인 목록 + 삭제 버튼

---

## 📡 GraphQL 쿼리

### Subscription (실시간)
```graphql
subscription PriceUpdated($symbol: String!) {
  priceUpdated(symbol: $symbol) {
    symbol
    price
    change
    changePercent
    volume
    timestamp
  }
}
```

### Query (즐겨찾기 조회)
```graphql
query GetFavorites {
  favorites {
    id
    symbol
    name
  }
}
```

### Mutation (즐겨찾기 추가/삭제)
```graphql
mutation AddFavorite($symbol: String!) {
  addFavorite(symbol: $symbol) {
    id
    symbol
    name
  }
}

mutation RemoveFavorite($symbol: String!) {
  removeFavorite(symbol: $symbol)
}
```

---

## 🚀 실행 방법

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

> ⚠️ 백엔드 서버(`http://localhost:8080`)가 먼저 실행되어 있어야 해요.

---

## 📌 개발 현황

### 완료
- [x] Vite + React + TypeScript 설정
- [x] Tailwind CSS 설정
- [x] Apollo Client (HTTP + WebSocket + JWT 헤더)
- [x] 실시간 코인 가격 Subscription
- [x] 실시간 라인 차트 (Recharts)
- [x] 코인 카드 (즐겨찾기 토글 포함)
- [x] 로그인/회원가입 페이지
- [x] 구글 소셜 로그인
- [x] JWT 토큰 관리 (useAuth 훅)
- [x] 마이페이지 (사이드바 레이아웃)
- [x] 즐겨찾기 조회/삭제

### 예정
- [ ] 가격 히스토리 차트 (DB 누적 데이터)
- [ ] 고가/저가 통계 표시
- [ ] 비밀번호 변경 API 연동
- [ ] 내 정보 GraphQL 조회 (me Query)
