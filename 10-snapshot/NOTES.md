# 📘 learn 디렉터리 정리 (`src/components/`)

## 0. 전체 구조: `Playground.tsx`

**예제 컴포넌트를 하나씩 주석을 풀어 가며 확인합니다.**

```tsx
// import Counter from "./components/Counter"
// import Form from "./components/Form"
// import Parent from "./components/memo-1/Parent"
import Parent from "./components/memo-2/Parent"   // 지금 보고 있는 예제

function Playground() {
  return (
    <>
      {/* <Counter></Counter> */}
      {/* <Form></Form> */}
      <Parent></Parent>
    </>
  );
}
```

| 파일 | 주제 |
| --- | --- |
| `Counter.tsx` | 상태 스냅샷, 업데이터 함수, 지연 초기화 |
| `Form.tsx` | 객체 상태 + 지연 초기화 |
| `memo-1/` | `memo` + `useCallback` (함수 props) |
| `memo-2/` | `memo` + 배열 props (`useMemo` vs 컴포넌트 밖 상수) |

- `main.tsx`가 `<StrictMode>`로 감싸고 있습니다. 개발 모드에서는 렌더링과 초기화 함수가 **두 번** 실행될 수 있으므로 콘솔 로그가 두 번 찍혀도 버그가 아닙니다.

---

## 1. 상태는 스냅샷: `Counter.tsx` ⭐

**렌더링할 때 state는 사진처럼 고정됩니다. `setState`는 지금 사진을 고치지 않고, 다음 렌더링에서 새 사진을 찍게 합니다.**

```tsx
function slowInit() {
  console.log('초기값 계산중. . . ');
  let sum = 0;
  for (let i = 0; i < 1000; i++) sum += i;
  return sum;   // 499500
}

function Counter() {
  const [number, setNumber] = useState(slowInit);   // 지연 초기화: 함수 자체를 전달

  const handleClick = () => {
    setNumber(number + 5);
    // setNumber((n) => n + 5);   // 업데이터 함수
    // alert(number);             // 바뀌기 전 값이 나옴
  };

  return (
    <>
      <button type="button" onClick={() => setNumber(number - 5)}>감소</button>
      <h1>{number}</h1>
      <button type="button" onClick={handleClick}>증가</button>
    </>
  );
}
```

### ① 스냅샷(State as a Snapshot)

- 한 번의 렌더링 안에서 `number`는 **상수**입니다. 이벤트 핸들러도 그 렌더링 때의 `number`를 기억합니다.
- 그래서 `setNumber(number + 5)` 바로 다음 줄에서 `alert(number)`를 해도 **바뀌기 전 값**이 나옵니다.

### ② ⭐ 같은 setState를 여러 번 부르면?

| 코드 (number가 0일 때) | 결과 | 이유 |
| --- | --- | --- |
| `setNumber(number + 5)` ×3 | **5** | 세 번 모두 `0 + 5`를 예약 |
| `setNumber((n) => n + 5)` ×3 | **15** | 앞 결과를 `n`으로 받아 이어서 계산 |
| `setNumber(number + 5)` → `setNumber(50)` | **50** | 마지막 값으로 교체 |
| `setNumber(50)` → `setNumber((n) => n + 5)` | **55** | 50을 받아서 +5 |

- React는 핸들러 안의 setState를 모아 두었다가 한 번에 처리합니다(배칭). 렌더링도 한 번만 일어납니다.
- **이전 값을 기준으로 계산할 때**는 업데이터 함수 `(n) => n + 5`를 씁니다.

### ③ ⭐ 지연 초기화(lazy initialization)

| 쓰는 법 | 실행 횟수 |
| --- | --- |
| `useState(slowInit())` | **렌더링마다** 실행 (결과는 첫 번째만 사용하고 나머지는 버림) |
| `useState(slowInit)` | 첫 렌더링에 **한 번만** |
| `useState(() => slowInit())` | 첫 렌더링에 **한 번만** (인자가 필요할 때 이 방식) |

- 초기값은 첫 렌더링에서만 쓰입니다. `slowInit()`처럼 괄호를 붙이면 버려질 계산을 매번 하게 됩니다.
- 09장 NoteApp의 `useState(() => getNoteList())`도 같은 원리입니다.

---

## 2. 객체 상태 + 지연 초기화: `Form.tsx`

**초기 객체를 함수로 한 번만 만들고, 바꿀 때는 새 객체로 교체합니다.**

```tsx
function getInitialForm() {
  console.log('복잡한 상태 계산중 . . .');
  return {
    title: '',
    content: '',
    createdAt: new Date().toISOString(),   // 처음 만든 시각
  };
}

function Form() {
  const [form, setForm] = useState(getInitialForm);   // () 없이 전달 → 한 번만 실행

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // form.title = e.target.value   ❌ 직접 수정하면 React가 변경을 모름
    setForm({ ...form, title: e.target.value });   // ✅ 복사 + 덮어쓰기
  };

  return (
    <div>
      <input type="text" value={form.title} onChange={handleChange} placeholder="제목" aria-label="제목입력" />
      <p>작성일시: {form.createdAt}</p>
    </div>
  );
}
```

- `useState(getInitialForm())`로 쓰면 글자를 칠 때마다 `getInitialForm`이 다시 실행됩니다. 콘솔 로그도 매번 찍힙니다. `createdAt`은 첫 값이 유지되지만 쓸모없는 계산이 반복됩니다.
- React는 이전 값과 새 값을 `Object.is`로 비교합니다. 객체를 직접 고치면 참조가 같아서 화면이 바뀌지 않습니다. 그래서 `{ ...form }`으로 **새 객체**를 만들어야 합니다.

---

## 3. `memo` + `useCallback`: `memo-1/`

**부모가 다시 렌더링되면 자식도 다시 렌더링됩니다. 이것은 잘못이 아니라 React의 기본 동작입니다. 자식을 건너뛰고 싶을 때 `memo`를 씁니다.**

### ① `Child.tsx`: `memo`로 감싸기

```tsx
import { memo } from "react";

interface Props {
  label: string;
  onClick: () => void;
}

function Child({ label, onClick }: Props) {
  console.log(`나는 자식 컴포넌트야! ${label}`);   // 리렌더링 확인용
  return (
    <>
      <p>{label}</p>
      <button type="button" onClick={onClick}> 자식 요소가 누르는 버튼</button>
    </>
  );
}
export default memo(Child);   // props가 그대로면 리렌더링 건너뜀
```

- `memo(컴포넌트)`는 이전 props와 새 props를 하나씩 **얕게 비교**합니다. 모두 같으면 렌더링을 건너뜁니다.

### ② `Parent.tsx`: `useCallback`으로 함수 기억하기

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log('clicked!');
  }, []);   // 의존성이 없음 → 항상 같은 함수

  return (
    <div>
      <h1>Parent Count : {count}</h1>
      <button type="button" onClick={() => setCount(count + 1)}> +1 </button>
      <hr />
      <Child label="야호" onClick={handleClick} />
    </div>
  );
}
```

### ③ ⭐ 왜 `memo`만으로는 부족할까?

| Parent의 handleClick | +1을 누를 때 Child |
| --- | --- |
| 일반 함수 `const handleClick = () => {...}` | **리렌더링됨**: 렌더링마다 새 함수가 생겨서 `onClick`이 달라짐 |
| `useCallback(() => {...}, [])` | **건너뜀**: 같은 함수를 돌려주므로 props가 그대로 |

- `label="야호"` 같은 문자열은 값으로 비교하므로 매번 같습니다. 함수, 배열, 객체는 **참조**로 비교하므로 새로 만들면 다른 값이 됩니다.
- `useCallback(함수, [의존성])`은 이렇게 동작합니다.
  - 첫 렌더링: 함수를 기억합니다.
  - 다음 렌더링: 의존성이 지난번과 같으면 기억한 함수를, 바뀌었으면 새 함수를 돌려줍니다.
  - `[]`: 비교할 것이 없으니 항상 같은 함수입니다.
  - `[count]`: `count`가 바뀔 때만 새 함수를 만듭니다.

> ⚠️ 코드 확인: 함수 안에서 `count`를 쓰면서 의존성을 `[]`로 두면 함수가 **첫 렌더링 때의 count(0)**만 기억합니다. 1장의 스냅샷과 같은 원리입니다. 안에서 쓰는 state는 의존성 배열에 넣거나 `setCount((c) => c + 1)`처럼 업데이터 함수를 써야 합니다.
>

---

## 4. `memo` + 배열 props: `memo-2/`

**배열도 참조로 비교합니다. 바뀌지 않는 배열은 컴포넌트 밖에 상수로 두면 `memo`가 제대로 동작합니다.**

### ① `Child.tsx`

```tsx
interface Props {
  item: string[];
}

function Child({ item }: Props) {
  console.log('자식 컴포넌트 리렌더링!');
  return (
    <ul>
      {item.map((data, index) => <li key={index}>{data}</li>)}
    </ul>
  );
}
export default memo(Child);
```

### ② `Parent.tsx`

```tsx
// 절대 바뀌지 않는 값 → 컴포넌트 밖(모듈 최상단)에 선언
const STUDENTS = ['🐭이소망', '🐰이유정', '🦁신재훈', '🐨안경찬', '🐧박소연', '🪾조민지', '🐗김효경'];

function Parent() {
  const [count, setCount] = useState(0);

  // const students = useMemo(() => [...], []);   // 같은 효과, 하지만 상수라면 밖에 두는 게 더 간단

  return (
    <div>
      <h1>Count:{count}</h1>
      <button type="button" onClick={() => setCount(count + 1)}>+1</button>
      <Child item={STUDENTS} />
    </div>
  );
}
```

### ③ ⭐ 배열을 어디에 두느냐에 따라

| 배열 위치 | +1을 누를 때 Child |
| --- | --- |
| 컴포넌트 안 `const students = [...]` | **리렌더링됨**: 렌더링마다 새 배열 |
| `useMemo(() => [...], [])` | 건너뜀: 같은 배열을 재사용 |
| 컴포넌트 밖 `const STUDENTS = [...]` | 건너뜀: 처음부터 하나뿐인 배열 |

- `useMemo(계산 함수, [의존성])`는 **계산 결과**를 기억합니다. 의존성이 바뀔 때만 다시 계산합니다.
- 주로 큰 데이터를 필터링하거나 정렬하는 등 계산이 무거울 때 씁니다.
- props나 state에 따라 달라지지 않는 값은 `useMemo`도 필요 없습니다. 전역 상수로 두면 됩니다.

> ⚠️ 코드 확인: `key={index}`는 항목이 추가·삭제·정렬되지 않는 고정 목록이라 지금은 괜찮습니다. 목록이 바뀔 수 있다면 고유한 값(여기서는 `data`)을 key로 써야 합니다.
>

---

## 🧷 한 줄 요약: 기억(메모이제이션) 도구 고르기

| 상황 | 도구 | 이번 코드 예 |
| --- | --- | --- |
| 이전 state 값을 기준으로 업데이트 | 업데이터 함수 `setX((prev) => ...)` | `setNumber((n) => n + 5)` |
| 무거운 초기값을 한 번만 계산 | 지연 초기화 `useState(함수)` | `useState(slowInit)`, `useState(getInitialForm)` |
| 객체 state 일부 바꾸기 | 스프레드로 새 객체 | `{ ...form, title }` |
| props가 같으면 자식 리렌더링 건너뛰기 | `memo(컴포넌트)` | `memo(Child)` |
| 자식에게 넘기는 함수 기억하기 | `useCallback` | `handleClick` |
| 배열·객체·계산 결과 기억하기 | `useMemo` | 주석 처리된 `students` |
| 절대 안 바뀌는 값 | 컴포넌트 밖 상수 | `STUDENTS` |
