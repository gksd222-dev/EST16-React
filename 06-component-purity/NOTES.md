# 📘 06 컴포넌트 순수성 정리 (`Headline.tsx`, `about-purity.ts`)

## 0. 전체 구조: `main.tsx` + `Headline.tsx`

**React 컴포넌트는 순수 함수여야 합니다. 같은 입력(props)을 주면 항상 같은 JSX를 반환해야 합니다.**

```tsx
// main.tsx
createRoot(container).render(
  <StrictMode>
    <Headline />
  </StrictMode>
);
```

- `<StrictMode>`는 개발 모드에서 컴포넌트를 **일부러 2번 실행**합니다. 순수하지 않은 컴포넌트를 찾아내기 위해서입니다.
- 함수가 순수한지 확인하는 방법: **2번 실행해 보고 결과가 같은지 보기**

---

## 1. 순수한 컴포넌트 vs 순수하지 않은 컴포넌트: `Headline.tsx`

```tsx
// components/Headline.tsx (현재 코드)
let count = 0;

function Headline() {
  return <div>{count}</div>;   // 외부 변수를 읽기만 함
}
```

| | 순수하다 ✅ | 순수하지 않다 ❌ |
| --- | --- | --- |
| 코드 | `return <div>{count}</div>` | `count++; return <div>{count}</div>` |
| 하는 일 | 외부 변수를 **읽기만** 함 | 외부 변수를 **바꿈** |
| StrictMode에서 | 2번 실행해도 결과가 같음 (0) | 실행할 때마다 값이 달라짐 (1, 2, ...) |

- 컴포넌트 안에서 바깥 변수를 바꾸면, 렌더링이 몇 번 일어나느냐에 따라 화면이 달라집니다. 그래서 순수성이 깨집니다.
- 렌더링 중에는 **계산해서 JSX를 반환하는 일만** 해야 합니다.

---

## 2. 순수 함수 연습: `about-purity.ts`

### ① 순수 함수: 같은 입력 → 같은 출력

```ts
function truncateText(text: string, limit: number = 100): string {
  if (text.length > limit) {
    return text.slice(0, limit) + '···';
  }
  return text;
}

function square(n: number): number {
  return n * n;
}

function sum(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0);
}

console.log(square(5)); // 25
console.log(square(5)); // 25  → 몇 번을 실행해도 같음
```

- `limit: number = 100`: 매개변수 기본값입니다. 인자를 안 넘기면 100을 씁니다.
- `slice(0, limit)`: 원본 문자열은 그대로 두고 잘라낸 **새 문자열**을 반환합니다.
- `reduce((acc, val) => acc + val, 0)`: 0부터 시작해서 요소를 하나씩 더해 갑니다.
- `nums`, `nums2`처럼 서로 다른 배열이어도 **값이 같으면 결과도 같습니다**.

### ② ⭐ 비순수 함수 1: 외부 변수에 의존

```ts
let multiplier = 2;

function multiply(n: number): number {
  return n * multiplier;   // 바깥 변수를 참조
}

console.log(multiply(3)); // 6
multiplier = 3;
console.log(multiply(3)); // 9  → 같은 입력(3)인데 결과가 다름 ❌
```

- 입력은 같은데 **바깥 값이 바뀌면 결과도 바뀝니다**. 그래서 순수하지 않습니다.
- 순수하게 만들려면 필요한 값을 매개변수로 받으면 됩니다: `multiply(n, multiplier)`

### ③ 비순수 함수 2: 부수 효과(side effect)

```ts
function greet(name: string): string {
  console.log(`hello ${name}`);   // side effect (부수 효과)
  return `hello ${name}`;
}
```

- 반환값은 항상 같지만, 함수 **바깥(콘솔)에 영향**을 주기 때문에 엄밀히는 비순수 함수입니다.
- 컴포넌트 안에서 `console.log`를 써도 될까요? 원래는 안 되지만 React가 **예외로 허용**합니다.
- 순수 함수의 조건: 같은 입력이면 같은 출력, 그리고 **하나의 일만 처리**하기
- side effect는 **정해진 곳에서만** 씁니다 (이벤트 핸들러, `useEffect` 등).

### ④ 대표적인 side effect

| # | 종류 | 예시 |
| --- | --- | --- |
| 1 | DOM 조작 | `document.getElementById`, `document.querySelector` |
| 2 | 브라우저 API 호출 | `setTimeout`, `setInterval` |
| 3 | 저장소 접근 | 로컬 스토리지, 세션 스토리지, IndexedDB, Cookie |
| 4 | 콘솔 출력 | `console.log` (React에서는 예외로 허용) |
| 5 | 외부 상태 도구 | Redux, Zustand로 외부 상태에 접근 |
| 6 | 서버 요청 | `fetch`, Axios |

### ⑤ side effect 덩어리 예시: `fetchUserInfo`

```ts
async function fetchUserInfo(userId: string) {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);  // 서버 요청
    if (!response.ok) throw new Error('유저 정보를 가져오지 못했습니다.');

    const user = await response.json();
    console.log('유저 정보', user);                                    // 콘솔 출력

    const userEl = document.getElementById('user-info');              // DOM 조작
    if (userEl) {
      userEl.textContent = `이름 : ${user.name}, 이메일 : ${user.email}`;
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
}
```

- 서버 요청, 콘솔 출력, DOM 조작이 한 함수에 다 들어 있습니다. 이런 코드는 **렌더링 중(컴포넌트 본문)에 두면 안 됩니다**.
- `response.ok`: 상태 코드가 200번대일 때 `true`입니다. `fetch`는 404가 나도 에러를 던지지 않기 때문에 직접 확인해야 합니다.
- `catch (err)`에서 `err`는 `unknown` 타입이라서 `instanceof Error`로 확인한 다음 `err.message`를 씁니다.

> ⚠️ 코드 확인: 06의 `index.html`에는 `id="user-info"` 요소가 없습니다. 그래서 `userEl`이 `null`이 되고 화면에는 아무것도 안 나옵니다. `if (userEl)` 덕분에 에러는 나지 않습니다. 그리고 지금 `index.html`은 `main.tsx` 대신 `about-purity.ts`를 실행하도록 되어 있어서 `Headline`은 화면에 나오지 않습니다.
>

---

## 🧷 한 줄 요약: 순수한지 판단하기

| 질문 | 예 → | 결론 |
| --- | --- | --- |
| 같은 입력인데 결과가 달라질 수 있나? | `multiply`, `count++` | ❌ 비순수 |
| 함수 바깥을 바꾸나? (변수, DOM, 저장소, 서버) | `count++`, `fetchUserInfo` | ❌ 비순수 |
| 외부 값을 읽기만 하고, 그 값이 안 바뀌나? | `Headline`의 `{count}` | ✅ 순수 |
| 입력만으로 출력을 계산하나? | `square`, `sum`, `truncateText` | ✅ 순수 |
| side effect는 어디에? | 이벤트 핸들러, `useEffect` | 렌더링 중에는 X |
