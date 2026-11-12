# 📗 07 이벤트 응답 정리 (`learn/`)

## 0. 전체 구조: `index.tsx`

**`Learn` 컴포넌트가 내비게이션과 `View` 묶음을 차례로 렌더링합니다.**

```tsx
// learn/index.tsx
function Learn() {
  return (
    <div className="Learn">
      <NavContents />
      <View />
      <View.HTMLCode />
      <View.RespondingToEvents />
    </div>
  );
}
```

- `<View.HTMLCode />`처럼 **점(.)으로 접근하는 컴포넌트**가 있습니다. 2번에서 정리합니다.
- `main.tsx`에서는 `<StrictMode>`로 감싸서 렌더링합니다.

---

## 1. 이벤트 핸들러와 기본 동작 막기: `NavContents.tsx`

```tsx
import type { MouseEvent } from 'react';

function NavContents() {
  const handleClickFirstLink = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();   // 링크 이동(기본 동작) 막기

    const firstLink = document.querySelector('[href="jsx-markup"]') as HTMLAnchorElement;
    firstLink.dataset.element = 'jsx-markup';   // → data-element="jsx-markup"
    console.log(firstLink);
  };

  return (
    <nav className="NavContents" aria-label="학습 주제 탐색">
      <a href="#jsx-markup" onClick={handleClickFirstLink}>JSX 마크업</a>
      <a href="#responding-to-events">이벤트 응답</a>
    </nav>
  );
}
```

### ① 이벤트 핸들러 연결 규칙

| # | 규칙 | 예시 |
| --- | --- | --- |
| 1 | 이벤트 속성은 camelCase | `onclick` → `onClick` |
| 2 | 함수를 **전달**하고, 호출하지 않음 | `onClick={handleClick}` ✅ / `onClick={handleClick()}` ❌ |
| 3 | 핸들러 이름은 `handle` + 대상 + 이벤트 | `handleClickFirstLink`, `handleMouseEnter` |
| 4 | 이벤트 타입은 React에서 가져옴 | `MouseEvent<HTMLAnchorElement>` |

- `onClick={handleClick()}`처럼 괄호를 붙이면 **렌더링할 때 바로 실행**되고, 그 반환값이 연결됩니다.

### ② side effect는 이벤트 핸들러 안에서

- DOM 조작, `console.log` 같은 side effect는 컴포넌트 본문(렌더링 중)에 두면 안 됩니다.
- **이벤트 핸들러 안**은 렌더링이 끝난 뒤 사용자가 행동할 때 실행되므로 side effect를 써도 됩니다.
- `e.preventDefault()`: `<a>`의 페이지 이동, `<form>`의 전송 같은 **브라우저 기본 동작을 막습니다**.
- `dataset.element = '...'`: HTML에 `data-element` 속성을 추가합니다.

> ⚠️ 코드 확인: 실제 링크의 `href`는 `"#jsx-markup"`인데 선택자는 `[href="jsx-markup"]`(#이 없음)이라서 `querySelector`가 `null`을 반환합니다. 그다음 `firstLink.dataset`에서 에러가 납니다. `as HTMLAnchorElement`가 `null` 가능성을 숨겨서 TypeScript도 경고하지 않습니다.
> 클릭한 요소를 쓰려면 `const firstLink = e.currentTarget;`이 가장 간단합니다. 또 주석에는 "선언형"이라고 되어 있지만 `querySelector`로 DOM을 직접 고치는 건 **명령형** 방식입니다.
>

---

## 2. 컴포넌트 네임스페이스 패턴: `View.tsx`

```tsx
function RespondingToEvents() { ... }
function HTMLCode() { return <div hidden><h2>HTMLCode</h2></div>; }

function View() {
  return <div>View</div>;
}
export default View;

View.HTMLCode = HTMLCode;                       // 함수에 속성으로 컴포넌트를 붙임
View.RespondingToEvents = RespondingToEvents;
```

- 함수도 객체라서 **속성을 추가할 수 있습니다**. 관련된 컴포넌트를 `View` 하나로 묶어 export합니다.
- 쓰는 쪽에서는 `import View`만 하면 `<View.HTMLCode />`, `<View.RespondingToEvents />`까지 쓸 수 있습니다.
- 이 방식은 compound component(합성 컴포넌트), 디자인 시스템에서 많이 씁니다. (예: `<Card.Header />`, `<Card.Body />`)

---

## 3. 폼 제출 처리와 state: `View.tsx`의 `RespondingToEvents`

### ① `useState`: 화면을 다시 그리게 하는 값

```tsx
import { useState } from 'react';

const [text, setText] = useState('hello');   // [현재 값, 값을 바꾸는 함수]
```

- `setText(새 값)`을 호출하면 React가 컴포넌트를 **다시 렌더링**하고, 화면에 새 값이 나옵니다.

### ② ⭐ 일반 변수 vs state

```tsx
let message = 'message hello';

const updateMessage = (add: string): void => {
  message += add;          // 값은 바뀌지만
  console.log(message);    // 콘솔에만 찍히고 화면은 안 바뀜
};
```

| | 일반 변수 (`let message`) | state (`useState`) |
| --- | --- | --- |
| 값 바꾸기 | `message += add` | `setText(value)` |
| 화면 | **다시 안 그림** | 다시 그림 |
| 다시 렌더링되면 | 처음 값(`'message hello'`)으로 **초기화** | 바뀐 값을 **기억** |

- JS 함수 안의 변수는 실행이 끝나면 사라집니다 (휘발성). 컴포넌트가 다시 실행되면 `let message`도 처음부터 다시 만들어집니다.
- `useState`는 React가 값을 따로 보관해 주기 때문에 예외입니다.
- `updateMessage`는 바깥 변수 `message`를 바꾸기 때문에 순수하지 않습니다.

### ③ 폼 제출: `onSubmit` + `preventDefault`

```tsx
<form
  action="/?submitted"
  onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();                                                     // 페이지 새로고침 막기

    const form = e.currentTarget;                                           // 1. form 찾기
    const input = form.elements.namedItem('username') as HTMLInputElement; // 2. input 찾기
    const value = input.value;                                              // 3. input 값 가져오기

    setText(value);    // state 업데이트 → 화면 다시 그림
    input.value = '';  // 입력창 비우기
  }}
>
  <input type="text" name="username" />{' '}
  <button type="submit">보내기</button>
  <div>
    <p>{text}</p>
    <p>{message}</p>
  </div>
</form>
```

- `onSubmit`은 `<button>`이 아니라 **`<form>`에 붙입니다**. 버튼 클릭, 엔터 키 둘 다 처리됩니다.
- `e.currentTarget`: 이벤트 핸들러가 **붙어 있는 요소**(여기서는 `form`)입니다. `e.target`은 실제로 이벤트가 시작된 요소입니다.
- `form.elements.namedItem('username')`: `name` 속성으로 폼 안의 요소를 찾습니다.
- 핸들러를 JSX 안에 **인라인 화살표 함수**로 바로 써도 됩니다. 길어지면 `handleSubmit`처럼 따로 빼는 게 읽기 좋습니다.

---

## 4. 이벤트 핸들러를 props로 전달: `EventHandleProp.tsx`

```tsx
import type { Dispatch, SetStateAction } from 'react';

type Props = {
  onPrintMessage: (add: string) => void;          // 함수 타입
  message: string;
  text: string;
  setText: Dispatch<SetStateAction<string>>;      // useState의 setter 타입
};

function EventHandleProp({ onPrintMessage, message, text, setText }: Props) {
  const handleMouseEnter = () => {
    setText('안쪽 컴포넌트에서 setText를 호출했습니다.');   // 자식이 부모의 state를 바꿈
  };

  const handleMouseLeave = () => {};

  return (
    <details>
      <summary onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <b>이벤트 핸들러 추가하기</b>
      </summary>
      <p>
        이벤트 핸들러 추가를 위해서는 먼저 함수를 정의하고 <br />
        적절한 JSX요소에 prop으로 전달해야 합니다.
        <output>결과 : {message}</output>
      </p>
    </details>
  );
}
```

```tsx
// 부모(RespondingToEvents)에서 넘겨주기
<EventHandleProp text={text} setText={setText} message={message} onPrintMessage={updateMessage} />
```

### ① 이름 짓기 관례

| 위치 | 관례 | 예시 |
| --- | --- | --- |
| props 이름 | `on` + 이벤트 | `onPrintMessage`, `onClick` |
| 핸들러 함수 이름 | `handle` + 이벤트 | `handleMouseEnter`, `handleSubmit` |

### ② 핵심 정리

- 부모의 함수(`updateMessage`)나 setter(`setText`)를 props로 넘기면, **자식에서 부모의 값을 바꿀 수 있습니다**.
- `setText`를 호출하면 state를 가진 **부모가 다시 렌더링**되고, 부모 화면의 `{text}`가 바뀝니다.
- `Dispatch<SetStateAction<string>>`: `useState<string>`의 setter 타입입니다. `setText('값')`, `setText(prev => prev + '!')` 둘 다 받습니다.
- `onMouseEnter` / `onMouseLeave`: 마우스가 요소에 들어올 때와 나갈 때 실행됩니다.
- `<details>` + `<summary>`: 클릭하면 펼쳐지고 접히는 HTML 기본 요소입니다.

> ⚠️ 코드 확인: `text`, `onPrintMessage`는 props로 받기만 하고 쓰지 않습니다 (`onPrintMessage`는 주석 처리됨). 또 `message`는 부모의 일반 변수라서 `updateMessage`로 바꿔도 `<output>`에 반영되지 않습니다.
>

---

## 🧷 한 줄 요약: 이벤트 처리 도구 고르기

| 하고 싶은 것 | 방법 |
| --- | --- |
| 클릭에 반응 | `onClick={handleClick}` (호출 `()` 하지 않기) |
| 기본 동작 막기 | `e.preventDefault()` |
| 핸들러가 붙은 요소 | `e.currentTarget` |
| 폼 제출 처리 | `<form onSubmit={...}>` + `preventDefault` |
| 폼 안의 input 찾기 | `form.elements.namedItem('name')` |
| 화면에 반영되는 값 | `useState` + setter (일반 변수 X) |
| 자식이 부모 값 바꾸기 | setter나 함수를 props로 전달 (`onXxx`) |
| 관련 컴포넌트 묶기 | `View.Sub = Sub` (네임스페이스 패턴) |
| side effect 위치 | 렌더링 중 X → 이벤트 핸들러 안 ✅ |
