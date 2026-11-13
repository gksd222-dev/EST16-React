# 📘 08 명령형 vs 선언형 프로그래밍 정리 (`programming/`)

## 0. 전체 구조: `index.html` + `main.tsx`

**HTML 한 장에 세 가지 방식(바닐라 명령형, 바닐라 선언형, React)을 나란히 붙여서 비교합니다.**

```html
<!-- index.html -->
<script type="module" src="/src/main.tsx"></script>                    <!-- React: #root -->
<script type="module" src="/src/programming/imperative.ts"></script>   <!-- 명령형 퀴즈: #app -->
<script type="module" src="/src/programming/declarative.ts"></script>  <!-- 선언형 체크박스 -->

<article id="imperative-programming"> 체크박스 + 버튼 </article>
<div id="app"></div>
<article id="declarative-programming"> 체크박스 + 버튼 </article>
<div id="root"></div>
```

```tsx
// main.tsx
import Form from './programming/declarative.tsx';   // 이름이 같은 파일이 있으면 확장자로 구분

createRoot(root).render(
  <StrictMode>
    <Form />
  </StrictMode>
);
```

| 파일 | 방식 | 예제 |
| --- | --- | --- |
| `imperative-step1.ts` | 명령형 (바닐라) | 체크박스 → 버튼 활성/비활성 |
| `declarative.ts` | 선언형 (바닐라 + `createState`) | 같은 체크박스 예제 |
| `imperative.ts` | 명령형 (바닐라) | 퀴즈 폼 |
| `declarative.tsx` | 선언형 (React) | 같은 퀴즈 폼 |

- 같은 예제를 **명령형 → 선언형**으로 두 번씩 만들어서 차이를 비교하는 구성입니다.
- `declarative.ts`와 `declarative.tsx`는 이름이 같아서, 확장자 없이 `'./programming/declarative'`로 쓰면 Vite가 **`.ts`를 먼저** 찾습니다. 그래서 `.tsx`를 명시했습니다.
- `imperative-step1.ts`는 `index.html`에 연결되어 있지 않습니다. 1단계 연습용 파일입니다.

---

## 1. 명령형 1단계: `imperative-step1.ts`

**"어떻게(HOW)" 바꿀지 한 줄씩 직접 명령합니다. 이벤트가 오면 DOM을 하나하나 고칩니다.**

```ts
const container = document.getElementById('imperative-programming')!;
const checkbox = container?.querySelector('input[type="checkbox"]') as HTMLInputElement;
const button = container.querySelector('button') as HTMLButtonElement;

function handleChange(e: Event) {
  const { checked } = e.target as HTMLInputElement;

  if (checked) {
    button.disabled = true;               // DOM 속성을 직접 변경
    button.textContent = '비활성 상태';
  } else {
    button.disabled = false;
    button.textContent = '활성 상태';
  }
}

checkbox?.addEventListener('change', handleChange);
```

- `!` (non-null 단언): "이 값은 절대 `null`이 아니다"라고 TypeScript에 알려줍니다. 틀리면 실행 중에 에러가 납니다.
- `as HTMLInputElement`: `querySelector`가 돌려주는 `Element`를 구체적인 타입으로 단언해서 `.checked`를 쓸 수 있게 합니다.
- 상태(체크 여부)를 따로 저장하지 않고 **DOM 자체가 상태**입니다. 요소가 늘어나면 "언제 무엇을 바꿔야 하는지"를 사람이 다 챙겨야 합니다.

> ⚠️ 코드 확인: `container?.`로 옵셔널 체이닝을 쓰는데, 바로 위에서 `!`로 null이 아니라고 단언했기 때문에 `?.`는 의미가 없습니다. 둘 중 하나만 쓰면 됩니다.
>

---

## 2. 미니 상태 관리 도구: `lib/createState.ts`

**데이터를 Proxy로 감싸서, `setState`로 바꿀 때만 값을 바꾸고 `render`를 자동으로 호출합니다.**

```ts
const createState = (data: State, callback: () => void): [Readonly<State>, StateAction] => {
  let allowUpdate = false;                 // setState 안에서만 true

  const state = new Proxy(data, {
    get(target, prop) {
      return target[prop];
    },
    set(target, prop, newValue) {
      if (!allowUpdate) {
        console.warn('🚫 스토어 데이터를 직접 수정할 수 없습니다.');
        return false;                      // 직접 수정 거부
      }
      target[prop] = newValue;
      callback?.();                        // 값이 바뀌면 render 호출
      return true;
    },
  });

  const action = (key: string, value: any) => {
    allowUpdate = true;
    state[key] = value;                    // → Proxy의 set 실행
    allowUpdate = false;
  };

  return [state, action];                  // useState처럼 [값, 변경 함수]
};
```

- `Proxy`: 객체의 읽기(`get`), 쓰기(`set`)를 **가로채서** 원하는 동작을 끼워 넣습니다.
- `state.checked = true`처럼 직접 바꾸면 경고만 나오고 무시됩니다. 반드시 `setState('checked', true)`로 바꿔야 합니다.
- 반환 모양 `[state, setState]`가 React의 `useState`와 같습니다. **React의 useState가 하는 일을 직접 흉내 낸 도구**입니다.

> ⚠️ 코드 확인: `lib/`에 `createState.js`와 `createState.ts`가 둘 다 있습니다. 확장자 없이 import하면 TypeScript는 `.ts`로 타입을 검사하지만, Vite는 `.js`를 먼저 찾아서 **실제로는 `.js`가 실행**됩니다. 지금은 내용이 같아서 문제없지만, 한쪽만 고치면 헷갈릴 수 있습니다.
>

---

## 3. 선언형 1단계: `declarative.ts`

**"무엇(WHAT)"에 의해 UI가 정해지는지 선언합니다. 상태(`data`)만 바꾸면 `render`가 화면을 맞춰 그립니다.**

```ts
import createState from '../lib/createState';

/* 요소 찾기까지는 명령형일 수밖에 없음 */
const container = document.getElementById('imperative-programming')!;
const checkbox = container?.querySelector('input[type="checkbox"]') as HTMLInputElement;
const button = container.querySelector('button') as HTMLButtonElement;

// 1. 상태
const data = { checked: false };

// 2. 상태 → UI (상태가 같으면 언제, 몇 번을 그려도 같은 화면)
const render = () => {
  const { checked } = data;
  checkbox.checked = checked;

  if (checked) {
    button.disabled = true;
    button.textContent = '비활성 상태';
  } else {
    button.disabled = false;
    button.textContent = '활성 상태';
  }
};

// 3. 상태가 바뀌면 render가 자동 호출되도록 연결
const [state, setState] = createState(data, render);

// 4. 이벤트는 "상태만" 바꿈
const update = (globalThis.update = (value: boolean): void => {
  setState('checked', value);
});

checkbox.addEventListener('change', (e: Event) => {
  const { checked: nextCheckedValue } = e.target as HTMLInputElement;   // 이름 바꿔서 구조 분해
  update(nextCheckedValue);
});

render();   // 최초 렌더링

(globalThis as any).state = state;          // 콘솔에서 테스트할 수 있게 전역 공개
(globalThis as any).setState = setState;
```

### ① ⭐ 선언형의 흐름

```
이벤트 발생 → setState(상태 변경) → render(상태를 보고 UI 그리기)
```

- 이벤트 핸들러는 **DOM을 건드리지 않고 상태만** 바꿉니다.
- DOM을 바꾸는 코드는 `render` **한 곳에만** 있습니다. UI가 이상하면 `render`와 상태만 보면 됩니다.
- `render`는 **같은 상태 → 같은 화면**입니다. 순수 함수처럼 예측할 수 있습니다.
- 콘솔에서 `update(true)`나 `setState('checked', true)`를 실행하면 체크박스와 버튼이 같이 바뀝니다. 화면이 **상태를 따라간다**는 걸 확인할 수 있습니다.

### ② TypeScript 문법

- `declare global { var update: ... }`: `globalThis.update`에 타입을 붙이기 위해 **전역 타입을 확장**합니다.
- `const { checked: nextCheckedValue } = ...`: 구조 분해하면서 변수 이름을 `nextCheckedValue`로 바꿉니다.
- `const update = (globalThis.update = ...)`: 같은 함수를 지역 변수와 전역에 동시에 넣습니다.

> ⚠️ 코드 확인: 선언형 예제인데 `getElementById('imperative-programming')`으로 **명령형 쪽 article**을 찾고 있습니다. 그래서 화면의 "선언형 프로그래밍" 체크박스는 아무 반응이 없고, 위쪽 "명령형" 체크박스가 이 코드로 동작합니다. `'declarative-programming'`으로 바꿔야 의도대로 나뉩니다.
>

---

## 4. 명령형 2단계: `imperative.ts` (퀴즈 폼)

**폼 상태(입력 중 / 제출 중 / 성공 / 실패)마다 어떤 요소를 보이고 숨길지 하나하나 명령합니다.**

```ts
const template = `
  <form id="form">
    <textarea id="textarea"></textarea>
    <button id="button" disabled>Submit</button>
    <p id="loading" style="display: none">Loading...</p>
    <p id="error" style="display: none; color: red;"></p>
  </form>
  <h1 id="success" style="display: none">정답입니다~~!</h1>
`;
document.getElementById('app')?.insertAdjacentHTML('beforeend', template);   // HTML 문자열 삽입

// 요소 찾기 (form, textarea, button, loading, error, success)

// DOM 조작 도우미
const hide = (el: HTMLElement) => (el.style.display = 'none');
const show = (el: HTMLElement) => (el.style.display = 'block');
const enable = (el: HTMLElement & { disabled: boolean }) => (el.disabled = false);
const disable = (el: HTMLElement & { disabled: boolean }) => (el.disabled = true);

async function handleFormSubmit(e: SubmitEvent) {
  e.preventDefault();
  disable(textarea); disable(button); show(loading); hide(error);   // 제출 중

  try {
    await submitForm(textarea.value);
    show(success); hide(form);                                       // 성공
  } catch (err) {
    show(error);                                                     // 실패
    if (err instanceof Error) error.textContent = err.message;
  } finally {
    hide(loading); enable(textarea); enable(button);                 // 성공이든 실패든
  }
}

function handleTextChange() {
  if (textarea.value.length === 0) disable(button);
  else enable(button);
}

textarea.addEventListener('input', handleTextChange);
form.addEventListener('submit', handleFormSubmit);
```

```ts
// 서버 요청 흉내: 1.5초 뒤 정답이면 resolve, 아니면 reject
const submitForm = (answer: string): Promise<string> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (answer.toLowerCase() === '심선범') resolve('👍');
      else reject(new Error('땡! 너는 이미 정답을 알고있다.'));
    }, 1500);
  });
```

- `insertAdjacentHTML('beforeend', html)`: 요소의 **마지막 자식 위치**에 HTML 문자열을 추가합니다.
- `HTMLElement & { disabled: boolean }`: 교차 타입으로 "`disabled` 속성이 있는 요소"만 받습니다 (`textarea`, `button`).
- `try / catch / finally`: `finally`는 성공, 실패와 상관없이 **항상** 실행됩니다. 로딩 숨기기처럼 공통 정리에 씁니다.
- `err instanceof Error`: `catch`의 `err`는 `unknown` 타입이라 `Error`인지 확인한 뒤에 `.message`를 씁니다.
- 상태가 4개뿐인데도 상태마다 **show/hide/enable/disable을 빠짐없이** 맞춰야 합니다. 하나만 빠져도 화면이 꼬입니다. 이게 명령형의 단점입니다.

---

## 5. 선언형 2단계: `declarative.tsx` (React 퀴즈 폼)

**상태(`answer`, `status`, `error`)를 선언하고, JSX에 "이 상태면 이렇게 보인다"를 적습니다. 핸들러는 상태만 바꿉니다.**

```tsx
import { useState } from 'react';

type Status = 'success' | 'typing' | 'submitting';

function Form() {
  const [answer, setAnswer] = useState('');                    // 입력한 값
  const [error, setError] = useState<Error | null>(null);       // 에러
  const [status, setStatus] = useState<string>('typing');       // 지금 어떤 화면?

  if (status === 'success') {
    return <h1>정답입니다~~!!</h1>;                             // 성공이면 폼 대신 이 화면
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await submitForm(answer);
      setStatus('success');
    } catch (err) {
      setStatus('typing');
      if (err instanceof Error) setError(err);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);                                  // 상태만 바꿈
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>오르미 캠프 퀴즈!</h2>
      <textarea
        aria-label="정답 입력"
        disabled={status === 'submitting'}
        onChange={handleTextareaChange}
      />
      <button type="submit" disabled={answer.length === 0 || status === 'submitting'}>
        Submit
      </button>
      {error !== null && <p style={{ color: 'red' }}>{error.message}</p>}
      {status === 'submitting' && <p>Loading....</p>}
    </form>
  );
}
```

### ① ⭐ 명령형 vs 선언형 비교 (같은 퀴즈 폼)

| | 명령형 `imperative.ts` | 선언형 `declarative.tsx` |
| --- | --- | --- |
| 관심사 | **어떻게(HOW)** 바꿀까 | **무엇(WHAT)** 이 보여야 하나 |
| 상태 저장 | DOM 자체 (`style.display`, `disabled`) | `useState` (`answer`, `status`, `error`) |
| 버튼 비활성 | `input` 이벤트에서 `disable(button)` / `enable(button)` | `disabled={answer.length === 0 \|\| status === 'submitting'}` |
| 로딩 표시 | `show(loading)` → `finally`에서 `hide(loading)` | `{status === 'submitting' && <p>Loading....</p>}` |
| 성공 화면 | `show(success); hide(form);` | `if (status === 'success') return <h1>…</h1>` |
| 에러 표시 | `show(error); error.textContent = …` | `{error !== null && <p>{error.message}</p>}` |
| 핸들러가 하는 일 | DOM을 직접 바꿈 | **상태만** 바꿈, 화면은 React가 그림 |

### ② 조건부 렌더링 정리

- `if (...) return <JSX />`: 조건에 따라 **화면 전체를 바꿀 때** 씁니다 (성공 화면).
- `{조건 && <JSX />}`: 조건이 참일 때만 **일부를 보여줄 때** 씁니다 (로딩, 에러).
- `disabled={조건식}`: 속성 값도 상태로 계산합니다.

### ③ hooks 위치

- `if (status === 'success') return ...`이 중간에 있어도 괜찮은 이유는 **`useState`가 모두 그 위에** 있기 때문입니다.
- hook은 조건문이나 early return **뒤에 두면 안 됩니다**. 렌더링마다 호출 순서가 같아야 합니다.

> ⚠️ 코드 확인:
> 1. `type Status`를 만들어 놓고 `useState<string>('typing')`으로 써서 타입이 쓰이지 않습니다. `useState<Status>('typing')`으로 바꾸면 `setStatus('sucess')` 같은 오타를 TypeScript가 잡아 줍니다.
> 2. 오답 후 다시 제출해도 `setError(null)`을 하지 않아서 **이전 에러 메시지가 계속 남아 있습니다**. `handleSubmit` 처음에 `setError(null)`을 넣으면 됩니다. (코드의 "오답을 입력하면 어떻게 될까?" 질문의 답)
> 3. `<textarea>`에 `value={answer}`가 없어서 비제어(uncontrolled) 입력입니다. 지금 동작에는 문제없지만, React 방식대로 하려면 `value={answer}`를 넣어 **제어 컴포넌트**로 만드는 게 일반적입니다.
>

---

## 🧷 한 줄 요약: 명령형 vs 선언형 도구 고르기

| 하고 싶은 것 | 명령형 | 선언형 |
| --- | --- | --- |
| 상태 보관 | DOM 속성 그대로 | `data` 객체 / `useState` |
| 상태 바꾸기 | DOM 직접 수정 | `setState(...)` |
| 화면 갱신 | 바꿀 곳마다 직접 | `render()` / React가 자동 |
| 보이기/숨기기 | `el.style.display = 'none'` | `{조건 && <JSX />}` |
| 버튼 비활성 | `button.disabled = true` | `disabled={조건식}` |
| 비동기 결과 처리 | `try / catch / finally` + DOM 조작 | `try / catch` + `setStatus` |
| 직접 수정 막기 | - | `Proxy`의 `set` 가로채기 (`createState`) |
