# 📘 components 디렉터리 정리 (`src/components/`)

## 0. 전체 구조: `App.tsx` → `RouterProvider`

**App은 틀만 잡고, 어떤 페이지를 보여 줄지는 `RouterProvider`가 주소(path)를 보고 고릅니다.**

```tsx
// App.tsx
function App() {
  return (
    <div className={S.app}>
      <RouterProvider navigation={<Header />} routes={routes} />   {/* 헤더 + 현재 페이지 */}
      <Footer />
    </div>
  );
}
```

```
main.tsx
 └─ App.tsx
     ├─ RouterProvider (router/RouterProvider/index.tsx)  ← RouterContext 공급
     │   ├─ navigation = <Header />
     │   │    └─ routes.map → <NavLink />  ← RouterContext 사용
     │   └─ routeElement = <Home /> | <Product /> | <Login /> | <Register /> | <NotFound />
     └─ <Footer />
```

| 위치 | 파일 | 함수 | 역할 |
| --- | --- | --- | --- |
| `components/Layout/` | `Header.tsx` | `Header()` | 로고 + `routes`로 메뉴 자동 생성 |
| `components/Layout/` | `Footer.tsx` | `Footer()` | 하단 영역(내용 없음) |
| `components/` | `NavLink.tsx` | `NavLink(props)` | 새로고침 없이 페이지 이동하는 링크 |
| `pages/` | `Home.tsx` | `Home()` | 메인 비주얼 + GSAP 애니메이션 |
| `pages/` | `Product.tsx` | `Product()` | Supabase에서 상품 목록 가져오기 |
| `pages/` | `Login.tsx`, `Register.tsx` | `Login()`, `Register()` | 자리만 잡아 둔 빈 페이지 |

- 라우터 라이브러리(react-router) 없이 **Context + `history.pushState`로 직접 만든 SPA 라우터**입니다.
- `router.tsx`의 `routes` 배열 하나를 Header(메뉴)와 RouterProvider(페이지 선택)가 **같이 씁니다**. 메뉴를 추가하려면 배열에 한 줄만 넣으면 됩니다.

```tsx
// router/router.tsx
export const routes = [
  { title: '메인', path: '/', element: <Home /> },
  { title: '상품목록', path: '/Product', element: <Product /> },
  { title: '고객지원', path: '/Contact', element: <div>CONTACT</div> },
  { title: '로그인', path: '/Login', element: <Login /> },
  { title: '회원가입', path: '/Register', element: <Register /> },
];
```

---

## 1. 메뉴 자동 생성: `Layout/Header.tsx`

**`routes` 배열을 `map`으로 돌려서 `<li><NavLink /></li>`를 만듭니다.**

```tsx
function Header() {
  return (
    <header className={S.header}>
      <h1><img width={100} src="/logo-white.png" alt="" /></h1>
      <nav>
        <h2 className="a11y-hidden">메인 메뉴</h2>   {/* 화면엔 숨기고 스크린리더만 읽음 */}
        <ul>
          {routes.map(({ path, title }) => (         // 구조 분해로 필요한 것만 꺼냄
            <li key={path}>
              <NavLink to={path} className="logo" activeClassName="on">{title}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
```

### ① 함수 구조

| 단계 | 하는 일 |
| --- | --- |
| 입력 | 없음 (props X) — `routes`는 import로 가져옴 |
| 처리 | `routes.map(({ path, title }) => <li>...)` |
| 출력 | `<header>` 안에 로고 + 메뉴 목록 |

- `key`에는 겹치지 않는 `path`를 씁니다.
- `<nav>` 안의 숨긴 `<h2>`는 접근성용 제목입니다(`a11y-hidden` 유틸 클래스).

> ⚠️ 코드 확인: `activeClassName="on"`을 넘기면 NavLink의 기본값 `S.active`가 덮어써집니다. 그런데 `.on`은 CSS 어디에도 없어서 **현재 메뉴 강조(주황색 + 점)가 안 나옵니다.** `Header.module.css`의 `a.active`를 쓰려면 `activeClassName`을 빼야 합니다. `className="logo"`도 정의된 스타일이 없습니다.
>

---

## 2. ⭐ SPA 링크: `NavLink.tsx`

**`<a>`의 기본 이동(새로고침)을 막고, 주소만 바꾼 뒤 Context로 페이지를 교체합니다.**

```tsx
interface Props {
  to: string;
  children: React.ReactNode;
  className?: string;          // ? = 선택 props
  activeClassName?: string;
}

function NavLink({ to, children, activeClassName = S.active, className }: Props) {
  // ① Context에서 현재 경로 + 이동 함수 꺼내기
  const { currentPath, setHistoryRoute } = useContext(RouterContext)!;

  // ② 파생 값 계산
  const isActive = currentPath === to;
  const classNames = `${isActive ? activeClassName : ''} ${className}`.trim();

  // ③ 이벤트 핸들러
  const handleLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();               // 브라우저 기본 이동(새로고침) 막기
    setHistoryRoute(to);              // 보여 줄 페이지 교체
    history.pushState(null, '', to);  // 주소창만 바꾸기 — SPA의 핵심
  };

  // ④ 렌더링
  return <a href={to} className={classNames} onClick={handleLink}>{children}</a>;
}
```

### ① 함수 구조 (컴포넌트 안 4단 구성)

| 순서 | 구역 | 코드 |
| --- | --- | --- |
| ① | 외부 값 가져오기 | `useContext(RouterContext)` |
| ② | 파생 값 계산 | `isActive`, `classNames` |
| ③ | 이벤트 핸들러 | `handleLink` |
| ④ | JSX 반환 | `<a onClick={handleLink}>` |

### ② 클릭하면 일어나는 일

```
<a> 클릭
 → e.preventDefault()          새로고침 X
 → setHistoryRoute('/Product') RouterProvider가 routes에서 찾아 setRouteElement(<Product />)
 → history.pushState(...)      주소창 /Product (뒤로가기 기록도 쌓임)
 → 리렌더링: 페이지 교체 + currentPath 변경 → NavLink의 isActive 다시 계산
```

- `activeClassName = S.active`처럼 **구조 분해에서 기본값**을 줄 수 있습니다.
- `href={to}`는 그대로 둡니다. 새 탭 열기·주소 복사가 되고, 검색 엔진도 링크로 인식합니다.
- 뒤로가기는 RouterProvider가 `popstate` 이벤트를 듣고 `setHistoryRoute`를 다시 부르는 방식으로 처리합니다.

> ⚠️ 코드 확인: `className`을 안 넘기면 `${className}`이 문자열 `"undefined"`가 되어 class에 들어갑니다. `className = ''`처럼 기본값을 주면 막을 수 있습니다. 또 `useContext(...)!`의 `!`는 "null 아님"을 개발자가 장담하는 것이라, Provider 밖에서 쓰면 런타임 에러가 납니다(11장의 `useUserContext`처럼 훅으로 감싸서 `throw`하면 더 안전합니다).
>

---

## 3. 단순 레이아웃: `Layout/Footer.tsx`

**props도 상태도 없이 JSX만 반환하는 가장 단순한 함수 컴포넌트입니다.**

```tsx
import S from './Footer.module.css';

function Footer() {
  return <footer className={S.footer}>footer</footer>;
}
```

- CSS Module(`*.module.css`)은 `S.footer`처럼 **객체로 import**합니다. 클래스명이 자동으로 고유하게 바뀌어 다른 파일과 겹치지 않습니다.


---

---

# 📗 pages 디렉터리 정리 (`src/pages/`)

## 1. `Home.tsx`: useRef + useGSAP 애니메이션

**ref로 범위(scope)를 정하고, 그 안의 `h2`, `span`만 아래에서 위로 차례대로 나타나게 합니다.**

```tsx
function Home() {
  // ① 애니메이션 범위가 될 DOM
  const textRef = useRef<HTMLDivElement>(null);

  // ② 마운트 후 애니메이션 실행
  useGSAP(() => {
    gsap.fromTo('h2, span',
      { y: 50, opacity: 0 },                       // 시작 상태
      { y: 0, opacity: 1, stagger: 0.2, duration: 1, ease: 'Power3.easeInOut' }  // 끝 상태
    );
  }, { scope: textRef });                         // 선택자를 textRef 안에서만 찾음

  // ③ 렌더링
  return (
    <div className={S.container}>
      <div ref={textRef}>
        <h2><strong>예쁜 건 죄가 아니잖아요?</strong></h2>
        <span>하지만 카드값은 유죄입니다.</span>
      </div>
      <img src="https://framerusercontent.com/images/..." alt="" />
    </div>
  );
}
```

### ① 함수 구조

| 순서 | 구역 | 코드 |
| --- | --- | --- |
| ① | DOM 참조 | `useRef<HTMLDivElement>(null)` |
| ② | 부수 효과(애니메이션) | `useGSAP(fn, { scope })` |
| ③ | JSX 반환 | 텍스트 묶음 + 배경 이미지 |

### ② `gsap.fromTo` 옵션

| 옵션 | 뜻 |
| --- | --- |
| `y: 50 → 0` | 50px 아래에서 제자리로 |
| `opacity: 0 → 1` | 투명 → 보임 |
| `stagger: 0.2` | 대상이 여러 개면 0.2초씩 시차를 두고 시작 |
| `duration: 1` | 1초 동안 |
| `ease` | 가속/감속 곡선 |

- `useGSAP`은 GSAP 전용 `useEffect`라고 보면 됩니다. 언마운트될 때 애니메이션을 **자동으로 정리(cleanup)** 해 줍니다.
- ⭐ `scope: textRef`를 주면 `'h2, span'`을 문서 전체가 아니라 **textRef 안에서만** 찾습니다. 다른 페이지의 h2까지 움직이는 일을 막습니다.
- CSS에서 이미지는 `position: absolute; inset: 0; object-fit: cover`로 배경처럼 깔고, `::after` 그라데이션으로 글자를 잘 보이게 합니다.

> ⚠️ 코드 확인: `Home.module.css`에도 `h2`, `span`에 `animation: fade-up`이 걸려 있어서 **CSS 애니메이션과 GSAP이 같은 요소를 동시에 움직입니다.** 둘 중 하나만 남기는 게 좋습니다. `ease`는 최신 표기로 `'power3.inOut'`을 씁니다.
>

---

## 2. ⭐ `Product.tsx`: Supabase에서 데이터 가져오기

**`useEffect` 안에 async 함수를 만들어 호출하고, 받은 데이터를 state에 넣어 `map`으로 그립니다.**

```tsx
function Product() {
  // ① 상태: Supabase 테이블 행(Row) 타입 배열
  const [products, setProducts] = useState<Tables<'products'>[]>([]);

  // ② 마운트 시 한 번 데이터 요청
  useEffect(() => {
    const fetchProducts = async () => {                       // effect 안에서 async 함수 선언
      const { data, error } = await supabase.from('products').select('*');
      if (error) { console.error(error); return; }            // 에러면 일찍 return
      setProducts(data);
    };
    fetchProducts();                                          // 바로 호출
  }, []);

  // ③ 렌더링: 상품 카드 목록
  return (
    <div className={S.container}>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            <a href="/">
              <figure><img src={p.image_url} alt={p.name} /></figure>
              <span className={S.brand}>{p.name}</span>
              <span className={S.description}>{p.description}</span>
              <span className={S.price}>{p.price.toLocaleString()}</span>
              <div>
                <span className={S.discount}>{p.sale}%</span>
                <span className={S.realPrice}>
                  {(p.price * (1 - p.sale / 100)).toLocaleString()}   {/* 할인가 계산 */}
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### ① 함수 구조

| 순서 | 구역 | 코드 |
| --- | --- | --- |
| ① | 상태 | `products` (처음엔 빈 배열 `[]`) |
| ② | 부수 효과 | `useEffect` → `fetchProducts()` |
| ③ | JSX 반환 | `products.map(p => <li>)` |

### ② 왜 `useEffect(async () => ...)`로 안 쓰나요?

```tsx
useEffect(async () => { ... }, []);   // ❌ async 함수는 Promise를 반환 → cleanup 자리에 Promise가 들어감

useEffect(() => {                     // ⭕ 안에서 async 함수를 만들고 호출
  const fetchProducts = async () => { ... };
  fetchProducts();
}, []);
```

- `useEffect`의 콜백은 **아무것도 안 반환하거나 cleanup 함수만** 반환해야 합니다.

### ③ Supabase 관련 구조

| 파일 | 역할 |
| --- | --- |
| `supabase/supabase.tsx` | `createClient<Database>(URL, KEY)`로 클라이언트 1개 만들어 export |
| `supabase/database.types.ts` | Supabase CLI가 DB에서 자동 생성한 타입 |
| `Tables<'products'>` | products 테이블 **한 행**의 타입 (`id`, `name`, `price`, `sale`, `image_url` ...) |

- `supabase.from('테이블').select('*')`는 `{ data, error }`를 돌려줍니다. fetch처럼 `res.ok`, `res.json()`을 직접 처리할 필요가 없습니다.
- URL·KEY는 `.env`의 `VITE_` 접두사 변수에서 `import.meta.env`로 읽습니다.
- 처음 state를 `[]`로 두었기 때문에 데이터가 오기 전에도 `products.map`이 에러 없이 돌아갑니다(빈 목록).

> ⚠️ 코드 확인: 함수 맨 위 `supabase.from('products').select('*').then(console.log);`는 **렌더링할 때마다** 요청을 한 번 더 보냅니다(테스트용 코드라 지워야 함). `const UL = useRef(...)`와 `ref={UL}`은 지금 쓰이지 않습니다. `S.brand`는 CSS에 없는 클래스라 `undefined`가 들어갑니다. 상품 링크가 `<a href="/">`라서 클릭하면 새로고침되며 메인으로 갑니다(상세 페이지가 생기면 `NavLink`로 바꾸면 됩니다).
>

---

## 3. `Login.tsx`, `Register.tsx`: 자리 잡기

**routes에 연결만 해 두고, 내용은 다음 단계에서 채울 빈 페이지입니다.**

```tsx
function Login() {
  return <div>Login</div>;
}

function Register() {
  return <div>Register</div>;
}
```

- 이름만 있어도 메뉴 클릭 → 페이지 전환이 잘 되는지 라우터를 먼저 확인할 수 있습니다.

---

## 🧷 한 줄 요약: 상황별 도구 고르기

| 하고 싶은 것 | 도구 |
| --- | --- |
| 배열 데이터로 메뉴/목록 만들기 | `배열.map(({ a, b }) => <li key={...}>)` |
| 새로고침 없이 페이지 이동 | `e.preventDefault()` + `history.pushState()` + Context |
| 뒤로가기/앞으로가기 대응 | `window.addEventListener('popstate', ...)` |
| 현재 메뉴 강조 | `currentPath === to`로 `isActive` 계산 → class 토글 |
| 선택 props에 기본값 | 구조 분해 `{ activeClassName = S.active }` |
| 특정 영역 안에서만 GSAP 애니메이션 | `useGSAP(fn, { scope: ref })` |
| 여러 요소를 시차 두고 등장 | `gsap.fromTo(..., { stagger })` |
| 마운트 시 DB 데이터 가져오기 | `useEffect` 안에 `async` 함수 선언 후 호출 |
| Supabase 행 타입 | `Tables<'테이블명'>` |
| 파일마다 겹치지 않는 클래스명 | CSS Module `import S from './X.module.css'` |

---

---

# 📘 auth · hook 디렉터리 정리 (`src/components/auth/`, `src/hook/`)

## 0. 전체 구조: `App.tsx` → `AuthProvider` → `RouterProvider`

**로그인 정보(user)는 `AuthProvider`가 Context로 앱 전체에 공급하고, 필요한 곳에서 `useAuth()`로 꺼내 씁니다.**

```tsx
// App.tsx
function App() {
  return (
    <div className={S.app}>
      <AuthProvider>                                            {/* user, isAuth, logout 공급 */}
        <RouterProvider navigation={<Header />} routes={routes} />
        <Footer />
      </AuthProvider>
    </div>
  );
}
```

```
App.tsx
 └─ AuthProvider            ← AuthContext 공급 (user, isAuth, logout)
     ├─ RouterProvider      ← RouterContext 공급 (currentPath, setHistoryRoute)
     │   ├─ <Header />      ← useAuth()  : 인사말 · 메뉴 숨김 · 로그아웃
     │   └─ 페이지
     │       ├─ <Login />    ← supabase.auth.signInWithPassword + setHistoryRoute
     │       ├─ <Register /> ← supabase.auth.signUp + storage.upload
     │       └─ <Product />  ← useProducts() 커스텀 훅
     └─ <Footer />
```

| 위치 | 파일 | 함수 | 역할 |
| --- | --- | --- | --- |
| `components/auth/` | `AuthProvider.tsx` | `AuthProvider()`, `useAuth()` | 로그인 유저 상태 공급 + 꺼내 쓰는 훅 |
| `components/Layout/` | `Header.tsx` | `Header()` | 로그인 여부에 따라 메뉴 · 인사말 · 로그아웃 |
| `hook/` | `useProducts.ts` | `useProducts()` | 상품 목록 가져오기 로직을 훅으로 분리 |
| `pages/` | `Login.tsx` | `Login()` | 이메일 · 비밀번호 로그인 |
| `pages/` | `Register.tsx` | `Register()` | 회원가입 + 프로필 이미지 업로드 |
| `pages/` | `Product-teach.tsx` | `Product()` | 컴포넌트 안에서 직접 fetch (강사 버전) |
| `pages/` | `Product.tsx` | `Product()` | 커스텀 훅 + GSAP (리팩터링 버전) |

- Provider 순서가 중요합니다. `Header`는 RouterProvider 안에 있고, 그 바깥을 `AuthProvider`가 감싸고 있어서 `useAuth()`를 쓸 수 있습니다.

---

## 1. ⭐ 인증 Context: `auth/AuthProvider.tsx`

**`createContext` → Provider 컴포넌트 → `useAuth` 훅, 3단 구조로 만듭니다.**

```tsx
// ① 타입 정의
interface User {
  id: string;
  email: string;
  nickname: string;
}

interface AuthContextType {
  user: User | null;
  isAuth: boolean;
  logout: () => void;
}

// ② Context 만들기 (기본값 null)
const AuthContext = createContext<AuthContextType | null>(null);

// ③ Provider 컴포넌트
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // 마운트 시 한 번: 현재 로그인 유저 확인
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {      // 중첩 구조 분해
      if (user) {
        setUser({
          id: user.id,
          email: user.email!,
          nickname: user.user_metadata.nickname ?? user.email!.split('@')[0],  // 없으면 이메일 앞부분
        });
      }
    });
  }, []);

  // 로그아웃: supabase 세션 삭제 → 상태 비우기
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext value={{ user, isAuth: !!user, logout }}>   {/* React 19: .Provider 생략 가능 */}
      {children}
    </AuthContext>
  );
}

// ④ 꺼내 쓰는 커스텀 훅
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다.');
  return ctx;                                               // 여기서부터 타입이 null 아님
}
```

### ① 함수 구조

| 순서 | 구역 | 코드 |
| --- | --- | --- |
| ① | 타입 | `User`, `AuthContextType` |
| ② | Context 생성 | `createContext<... \| null>(null)` |
| ③-1 | 상태 | `user` (처음엔 `null`) |
| ③-2 | 부수 효과 | `useEffect` → `supabase.auth.getUser()` |
| ③-3 | 동작 함수 | `logout` → `signOut()` + `setUser(null)` |
| ③-4 | JSX 반환 | `<AuthContext value={...}>{children}</AuthContext>` |
| ④ | 훅 | `useAuth()`: null이면 `throw` |

### ② 파생 값 `isAuth: !!user`

| `user` | `!user` | `!!user` |
| --- | --- | --- |
| `{ id, email, ... }` | `false` | `true` |
| `null` | `true` | `false` |

- `isAuth`를 state로 따로 만들지 않습니다. `user`에서 **계산할 수 있는 값은 계산**합니다. 그래서 `setUser(null)` 한 번으로 `isAuth`도 같이 `false`가 됩니다.

### ③ supabase.auth 함수 정리

| 함수 | 하는 일 | 사용 위치 |
| --- | --- | --- |
| `signUp({ email, password, options: { data } })` | 회원가입 (`data`는 `user_metadata`에 저장) | Register |
| `signInWithPassword({ email, password })` | 로그인 → 세션을 localStorage에 저장 | Login |
| `getUser()` | 현재 세션의 유저 조회 | AuthProvider |
| `signOut()` | 세션 삭제 | AuthProvider `logout` |

- `user_metadata.nickname`은 Register에서 `options.data.nickname`으로 넣은 값입니다.
- `??`는 왼쪽이 `null`/`undefined`일 때만 오른쪽을 씁니다 (`||`와 달리 빈 문자열은 그대로 둠).

> ⚠️ 코드 확인: `getUser()`는 **마운트될 때 한 번만** 실행됩니다. Login에서 새로고침 없이 `setHistoryRoute('/')`로 이동하면 AuthProvider는 그대로라서 **user가 `null`인 채로 남고, Header 인사말과 로그아웃 버튼이 안 나옵니다**(새로고침해야 보임). `useEffect` 안에서 `supabase.auth.onAuthStateChange((event, session) => setUser(...))`를 구독하면 로그인 · 로그아웃이 자동으로 반영됩니다. 또 `logout`은 async 함수라 타입을 `() => Promise<void>`로 쓰는 게 정확합니다.
>

---

## 2. ⭐ 커스텀 훅: `hook/useProducts.ts`

**컴포넌트에 있던 "상태 + useEffect + fetch" 묶음을 `use`로 시작하는 함수로 빼고, 필요한 값만 객체로 반환합니다.**

```ts
type ProductRow = Database['public']['Tables']['products']['Row'];          // 테이블 한 행 전체
type ProductItem = Pick<ProductRow, 'id' | 'name' | 'price' | 'image_url' | 'sale' | 'description'>;  // 필요한 컬럼만

function useProducts() {
  // ① 상태
  const [products, setProducts] = useState<ProductItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  // ② 부수 효과: 데이터 요청
  useEffect(() => {
    let ignore = false;                                    // 늦게 도착한 응답 무시용 플래그

    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, sale, image_url, description');   // 필요한 컬럼만 요청

      if (ignore) return;                                  // 이미 정리됐으면 state 안 건드림

      if (data) setProducts(data);
      setLoading(false);

      if (error) {
        console.warn('상품 정보 불러오기 실패', error);
        return null;
      }
    };

    fetchProducts();
    return () => { ignore = true; };                       // cleanup
  }, []);

  // ③ 반환
  return { products, loading };
}
```

### ① 함수 구조

| 단계 | 하는 일 |
| --- | --- |
| 입력 | 없음 |
| 처리 | `products`, `loading` 상태 + `useEffect`로 Supabase 요청 |
| 출력 | `{ products, loading }` 객체 |

### ② `ignore` 플래그 (경쟁 상태 방지)

```
마운트 → fetchProducts() 요청 출발
   ↓ (응답 오기 전에 페이지 이동 = 언마운트, 또는 StrictMode 재실행)
cleanup 실행 → ignore = true
   ↓
응답 도착 → if (ignore) return   ← 사라진 컴포넌트의 state를 건드리지 않음
```

- 개발 모드 `StrictMode`는 effect를 **마운트 → 정리 → 다시 마운트** 순서로 두 번 실행합니다. 첫 번째 요청의 응답은 `ignore`로 버려지고, 두 번째 요청의 응답만 반영됩니다.

### ③ Supabase 타입 고르기

| 쓰임 | 타입 |
| --- | --- |
| 조회 (행 전체) | `Tables<'products'>` = `Database['public']['Tables']['products']['Row']` |
| 생성 | `TablesInsert<'products'>` |
| 수정 | `TablesUpdate<'products'>` |
| 일부 컬럼만 | `Pick<Row, 'id' \| 'name' ...>` |

- `select('*')` 대신 컬럼을 콕 집어 요청하면 받는 데이터 양도 줄고, 타입(`ProductItem`)과도 딱 맞습니다.
- 훅 이름은 반드시 `use`로 시작해야 React가 훅으로 인식합니다(훅 규칙 검사 대상).

> ⚠️ 코드 확인: `error` 검사가 `setLoading(false)` **뒤**에 있어서 순서가 어색합니다. `if (error) { ...; setLoading(false); return; }`를 먼저 두는 게 읽기 쉽습니다. `return null`은 async 함수의 반환값을 아무도 안 쓰므로 `return`만 있으면 됩니다.
>

---

---

# 📗 pages · Layout 정리 2 (`src/pages/`, `src/components/Layout/`)

## 1. `Layout/Header.tsx`: 로그인 상태에 따라 바뀌는 메뉴

**`useAuth()`로 `user`, `isAuth`, `logout`을 꺼내서 ① 메뉴 거르기 ② 인사말 ③ 로그아웃 버튼에 씁니다.**

```tsx
function Header() {
  // ① Context에서 꺼내기
  const { user, isAuth, logout } = useAuth();

  // ② 파생 값: 로그인했으면 '로그인', '회원가입' 메뉴 숨기기
  const hideWhenLoggedIn = ['로그인', '회원가입'];
  const visibleRoutes = routes.filter(
    ({ title }) => !(isAuth && hideWhenLoggedIn.includes(title))
  );

  // ③ 렌더링
  return (
    <header className={S.header}>
      <h1><img width={100} src="/logo-white.png" alt="" /></h1>
      <nav>
        <h2 className="a11y-hidden">메인 메뉴</h2>
        {user && <p className={S.greeting}>{user.nickname}님 반갑습니다 😄</p>}
        <ul>
          {visibleRoutes.map(({ path, title }) => (
            <li key={path}><NavLink to={path}>{title}</NavLink></li>
          ))}
          {isAuth && (                                       // 로그인했을 때만
            <li>
              <a href="#" onClick={(e) => {
                e.preventDefault();
                if (confirm('너... 진짜 떠날꺼야? 넌 예쁘지 않아 죄를 지었어')) {
                  logout();                                  // signOut + setUser(null)
                }
              }}>로그아웃</a>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
```

### ① 함수 구조

| 순서 | 구역 | 코드 |
| --- | --- | --- |
| ① | 외부 값 | `useAuth()` → `user`, `isAuth`, `logout` |
| ② | 파생 값 | `visibleRoutes = routes.filter(...)` |
| ③ | JSX 반환 | 인사말 + 메뉴 + 로그아웃 |

### ② filter 조건 풀어 읽기

| `isAuth` | title이 로그인/회원가입? | `isAuth && includes` | `!(...)` → 보임? |
| --- | --- | --- | --- |
| `false` | 예 | `false` | ✅ 보임 |
| `true` | 예 | `true` | ❌ 숨김 |
| `true` | 아니오 | `false` | ✅ 보임 |

### ③ 로그아웃 흐름

```
로그아웃 클릭 → e.preventDefault() → confirm 확인
 → logout()  (AuthProvider)
     → supabase.auth.signOut()   세션 삭제
     → setUser(null)             user = null, isAuth = false
 → Context를 쓰는 Header 리렌더링 → 인사말 사라짐 · 로그인/회원가입 메뉴 다시 보임
```

> ⚠️ 코드 확인: 이동이 아니라 동작(로그아웃)을 하는 요소에는 `<a href="#">`보다 `<button type="button">`이 의미에 맞습니다(접근성). `S.greeting`은 `Header.module.css`에 없는 클래스입니다. 로그아웃 후에는 현재 페이지에 그대로 머무르므로, 필요하면 `history.pushState(null, '', '/')` + `setHistoryRoute('/')`로 메인으로 보냅니다.
>

---

## 2. ⭐ `Login.tsx`: 상태 → 이벤트 → 통신 → 리다이렉트

**폼 처리 4단계(상태 설정 → 이벤트 바인딩 → supabase 통신 → redirect)를 그대로 코드로 옮긴 페이지입니다.**

```tsx
function Login() {
  const userId = useId();
  const pwId = useId();

  // 1. 상태 설정하기
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { setHistoryRoute } = useContext(RouterContext)!;     // 페이지 이동 함수

  // 2. 이벤트 바인딩하기 (onSubmit)
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 3. supabase 통신하기
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.log(error);
      setError(error.message);
    } else {
      // 4. redirect 하기
      Swal.fire({
        icon: 'success',
        title: '로그인 성공!',
        text: '확인을 누르면 메인 페이지로 이동합니다.',
        iconColor: '#FD98AF',
        confirmButtonColor: '#FD98AF',
      }).then(() => {
        history.pushState(null, '', '/');   // 주소 바꾸기
        setHistoryRoute('/');                 // 화면 바꾸기
      });
    }
  };

  return (
    <div className={S.container}>
      <form onSubmit={handleLogin}>
        <input id={userId} type="email" value={email}
               onChange={(e) => setEmail(e.target.value)} />       {/* controlled */}
        <input id={pwId} type="password" value={password}
               onChange={(e) => setPassword(e.target.value)} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">로그인</button>
        <a href="" onClick={(e) => {
          e.preventDefault();
          history.pushState(null, '', '/Register');
          setHistoryRoute('/Register');
        }}>아직도 효블리 회원이 아니세요?</a>
      </form>
    </div>
  );
}
```

### ① 함수 구조 (4단계)

| 단계 | 구역 | 코드 |
| --- | --- | --- |
| 1 | 상태 | `email`, `password`, `error` + `useContext(RouterContext)` |
| 2 | 이벤트 바인딩 | `<form onSubmit={handleLogin}>`, input `onChange` |
| 3 | 통신 | `await supabase.auth.signInWithPassword(...)` |
| 4 | 리다이렉트 | `Swal.fire().then(() => pushState + setHistoryRoute)` |

### ② controlled component

| 연결 | 역할 |
| --- | --- |
| `value={email}` | state → input (화면에 보이는 값 = state) |
| `onChange={(e) => setEmail(e.target.value)}` | input → state (타이핑하면 state 갱신) |

### ③ 페이지 이동 2가지 방식 비교

| 방식 | 코드 | 특징 |
| --- | --- | --- |
| 새로고침 이동 | `history.pushState(...)` + `location.reload()` | 앱 전체가 다시 시작 → AuthProvider `getUser()`도 다시 실행 |
| SPA 이동 | `history.pushState(...)` + `setHistoryRoute(...)` | 새로고침 없음 → 빠르지만 Context 상태는 그대로 |

- `await`는 반드시 **async 함수 안**에서만 씁니다. 컴포넌트 본문에 바로 쓰면 에러가 나고, 렌더링할 때마다 요청이 나갑니다.
- 반환값 `{ error }`가 state `error`와 이름이 같아서 핸들러 안에서는 **바깥 state를 가립니다**(shadowing). `error: loginError`처럼 이름을 바꿔 받으면 헷갈리지 않습니다.

> ⚠️ 코드 확인: SPA 방식으로 이동하기 때문에 AuthProvider의 `user`가 갱신되지 않아서 **로그인 직후 Header에 인사말과 로그아웃이 안 보입니다**(1장 AuthProvider 참고 → `onAuthStateChange`로 해결). 다시 시도할 때 이전 에러 메시지가 남지 않도록 핸들러 처음에 `setError(null)`을 넣으면 좋습니다.
>

---

## 3. `Register.tsx`: 회원가입 + 프로필 이미지 업로드

**검증 → `signUp` → (이미지 있으면) `storage.upload` → 성공 알림 → 로그인 페이지로 이동 순서로 진행하고, 단계마다 실패하면 바로 `return`합니다.**

```tsx
function Register() {
  // ① 상태 (controlled component)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);       // 업로드할 파일
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null); // 미리보기 URL
  const [error, setError] = useState<string | null>(null);

  // ② 제출 핸들러
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // ②-1 검증
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // ②-2 회원가입 (닉네임은 user_metadata에)
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname } },
    });

    if (signUpError || !user) {
      setError(signUpError?.message || '회원가입에 실패했습니다.');
      return;
    }

    // ②-3 프로필 이미지 업로드 (파일명 = 유저 id.확장자)
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();     // 'cat.png' → 'png'
      const filePath = `${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')                                    // 버킷 이름
        .upload(filePath, avatarFile, { upsert: true });    // 같은 이름이면 덮어쓰기

      if (uploadError) {
        setError('이미지 업로드에 실패했습니다.');
        return;
      }
    }

    // ②-4 성공 → 로그인 페이지로
    Swal.fire({ icon: 'success', title: '로그인 성공!', ... }).then(() => {
      history.pushState(null, '', './Login');
      location.reload();
    });
  };

  // ③ 렌더링 (파일 input 부분)
  return (
    <input type="file" accept="image/*" onChange={(e) => {
      const file = e.target.files?.[0] ?? null;            // 선택한 첫 파일
      setAvatarFile(file);

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result as string);  // base64 URL
        reader.readAsDataURL(file);
      } else {
        setAvatarPreview(null);
      }
    }} />
    // {avatarPreview && <img src={avatarPreview} />}
  );
}
```

### ① 함수 구조

| 순서 | 구역 | 코드 |
| --- | --- | --- |
| ① | 상태 | 입력값 4개 + 파일 · 미리보기 + 에러 |
| ②-1 | 검증 | 비밀번호 확인 불일치 → `return` |
| ②-2 | 통신 1 | `supabase.auth.signUp` |
| ②-3 | 통신 2 | `supabase.storage.from('avatars').upload` |
| ②-4 | 리다이렉트 | `Swal` → `pushState` + `reload` |
| ③ | JSX | 폼 + 파일 미리보기 + 에러 메시지 |

### ② early return 패턴

```
검증 실패? ── yes → setError → return
   │no
signUp 실패? ── yes → setError → return
   │no
업로드 실패? ── yes → setError → return
   │no
성공 처리
```

- `if-else`를 깊게 중첩하지 않고 **실패하면 바로 빠져나가기** 때문에 코드가 위에서 아래로 읽힙니다.

### ③ 파일 미리보기 (`FileReader`)

| 코드 | 뜻 |
| --- | --- |
| `e.target.files?.[0]` | 선택한 파일 목록의 첫 번째 (없으면 `undefined`) |
| `?? null` | `undefined` → `null`로 통일 (state 타입 `File \| null`) |
| `reader.readAsDataURL(file)` | 파일을 `data:image/png;base64,...` 문자열로 읽기 시작 |
| `reader.onloadend` | 다 읽으면 실행 → `reader.result`를 미리보기 state에 |

- 파일 input은 보안상 `value`를 state로 제어할 수 없습니다. 그래서 `onChange`에서 파일만 꺼내 저장합니다.
- 회원가입이 `email rate limit exceeded`(429)로 실패하면 코드 문제가 아닙니다. Supabase 기본 메일 서버의 **시간당 발송 제한**에 걸린 것입니다. 개발 중에는 대시보드에서 **Confirm email**을 꺼 두면 됩니다.

> ⚠️ 코드 확인: Swal 제목이 `'로그인 성공!'`인데 `'회원가입 성공!'`이 맞습니다. `iconColor: '#FD98A'`는 5자리라 잘못된 색입니다(`'#FD98AF'`). 이동 경로 `'./Login'`은 상대 경로라 `'/Login'`으로 쓰는 게 안전합니다. 또 이메일 인증이 켜져 있으면 `signUp` 직후에는 세션이 없습니다. 그래서 `avatars` 버킷의 RLS 정책이 "로그인한 사용자만 업로드"라면 업로드가 실패할 수 있습니다.
>

---

## 4. `Product-teach.tsx` vs `Product.tsx`: 커스텀 훅으로 리팩터링

**같은 상품 목록인데, 데이터 로직을 컴포넌트 안에 두느냐(teach), 훅으로 빼느냐(Product)의 차이입니다.**

### ① `Product-teach.tsx`: 컴포넌트 안에서 직접 가져오기

```tsx
function Product() {
  supabase.from('products').select('*').then(console.log);    // 확인용

  const [products, setProducts] = useState<Tables<'products'>[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) { console.error(error); return; }
      setProducts(data);
    };
    fetchProducts();
  }, []);

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          ...
          <span className={S.realPrice}>{(p.price * (1 - p.sale / 100)).toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}
```

### ② `Product.tsx`: 훅 + 로딩 + GSAP

```tsx
function Product() {
  // ① 데이터는 훅에서
  const { products, loading } = useProducts();

  // ② 애니메이션 범위
  const UL = useRef<HTMLUListElement>(null);

  // ③ products가 바뀔 때마다 li 등장 애니메이션
  useGSAP(() => {
    gsap.fromTo('li', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1 });
  }, { dependencies: [products], scope: UL, revertOnUpdate: true });

  // ④ 로딩 중이면 먼저 반환
  if (loading) return <p>loading.....</p>;

  // ⑤ 렌더링
  return (
    <div className={S.container}>
      <ul ref={UL}>
        {products && products.map((item) => (
          <li key={item.id}>
            ...
            <span className={S.price}>{item.price.toLocaleString()}원</span>
            <span className={S.realPrice}>
              {(item.price - item.price * item.sale * 0.01).toLocaleString()}원
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### ③ 두 버전 비교

| 항목 | `Product-teach.tsx` | `Product.tsx` |
| --- | --- | --- |
| 데이터 로직 위치 | 컴포넌트 안 `useEffect` | `useProducts()` 훅 |
| 초기값 | `[]` (바로 map 가능) | `null` → `products &&`로 확인 |
| 로딩 표시 | 없음 | `loading` → `<p>loading.....</p>` |
| 늦은 응답 처리 | 없음 | `ignore` 플래그 |
| 요청 컬럼 | `select('*')` | 필요한 6개만 |
| 애니메이션 | 없음 | `useGSAP` + `stagger` |
| 할인가 계산 | `price * (1 - sale/100)` | `price - price * sale * 0.01` (결과 같음) |

### ④ `useGSAP` 옵션

| 옵션 | 뜻 |
| --- | --- |
| `dependencies: [products]` | products가 바뀌면 애니메이션 다시 실행 (데이터가 도착해야 li가 생기니까) |
| `scope: UL` | `'li'`를 UL 안에서만 찾음 (Header의 li는 안 움직임) |
| `revertOnUpdate: true` | 다시 실행하기 전에 이전 애니메이션을 원래대로 되돌림 |

- ⭐ 훅(`useProducts`, `useRef`, `useGSAP`)은 **모두 `if (loading) return` 위에** 있습니다. 조건부 return 아래에 훅을 두면 렌더링마다 훅 개수가 달라져서 에러가 납니다(훅 규칙).

> ⚠️ 코드 확인: `Product-teach.tsx` 맨 위의 `supabase.from(...).then(console.log)`는 **렌더링할 때마다** 요청을 보내니 지워야 합니다. teach 버전의 `UL` ref는 쓰이지 않습니다. `Product.tsx`에서는 `loading`일 때 `<ul ref={UL}>`가 없다가 나중에 생기는데, `dependencies: [products]` 덕분에 데이터가 들어온 뒤 애니메이션이 다시 실행되어 정상 동작합니다.
>

---

## 🧷 한 줄 요약: 인증 · 데이터 도구 고르기

| 하고 싶은 것 | 도구 |
| --- | --- |
| 로그인 유저를 앱 전체에 공유 | `createContext` + `AuthProvider` + `useAuth()` |
| Provider 밖에서 쓰면 바로 알기 | 훅 안에서 `if (!ctx) throw new Error(...)` |
| 상태에서 계산되는 값 | 따로 state 말고 `isAuth: !!user` |
| 회원가입 / 로그인 / 로그아웃 | `auth.signUp` / `auth.signInWithPassword` / `auth.signOut` |
| 현재 로그인 유저 확인 | `auth.getUser()` (자동 반영은 `onAuthStateChange`) |
| 가입 시 추가 정보 저장 | `signUp({ options: { data: { nickname } } })` → `user_metadata` |
| 파일 업로드 | `storage.from('버킷').upload(경로, 파일, { upsert: true })` |
| 이미지 미리보기 | `FileReader.readAsDataURL` + `onloadend` |
| 입력값을 state로 제어 | controlled component (`value` + `onChange`) |
| 폼 제출 처리 | `onSubmit` + `e.preventDefault()` + async 핸들러 |
| 실패하면 빨리 빠져나가기 | early return (`if (error) { setError(); return; }`) |
| 로그인 여부로 메뉴 거르기 | `routes.filter(({ title }) => !(isAuth && 목록.includes(title)))` |
| 데이터 로직 재사용 | 커스텀 훅 `useXxx()` → `{ data, loading }` 반환 |
| 늦게 온 응답 무시 | `let ignore = false` + cleanup에서 `ignore = true` |
| 필요한 컬럼 타입만 | `Pick<Tables<'products'>, 'id' \| 'name'>` |
| 데이터 도착 후 애니메이션 | `useGSAP(fn, { dependencies: [data], scope, revertOnUpdate })` |
