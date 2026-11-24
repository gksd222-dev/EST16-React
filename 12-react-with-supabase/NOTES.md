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
