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

---

---

# 📘 router · auth · api 정리 3 (`src/router/`, `src/components/auth/`, `src/api/`)

## 0. 전체 구조: 상품 목록 → 상세 / 등록 흐름

**이번에 추가된 건 "주소에 id를 담아 상세 페이지로 가기(동적 라우팅)"와 "상품 등록(insert)"입니다.**

```
App.tsx
 └─ AuthProvider            로그인 유저 공유 (+ onAuthStateChange로 자동 반영)
     └─ RouterProvider      routes 매칭 (+ '/Product/:id' 동적 매칭, params 공유)
         ├─ Header          아바타 표시, '상품상세'·'상품등록'은 메뉴에서 숨김
         └─ 현재 페이지
             ├─ /Product        Product.tsx        목록 (로그인 필요)
             │    ├─ 상품 클릭 → /Product/abc123 → ProductDetail.tsx  (select + update)
             │    └─ + 상품 등록 → /Create        → CreateProduct.tsx  (storage upload + insert)
             └─ ...
```

| 파일 | 바뀐 점 |
| --- | --- |
| `App.tsx` | `import RouterProvider` → `import { RouterProvider }` (default export 삭제) |
| `router/router.tsx` | `/Create`, `/Product/:id` 라우트 추가 |
| `router/RouterProvider/index.tsx` | `matchRoute`, `params`, `useRouter()`, `useParams()` 추가 |
| `auth/AuthProvider.tsx` | `onAuthStateChange` 구독 추가 |
| `api/getAvatarUrl.ts` | 🆕 유저 id로 아바타 공개 URL 찾기 |
| `Layout/Header.tsx` | 아바타 표시 + `alwayHidden` 메뉴 |
| `pages/Product.tsx` (+css) | 로그인 가드, 상세 이동, 등록 버튼 |
| `pages/ProductDetail.tsx` (+css) | 🆕 단건 조회 + 이름 수정 |
| `pages/CreateProduct.tsx` (+css) | 🆕 상품 등록 폼 |

---

## 1. ⭐ 동적 라우팅: `router/RouterProvider/index.tsx`

**`/Product/:id`처럼 `:이름`이 들어간 path를 정규식으로 바꿔서 매칭하고, 꺼낸 값을 `params`로 공유합니다.**

```tsx
const [params, setParams] = useState<Record<string, string>>({});

const matchRoute = (to: string) => {
  for (const route of routes) {
    if (route.path.includes(":")) {                                   // 동적 라우트
      const paramNames =
        route.path.match(/:\w+/g)?.map((p) => p.slice(1)) ?? [];      // ['id']
      const pattern = new RegExp(
        "^" + route.path.replace(/:\w+/g, "([^/]+)") + "$"            // /^\/Product\/([^/]+)$/
      );
      const match = to.match(pattern);                                // ['/Product/abc', 'abc']
      if (match) {
        const params: Record<string, string> = {};
        paramNames.forEach((name, i) => {
          params[name] = match[i + 1];                                // { id: 'abc' }
        });
        return { route, params };
      }
    } else {                                                          // 정적 라우트 (기존 방식)
      if (route.path === to || `/${route.path}` === to) {
        return { route, params: {} };
      }
    }
  }
  return { route: null, params: {} };
};

const setHistoryRoute = useCallback((to: string) => {
  const { route, params } = matchRoute(to);
  if (route) {
    document.title = route.title;
    setRouteElement(route.element);
  } else {
    setRouteElement(<NotFound />);
  }
  setCurrentPath(to);
  setParams(params);                // ✅ 파라미터 저장
  setNavKey((k) => k + 1);
}, [routes]);

const value = useMemo(
  () => ({ setHistoryRoute, currentPath, params }),
  [setHistoryRoute, currentPath, params]
);
```

### ① 정규식 변환 과정

| 단계 | 코드 | 결과 (`path = '/Product/:id'`, `to = '/Product/abc123'`) |
| --- | --- | --- |
| 1 | `path.match(/:\w+/g)` | `[':id']` |
| 2 | `.map(p => p.slice(1))` | `['id']` (파라미터 이름) |
| 3 | `path.replace(/:\w+/g, '([^/]+)')` | `'/Product/([^/]+)'` (`/`가 아닌 글자 1개 이상을 캡처) |
| 4 | `new RegExp('^' + ... + '$')` | 처음부터 끝까지 정확히 일치해야 함 |
| 5 | `to.match(pattern)` | `['/Product/abc123', 'abc123']` |
| 6 | `params[name] = match[i + 1]` | `{ id: 'abc123' }` (`match[0]`은 전체 문자열이라 `+1`) |

- `^`와 `$`가 있어서 `/Product`는 `/Product/:id`에 매칭되지 않습니다. 그래서 router.tsx에서 순서가 바뀌어도 서로 헷갈리지 않습니다.

### ② ⭐ 커스텀 훅 `useRouter()`, `useParams()`

```tsx
export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter는 RouterProvider 안에서만 사용해야 합니다.");
  return ctx;                       // { setHistoryRoute, currentPath, params }
}

export function useParams() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useParams는 RouterProvider 안에서만 사용해야 합니다.");
  return ctx.params;                // { id: 'abc123' }
}
```

| 전 | 후 |
| --- | --- |
| `const { setHistoryRoute } = useContext(RouterContext)!;` | `const { setHistoryRoute } = useRouter();` |
| `!`(non-null 단언)로 null을 무시 | Provider 밖이면 에러로 바로 알려줌 |

- `useAuth()`와 같은 패턴입니다. Context + null 체크를 훅 하나로 감싸서 쓰는 쪽 코드를 짧게 만듭니다.
- 이 파일에 훅이 추가되면서 `export default RouterProvider`를 지웠습니다. 그래서 `App.tsx`가 `import { RouterProvider }`(named import)로 바뀌었습니다.

> ⚠️ 코드 확인: `matchRoute`가 `useCallback` 바깥에 있어서 의존성 경고를 `eslint-disable`로 끄고 있습니다. `matchRoute`를 `useCallback` 안으로 옮기면 주석 없이 `[routes]`만으로 해결됩니다. 경로 비교는 대소문자를 구분하므로 `/product/abc`는 NotFound가 됩니다.
>

---

## 2. `router/router.tsx`: 라우트 추가

**path에 `:id`를 쓰면 동적 라우트가 됩니다.**

```tsx
export const routes = [
  { title: '홈',       path: '/',            element: <Home /> },
  { title: '상품등록', path: '/Create',      element: <CreateProduct /> },
  { title: '상품상세', path: '/Product/:id', element: <ProductDetail /> },  // 동적 라우팅
  { title: '상품목록', path: '/Product',     element: <Product /> },
  // 로그인, 회원가입 ...
];
```

- routes 배열은 메뉴 자동 생성에도 쓰입니다. 그래서 '상품상세', '상품등록'은 Header에서 따로 숨겨야 합니다(📗 1번 참고).

---

## 3. `auth/AuthProvider.tsx`: `onAuthStateChange` 구독

**로그인/로그아웃이 일어나면 Supabase가 알려주도록 구독하고, cleanup에서 구독을 해제합니다.**

```tsx
useEffect(() => {
  // ① 처음 한 번: 현재 로그인 유저 확인
  supabase.auth.getUser().then(({ data: { user } }) => { if (user) setUser({ ... }) });

  // ② 이후 변화 감지
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email!,
        nickname: session.user.user_metadata.nickname ?? session.user.email!.split('@')[0],
      });
    } else if (event === 'SIGNED_OUT') {
      setUser(null);
    }
  });

  // ③ 정리: 컴포넌트가 사라지면 구독 해제
  return () => data.subscription.unsubscribe();
}, []);
```

| event | 언제 | 처리 |
| --- | --- | --- |
| `SIGNED_IN` | 로그인 성공 | `setUser({...})` |
| `SIGNED_OUT` | 로그아웃 | `setUser(null)` |
| `INITIAL_SESSION` | 구독 직후 1번 | (처리 안 함, ①의 `getUser`가 담당) |

- ⭐ 구독(subscribe)을 만들면 반드시 cleanup에서 해제(unsubscribe)합니다. 안 하면 StrictMode나 재마운트 때 리스너가 계속 쌓입니다. `addEventListener` ↔ `removeEventListener`와 같은 짝입니다.
- 덕분에 Login에서 로그인하면 새로고침 없이 Header, Product가 바로 바뀝니다.

> ⚠️ 코드 확인: `setUser({...})` 객체를 만드는 코드가 ①과 ②에 똑같이 두 번 있습니다. `toUser(user)` 같은 함수로 빼면 한 곳만 고치면 됩니다.
>

---

## 4. 🆕 `api/getAvatarUrl.ts`: 아바타 URL 찾기

**회원가입 때 `${userId}.${확장자}`로 올린 파일을 `list`로 찾고 `getPublicUrl`로 주소를 만듭니다.**

```ts
export async function getAvatarUrl(userId: string): Promise<string | null> {
  // ① 버킷에서 userId가 들어간 파일 목록 검색
  const { data: files, error: listError } = await supabase.storage
    .from('avatars')
    .list("", { limit: 10, search: userId });

  if (listError || !files) { console.error('파일 목록 불러오기 실패:', listError); return null; }

  // ② userId로 시작하는 파일 고르기 (확장자를 몰라도 됨)
  const matchedFile = files.find((file) => file.name.startsWith(userId));
  if (!matchedFile) { console.warn(`userId로 시작하는 이미지가 없습니다: ${userId}`); return null; }

  // ③ 공개 URL 만들기 (네트워크 요청 없음, 동기)
  const { data } = supabase.storage.from('avatars').getPublicUrl(matchedFile.name);
  return data?.publicUrl || null;
}
```

| storage 메서드 | 역할 | await |
| --- | --- | --- |
| `.upload(경로, 파일, { upsert })` | 파일 올리기 | 필요 |
| `.list(폴더, { limit, search })` | 파일 목록 검색 | 필요 |
| `.getPublicUrl(경로)` | 공개 주소 문자열 만들기 | 불필요 (동기) |

- 컴포넌트 밖 `api/` 폴더에 두어서 Supabase 통신 코드와 화면 코드를 나눕니다. 실패하면 `null`을 돌려주니 쓰는 쪽은 `?? '기본이미지'`로 처리하면 됩니다.

---

---

# 📗 pages · Layout 정리 3 (`src/pages/`, `src/components/Layout/`)

## 1. `Layout/Header.tsx`: 아바타 + 항상 숨길 메뉴

**`user`가 바뀔 때마다 `getAvatarUrl`로 아바타를 가져오고, 직접 들어가는 페이지는 메뉴에서 뺍니다.**

```tsx
const { user, isAuth, logout } = useAuth();
const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);

const hideWhenLoggedIn = ['로그인', '회원가입'];
const alwayHidden = ['상품상세', '상품등록'];          // 메뉴에 절대 안 보임

const visibleRoutes = routes.filter(
  ({ title }) =>
    !alwayHidden.includes(title) &&                   // 조건 1: 항상 숨김 목록이 아니고
    !(isAuth && hideWhenLoggedIn.includes(title))     // 조건 2: 로그인 상태 숨김도 아님
);

useEffect(() => {
  let ignore = false;
  const fetchAvatarUrl = async () => {
    if (user) {
      const avatarUrl = await getAvatarUrl(user.id);
      if (ignore) return;                             // 늦게 온 응답 무시
      setAvatarUrl(avatarUrl);
      setIsAvatarLoaded(true);
    } else {
      setAvatarUrl(null);                             // 로그아웃 → 초기화
      setIsAvatarLoaded(false);
    }
  };
  fetchAvatarUrl();
  return () => { ignore = true; };
}, [user]);

// JSX (로그아웃 li 안)
{isAvatarLoaded && <img src={avatarUrl ?? '/vite.svg'} alt="" style={{ width: '30px', ... }} />}
```

- `/Product/:id`는 id가 있어야 의미가 있고, `/Create`는 목록의 버튼으로 들어갑니다. 그래서 메뉴 링크로 두지 않습니다.
- `isAvatarLoaded`로 "아직 불러오는 중"과 "불러왔는데 없음(`null`)"을 구분합니다. 없으면 `'/vite.svg'` 기본 이미지를 보여줍니다.
- `ignore` 플래그는 `useProducts`에서 배운 것과 같은 패턴입니다.

> ⚠️ 코드 확인: `alwayHidden`은 `alwaysHidden` 오타입니다. 아바타 `<img>`에 `alt=""`보다 `alt={`${user.nickname} 프로필`}`가 접근성에 좋습니다. 인라인 `style` 대신 `Header.module.css`에 클래스로 옮기면 깔끔합니다.
>

---

## 2. `Product.tsx`: 로그인 가드 + 상세·등록으로 이동

**로그인 안 했으면 안내 화면을 보여주고, 상품 클릭은 `/Product/${id}`로, 버튼은 `/Create`로 보냅니다.**

```tsx
const { products, loading } = useProducts();
const { isAuth } = useAuth();
const UL = useRef<HTMLUListElement>(null);
const { setHistoryRoute } = useContext(RouterContext)!;

useGSAP(() => {
  if (!UL.current || !UL.current.children) return;          // ul이 없으면(가드 화면) 건너뜀
  gsap.fromTo('li', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1 });
}, { dependencies: [products, isAuth], scope: UL, revertOnUpdate: true });

// 상세 페이지로 이동
const handleRouter = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
  e.preventDefault();                                       // <a> 기본 이동 막기
  history.pushState(null, '', `/Product/${id}`);            // ① 주소창 바꾸기
  setHistoryRoute(`/Product/${id}`);                        // ② 화면 바꾸기
};

// 등록 페이지로 이동
const handleCreate = () => {
  history.pushState(null, '', './Create');
  setHistoryRoute('/Create');
};

if (loading) return <p className={S.loading}>loading.....</p>;
if (!isAuth) {
  return (
    <div className={S.invalid}>
      <span style={{ fontSize: '10rem' }}>🔺</span>
      <h3>상품 목록은 로그인 후 이용이 가능합니다</h3>
    </div>
  );
}

return (
  <div className={S.container}>
    <div className={S.toolbar}>
      <button className={S.createButton} type="button" onClick={handleCreate}>+ 상품 등록</button>
    </div>
    <ul ref={UL}>
      {products && products.map((item) => (
        <li key={item.id}>
          <a href="/" onClick={(e) => handleRouter(e, item.id)}> ... </a>
        </li>
      ))}
    </ul>
  </div>
);
```

### ① 페이지 이동은 항상 2단계

| 단계 | 코드 | 하는 일 |
| --- | --- | --- |
| ① | `history.pushState(null, '', 경로)` | 주소창 + 뒤로가기 기록 |
| ② | `setHistoryRoute(경로)` | 맞는 컴포넌트로 화면 교체 |

- 둘 중 하나만 하면 주소와 화면이 따로 놉니다. `NavLink`도 안에서 같은 2단계를 합니다.

### ② 화면 분기 순서

```
훅들 (useProducts, useAuth, useRef, useContext, useGSAP)   ← 항상 맨 위
 → if (loading) return 로딩
 → if (!isAuth) return 안내 화면
 → return 목록
```

- `dependencies`에 `isAuth`가 들어간 이유: 로그인하면 가드 화면에서 목록으로 바뀌면서 `<ul>`이 새로 생기기 때문입니다.
- CSS에 `.loading`, `.toolbar`, `.createButton`(`&:hover` 중첩)이 추가되었습니다.

> ⚠️ 코드 확인: `console.log(isAuth)`는 렌더링마다 찍히니 지웁니다. `'./Create'`는 상대 경로라 `/Product/abc`에서 누르면 `/Product/Create`가 됩니다. `'/Create'`로 맞춥니다. 이제 `useRouter()`가 있으니 `useContext(RouterContext)!` 대신 씁니다. `useProducts()`는 로그인 전에도 요청을 보냅니다.
>

---

## 3. ⭐ `ProductDetail.tsx`: 단건 조회(select) + 수정(update)

**`useParams()`로 주소의 id를 꺼내 `.eq('id', id).single()`로 상품 1개를 가져오고, 이름을 `update`로 고칩니다.**

```tsx
type Product = Tables<'products'>;

function ProductDetail() {
  const { id } = useParams();                                   // '/Product/abc123' → 'abc123'
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');                         // 수정용 input 값
  const { setHistoryRoute } = useRouter();

  // product가 도착하면 input 초기값 채우기
  useEffect(() => {
    if (!product) return;
    setName(product.name);
  }, [product]);

  // 조회
  useEffect(() => {
    if (!id) return;
    let ignore = false;
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)        // id가 일치하는 행만
        .single();           // 배열 말고 객체 1개로 받기
      if (ignore) return;
      if (error) setError('상품을 불러올 수 없습니다.');
      else setProduct(data);
      setLoading(false);
    };
    fetchProduct();
    return () => { ignore = true; };
  }, [id]);

  // 수정
  const handleUpdate = async () => {
    const { data, error: updateError } = await supabase
      .from('products')
      .update({ name })      // 바꿀 컬럼만
      .eq('id', id)          // ⭐ 없으면 모든 행이 바뀜
      .select();             // 바뀐 행을 돌려받기
    if (updateError || !data || data.length === 0) {
      alert('상품 수정 실패 :' + (updateError?.message ?? '수정 권한이 없거나 상품이 없습니다.'));
      return false;
    }
    alert('상품 수정 완료!');
    return true;
  };

  if (loading) return <p>상품 정보 불러오는 중.....</p>;
  if (error || !product) return <p>{error ?? '해당 상품이 존재하지 않습니다.'}</p>;

  return (
    <div className={S.container}>
      <img src={product.image_url} alt={product.name} className={S.image} />
      <input className={S.nameInput} value={name} onChange={(e) => setName(e.target.value)} />
      {/* 가격 · 할인 */}
      <button type="button" onClick={() => {
        handleUpdate().then((ok) => {
          if (!ok) return;
          history.pushState(null, '', '/Product');
          setHistoryRoute('/Product');
        });
      }}>EDIT</button>
      <button type="button" onClick={() => { /* /Product로 이동 */ }}>BACK</button>
    </div>
  );
}
```

### ① Supabase 쿼리 체이닝

| 메서드 | 뜻 | SQL로 치면 |
| --- | --- | --- |
| `.from('products')` | 테이블 고르기 | `FROM products` |
| `.select('*')` | 조회 | `SELECT *` |
| `.update({ name })` | 수정 | `UPDATE ... SET name = ...` |
| `.eq('id', id)` | 조건 | `WHERE id = ...` |
| `.single()` | 결과를 객체 1개로 (0개·2개 이상이면 error) | — |
| `.select()` (update 뒤) | 바뀐 행 돌려받기 | `RETURNING *` |

### ② ⭐ update가 "성공"인데 아무것도 안 바뀌는 경우

- RLS(행 수준 보안) 정책 때문에 수정 권한이 없으면 Supabase는 **에러 없이 0개 행**을 바꿉니다.
- 그래서 `.select()`로 바뀐 행을 돌려받고 `data.length === 0`도 실패로 처리합니다.

### ③ `handleUpdate`가 `true/false`를 반환하는 이유

- 통신(수정)과 화면 이동을 나눕니다. 성공했을 때만 `.then((ok) => ...)`에서 목록으로 이동합니다.

> ⚠️ 코드 확인: `loading` 초기값이 `false`라서 첫 렌더링에서 `product`가 `null`이면 "해당 상품이 존재하지 않습니다."가 잠깐 보입니다. `useState(true)`로 시작하면 됩니다. `setName`용 `useEffect`를 따로 두지 않고 조회할 때 `setProduct(data); setName(data.name);`처럼 같이 넣어도 됩니다.
>

---

## 4. ⭐ `CreateProduct.tsx`: 이미지 업로드 → 공개 URL → insert

**Register의 아바타 업로드와 같은 흐름에 "DB에 행 추가(insert)"가 붙은 폼입니다.**

```tsx
const [name, setName] = useState('');
const [sale, setSale] = useState('');
const [description, setDescription] = useState('');
const [price, setPrice] = useState('');
const [imageFile, setImageFile] = useState<File | null>(null);
const [error, setError] = useState<string | null>(null);
const { user } = useAuth();
const { setHistoryRoute } = useRouter();

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError(null);

  // 검사 (early return)
  if (!user) { setError('로그인 후 사용 가능합니다.'); return; }
  if (!name || !price || !imageFile) { setError('필수 입력값을 확인해주세요.'); return; }

  // step 1 : 이미지 업로드
  const fileExt = imageFile.name.split('.').pop();
  const filePath = `${user.id}_${Date.now()}.${fileExt}`;   // 겹치지 않는 파일명
  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, imageFile, { upsert: true });
  if (uploadError) { setError('이미지 업로드 실패'); return; }

  // step 2 : 공개 url 만들기
  const imageUrl = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath).data.publicUrl;

  // step 3 : 상품 데이터 업로드 (작성 예시)
  const { error: insertError } = await supabase
    .from('products')
    .insert({
      name,
      description,
      price: Number(price),          // 문자열 → 숫자
      sale: Number(sale) || 0,
      image_url: imageUrl,           // ⭐ 컬럼명은 snake_case
      email: user.email,
    });
  if (insertError) { setError('상품 등록 실패'); return; }

  history.pushState(null, '', '/Product');
  setHistoryRoute('/Product');
};

// JSX: 숫자만 입력 받기
<input value={price} onChange={(e) => {
  const value = e.target.value;
  if (/^\d*$/.test(value)) setPrice(value);      // 숫자가 아니면 state를 안 바꿈
}} type="text" required />

<input type="file" accept="image/*"
  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
```

### ① 3단계 흐름

| step | 하는 일 | 메서드 |
| --- | --- | --- |
| 1 | Storage에 이미지 파일 올리기 | `storage.from('product-images').upload()` |
| 2 | 올린 파일의 주소 만들기 | `getPublicUrl(filePath).data.publicUrl` |
| 3 | 주소를 포함한 상품 정보를 테이블에 넣기 | `from('products').insert({...})` |

### ② insert 객체 규칙 (`database.types.ts`의 `Insert` 타입 기준)

| 컬럼 | 필수? | 넣는 값 |
| --- | --- | --- |
| `name`, `description` | 필수 | state 그대로 (변수명 = 컬럼명이라 축약) |
| `price` | 필수 (number) | `Number(price)` |
| `sale` | 선택 (number) | `Number(sale) \|\| 0` |
| `image_url` | 필수 | `imageUrl` (이름이 달라서 `키: 값`) |
| `email` | 선택 | `user.email` |
| `id`, `created_at` | 선택 | 안 넣음 (DB가 자동 생성) |

### ③ Register 업로드와 비교

| 항목 | `Register.tsx` 아바타 | `CreateProduct.tsx` 상품 이미지 |
| --- | --- | --- |
| 버킷 | `avatars` | `product-images` |
| 파일명 | `${userId}.${ext}` (유저당 1개, 덮어씀) | `${userId}_${Date.now()}.${ext}` (상품마다 새 파일) |
| 이후 | 끝 | 공개 URL → `insert` |

- 숫자 input을 `type="text"` + 정규식 `/^\d*$/`로 막은 이유: `type="number"`는 `e`, `-`, `.` 입력이 되고 빈 값 처리가 까다롭기 때문입니다.
- `e.target.files?.[0] ?? null`: 파일 선택을 취소하면 `files`가 비어 있으니 `null`로 맞춥니다.

> ⚠️ 코드 확인: 현재 파일에는 step 3이 주석만 있고 비어 있습니다(위는 작성 예시). 그래서 `setHistoryRoute`가 아직 쓰이지 않습니다. insert가 실패하면 이미지만 Storage에 남으니, 필요하면 `storage.from('product-images').remove([filePath])`로 지웁니다. 할인율 onChange가 `setSale(e.target.value)`로 되어 있는데, 위에서 만든 `value`를 쓰면 가격 input과 통일됩니다. `<label>`에 `htmlFor`가 없어서 라벨을 눌러도 input에 포커스가 가지 않습니다(`useId` 사용).
>

---

## 🧷 한 줄 요약: 라우팅 · CRUD 도구 고르기

| 하고 싶은 것 | 도구 |
| --- | --- |
| 주소에 id 담기 | path에 `'/Product/:id'` |
| 주소에서 id 꺼내기 | `const { id } = useParams()` |
| 페이지 이동 | `history.pushState(null, '', 경로)` + `setHistoryRoute(경로)` |
| Context를 짧고 안전하게 | `useRouter()` / `useAuth()` (안에서 null이면 throw) |
| 로그인 변화 자동 반영 | `auth.onAuthStateChange` + cleanup `subscription.unsubscribe()` |
| 메뉴에서 특정 페이지 빼기 | `!alwaysHidden.includes(title) && ...` |
| 로그인 안 하면 막기 | 훅 아래에서 `if (!isAuth) return <안내 />` |
| 상품 1개 조회 | `.select('*').eq('id', id).single()` |
| 상품 수정 | `.update({ name }).eq('id', id).select()` + `data.length` 확인 |
| 상품 추가 | `.insert({ name, price: Number(price), image_url, ... })` |
| 업로드한 파일 주소 | `storage.from(버킷).getPublicUrl(경로).data.publicUrl` |
| 파일 이름으로 찾기 | `storage.from(버킷).list('', { search })` + `startsWith` |
| 숫자만 입력 | `type="text"` + `if (/^\d*$/.test(value)) setX(value)` |
| 겹치지 않는 파일명 | `` `${user.id}_${Date.now()}.${ext}` `` |
