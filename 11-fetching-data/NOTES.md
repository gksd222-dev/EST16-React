# 📘 components 디렉터리 정리 (`src/components/`)

## 0. 전체 구조: `main.tsx`

**폴더 하나가 실습 주제 하나입니다. `main.tsx`에서 import 한 줄만 바꿔 가며 실행합니다.**

```tsx
// main.tsx
import Parent from './components/layoutEffect/Parent';      // 지금 실행 중
//import Parent from './components/effectAndRef/Parent';
//import UserList from './components/effect/Effect';
// import Parent from './components/ref/Parent';

createRoot(container).render(
  <StrictMode>
    <Parent />
  </StrictMode>
);
```

| 폴더 | 파일 | 주제 |
| --- | --- | --- |
| `ref/` | `Parent.tsx`, `Child.tsx` | `useRef`로 DOM 선택, 자식에게 ref 넘기기 |
| `effect/` | `Effect.tsx` | `useEffect`로 데이터 가져오기(fetch) |
| `effectAndRef/` | `Parent.tsx`, `Child.tsx` | `useEffect` + `useRef`로 채팅창 자동 스크롤 |
| `layoutEffect/` | `Parent.tsx` | `useLayoutEffect`와 `useEffect`의 실행 순서 |

- `<StrictMode>`는 개발 모드에서 Effect를 **마운트 → 정리(cleanup) → 다시 마운트** 순서로 한 번 더 실행합니다. 그래서 콘솔 로그가 두 번 찍히는 것은 정상입니다.

---

## 1. useRef로 DOM 선택하기: `ref/Parent.tsx`

**`useRef`는 `document.querySelector` 대신 쓰는, 리액트 방식(선언형)의 DOM 선택 방법입니다.**

```tsx
// ref/Parent.tsx
const inputRef = useRef<HTMLInputElement>(null);   // 처음엔 null

const handleFocus = () => {
  // const input = document.querySelector('input');  // ❌ 명령형 방식
  // input?.focus();

  if (inputRef.current) {          // 커밋 후에는 실제 DOM이 들어 있음
    inputRef.current.focus();
  }
};

return (
  <>
    <input type="text" placeholder="아이디를 입력하세요" />
    <Child ref={inputRef} placeholder="아이디를 입력하세요" />
    <button type="button" onClick={handleFocus}>인풋에 포커스</button>
  </>
);
```

- 리액트는 가상 DOM으로 일하기 때문에 렌더링 중에는 실제 DOM이 아직 없습니다. 커밋 단계에서 리액트가 실제 DOM을 `ref.current` 자리에 넣어 줍니다.
- 그래서 `current`는 **이벤트 핸들러나 Effect 안에서** 읽어야 합니다. 렌더링 중에 읽으면 `null`일 수 있습니다.
- `ref.current` 값이 바뀌어도 **리렌더링은 일어나지 않습니다**. 이 점이 `useState`와 다릅니다.
- `querySelector('input')`는 문서에서 첫 번째 input을 고릅니다. 이 화면에는 input이 두 개라서 원하지 않는 요소가 선택됩니다. ref를 쓰면 정확히 그 요소를 가리킬 수 있습니다.

---

## 2. 자식에게 ref 넘기기: `ref/Child.tsx`

**⭐ React 19부터는 `ref`를 일반 props처럼 받을 수 있습니다. `forwardRef`가 필요 없습니다.**

```tsx
// ref/Child.tsx
import type { Ref } from 'react';

interface Props {
  placeholder: string;
  ref?: Ref<HTMLInputElement>;   // ref 타입은 Ref<요소타입>
}

function Child({ placeholder, ref }: Props) {
  return <input ref={ref} placeholder={placeholder} type="text" />;
}
```

| 버전 | 자식에서 ref 받는 방법 |
| --- | --- |
| React 18 이하 | `forwardRef((props, ref) => ...)`로 감싸야 함 |
| React 19 + | props에서 `ref`를 그냥 구조 분해 |

- 부모의 `inputRef`가 자식 안의 `<input>`을 가리키게 됩니다. 그래서 부모 버튼으로 자식 input에 포커스를 줄 수 있습니다.
- `import type`은 타입만 가져온다는 표시입니다. 빌드 결과물에는 남지 않습니다.

---

## 3. useEffect로 데이터 가져오기: `effect/Effect.tsx`

**렌더링과 상관없는 일(서버 요청, 타이머 등)은 `useEffect` 안에서 합니다.**

### ① 의존성 배열에 따른 실행 시점

| 형태 | 실행 시점 |
| --- | --- |
| `useEffect(fn)` | 매 렌더링마다 |
| `useEffect(fn, [])` | 첫 렌더링(마운트) 후 딱 한 번 |
| `useEffect(fn, [count])` | `count`가 지난번 값과 다를 때 |

### ② 정리(cleanup) 함수

```tsx
useEffect(() => {
  const id = setInterval(() => console.log('실행'), 1000);

  return () => {                 // 다음 Effect 실행 전, 또는 언마운트 때 호출
    console.log('청소를 깨끗이 하자!');
    clearInterval(id);
  };
}, [count]);
```

- `return`으로 돌려준 함수가 정리 함수입니다. 타이머, 구독, 요청처럼 **켜 둔 것을 끄는** 역할을 합니다.
- 정리하지 않으면 `count`가 바뀔 때마다 타이머가 계속 쌓입니다.

### ③ ⭐ fetch + 로딩/에러 상태 3종 세트

```tsx
const [users, setUsers] = useState<User[] | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  const controller = new AbortController();

  fetch('https://jsonplaceholder.typicode.com/users', { signal: controller.signal })
    .then((res) => {
      if (!res.ok) throw new Error('네트워크 응답 오류');   // 404, 500도 직접 에러 처리
      return res.json();
    })
    .then((data: User[]) => {
      setUsers(data);
      setLoading(false);
    })
    .catch((err: Error) => {
      if (err.name === 'AbortError') return;   // 취소는 에러가 아님
      setLoading(false);
      setError(err);
    });

  return () => controller.abort();   // 언마운트되면 요청 취소
}, []);

if (loading) return <p>로딩 중....</p>;
if (error) return <p>❌ 에러 발생!!! : {error.message} ❌</p>;

return (
  <ul>
    {users && users.map((user) => (
      <li key={user.id}>{user.name} ({user.email})</li>
    ))}
  </ul>
);
```

- `fetch`는 404나 500 응답에서도 **reject되지 않습니다**. 그래서 `res.ok`를 직접 확인하고 `throw`해야 `catch`로 넘어갑니다.
- `AbortController`로 요청을 취소할 수 있습니다. 컴포넌트가 사라진 뒤에 `setState`가 호출되는 일을 막아 줍니다.
- StrictMode에서는 첫 요청이 바로 abort됩니다. 이때 `AbortError`가 나기 때문에 그냥 `return`해서 무시합니다.
- `if (loading) return ...`처럼 상태에 따라 **일찍 return(early return)** 하면 JSX가 깔끔해집니다.
- `User` 타입은 `src/@types/global.d.ts`에 `declare global`로 선언해서 import 없이 씁니다.

---

## 4. Effect + Ref로 자동 스크롤: `effectAndRef/Parent.tsx`

**메시지가 추가될 때마다(`[messages]`) 스크롤 박스를 맨 아래로 내립니다.**

```tsx
const [messages, setMessages] = useState<string[]>(['다했어?', '넘어가도 돼?', '나중에 안 보여준다?']);

const addMessage = () => {
  setMessages((prev) => [...prev, `새 메시지 ${prev.length + 1}`]);   // 이전 값 기반 업데이트
};

const listRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const list = listRef.current;
  if (!list) return;

  list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });   // 박스 안에서만 스크롤
}, [messages]);

return (
  <div ref={listRef} style={{ height: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
    {messages.map((msg, idx) => <Child key={idx} message={msg} />)}
  </div>
);
```

### ① ⭐ 두 가지 스크롤 방법

| 방법 | ref 대상 | 움직이는 범위 |
| --- | --- | --- |
| `list.scrollTo({ top: list.scrollHeight })` | 스크롤 박스(`overflowY: auto`인 div) | **그 박스만** |
| `bottomRef.current?.scrollIntoView()` | 맨 아래 빈 `<div>` | 요소가 보이도록 **스크롤 가능한 조상 전부**(페이지 포함) |

- `scrollHeight`는 스크롤 영역의 전체 높이입니다. `top`에 이 값을 주면 맨 아래로 이동합니다.
- `scrollIntoView`는 쓰기 간단하지만 페이지 전체가 같이 움직일 수 있습니다. 채팅 박스만 움직이려면 `scrollTo`가 안전합니다.
- 스크롤은 DOM이 화면에 반영된 뒤에 해야 하므로 `useEffect` 안에서 합니다.

### ② `effectAndRef/Child.tsx`: memo

```tsx
function Child({ message }: Props) {
  return <p>{message}</p>;
}
export default memo(Child);   // props가 같으면 리렌더링 건너뜀
```

- 메시지가 추가돼도 기존 `Child`들은 `message`가 그대로라서 다시 그리지 않습니다.

> ⚠️ 코드 확인: `key={idx}`는 이 예제처럼 **뒤에 추가만 하는** 목록에서는 괜찮습니다. 중간 삭제나 순서 변경이 생기면 고유 id를 key로 써야 합니다.
>

---

## 5. useLayoutEffect: `layoutEffect/Parent.tsx`

**`useLayoutEffect`는 화면을 그리기 *전에*, `useEffect`는 화면을 그린 *후에* 실행됩니다.**

```tsx
const boxRef = useRef<HTMLDivElement>(null);
const [height, setHeight] = useState(0);

console.log('🐴 컴포넌트 실행 영역');            // 1

useLayoutEffect(() => {
  console.log('🐱 useLayoutEffect 실행 영역');   // 2 (페인트 전)
  if (boxRef.current) {
    const h = boxRef.current.getBoundingClientRect().height;   // 실제 높이 측정
    setHeight(h);
  }
}, []);

useEffect(() => {
  console.log('🐺 useEffect 실행 영역');          // 3 (페인트 후)
});

return <div ref={boxRef} style={{ padding: '20px', fontSize: '24px' }}>이 박스의 높이 : {height}px</div>;
```

### ① 실행 순서

| 순서 | useEffect | useLayoutEffect |
| --- | --- | --- |
| 1 | 컴포넌트 실행(렌더링) | 컴포넌트 실행(렌더링) |
| 2 | DOM 업데이트 | DOM 업데이트 |
| 3 | 화면 그리기 | **useLayoutEffect 실행** |
| 4 | **useEffect 실행** | 화면 그리기 |

- `useEffect`에서 높이를 재고 `setHeight`를 하면 `0px`이 잠깐 보였다가 바뀌는 **깜빡임**이 생길 수 있습니다.
- `useLayoutEffect`에서 하면 그리기 전에 값이 바뀌므로 처음부터 올바른 높이가 보입니다.
- 대신 화면 그리기를 막고 실행되므로 무거운 작업에 쓰면 느려집니다. 기본은 `useEffect`, 레이아웃 측정이 필요할 때만 `useLayoutEffect`를 씁니다.

### ② useLayoutEffect를 쓰는 경우

- 툴팁, 팝오버 위치 계산
- 아코디언, 애니메이션 크기 측정
- 스크롤 위치 조정
- 탭 인디케이터 위치 조정

> ⚠️ 코드 확인: `background: '#00000'`은 0이 5개라 잘못된 색상값이라서 무시됩니다(검정은 `'#000000'` 또는 `'#000'`). 또 `if (boxRef.current)` 안에서 `boxRef.current?.`의 `?.`는 필요 없습니다. 아래 `useEffect`는 의존성 배열이 없어서 매 렌더링마다 실행됩니다(`setHeight` 후 한 번 더 찍힘).
>

---

## 🧷 한 줄 요약: 상황별 도구 고르기

| 하고 싶은 것 | 도구 |
| --- | --- |
| DOM 요소를 직접 다루기(포커스, 스크롤, 크기) | `useRef` + `ref={...}` |
| 자식 컴포넌트 안의 DOM을 부모가 다루기 | React 19: `ref`를 props로 전달 |
| 서버 데이터 가져오기, 타이머, 구독 | `useEffect` + 정리 함수 |
| 언마운트 시 fetch 취소 | `AbortController` + `controller.abort()` |
| 값이 바뀔 때마다 DOM 작업(자동 스크롤) | `useEffect(fn, [값])` + ref |
| 그리기 전에 크기·위치 측정(깜빡임 방지) | `useLayoutEffect` |
| props가 같으면 리렌더링 건너뛰기 | `memo(컴포넌트)` |
