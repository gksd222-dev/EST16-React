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

## 5. 새 컴포넌트 연결: `View.tsx`

**`RespondingToEvents` 안에 주제별 컴포넌트 3개를 추가로 import해서 차례로 렌더링합니다.**

```tsx
import EventHandleProp from './responding-to-events/EventHandleProp';
import UseStateCounter from './responding-to-events/UseStateCounter';
import EventPropagation from './responding-to-events/EventPropagation';
import EventWithSideEffects from './responding-to-events/EventWithSideEffects';

function RespondingToEvents() {
  // ... (폼 제출 코드는 3번 참고)
  return (
    <div className="viewRespondingToEvent">
      {/* ... form ... */}
      <EventHandleProp text={text} setText={setText} message={message} onPrintMessage={updateMessage} />
      <UseStateCounter />        {/* 6. useState */}
      <EventPropagation />       {/* 7~8. 이벤트 전파 */}
      <EventWithSideEffects />   {/* 9. side effect */}
    </div>
  );
}
```

- 새 컴포넌트 3개는 **props 없이** 씁니다. 각 컴포넌트가 필요한 state를 자기 안에서 만들어 씁니다.
- 주제마다 파일을 하나씩 두고 `<details>`로 접었다 펼 수 있게 만드는 구조입니다.

---

## 6. useState: 컴포넌트의 기억: `UseStateCounter.tsx`

**일반 변수는 바뀌어도 화면이 그대로이고, state는 setter를 호출하면 다시 렌더링됩니다.**

```tsx
import { useState } from 'react';

function UseStateCounter() {
  let localCount = 0;                        // 일반 변수: 렌더링마다 0으로 초기화
  const [count, setCount] = useState(0);     // state: React(fiber)가 따로 보관

  const handleLocalIncrement = () => {
    localCount += 1;
    console.log(localCount);                 // 콘솔에서는 늘어나지만 화면은 그대로
  };

  const handleIncrement = () => {
    setCount((prev) => prev + 1);            // 업데이터 함수: 이전 값을 받아 계산
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);            // → 한 번 클릭에 +3
  };

  const handleDecrement = () => {
    setCount(count - 1);                     // 값 직접 전달
  };

  const handleReset = () => {
    setCount(0);
  };

  return (
    <details open>
      <summary><b>useState: 컴포넌트의 기억</b></summary>
      <button type="button" onClick={handleLocalIncrement}>지역 변수 + 1</button>
      <output>{localCount}</output>
      <button type="button" onClick={handleIncrement}>상태 변수 + 1</button>
      <output>{count}</output>
      {/* ... - 1, 초기화 버튼 ... */}
    </details>
  );
}
```

### ① 일반 변수가 화면에 안 바뀌는 이유

- React는 **일반 변수 값이 바뀌어도 다시 렌더링하지 않습니다**.
- 다른 이유로 다시 렌더링되더라도 함수가 처음부터 다시 실행되기 때문에 `let localCount = 0`으로 **다시 초기화**됩니다.

### ② ⭐ useState가 하는 일

- state 값은 컴포넌트 함수 안이 아니라 **React 내부 저장소(fiber)에 보관**됩니다. 그래서 렌더링 사이에도 값이 유지됩니다.
- `setCount`에는 **다시 렌더링을 예약하는 기능(render trigger)** 이 들어 있습니다.

### ③ ⭐ 값 전달 vs 업데이터 함수

| | 값 전달 `setCount(count + 1)` | 업데이터 함수 `setCount(prev => prev + 1)` |
| --- | --- | --- |
| 기준 값 | 이번 렌더링의 `count` (고정된 스냅샷) | 바로 앞 업데이트의 결과 (`prev`) |
| 3번 연달아 호출 | `+1`만 됨 (셋 다 같은 `count` 기준) | `+3` 됨 (차례로 이어서 계산) |
| 언제 쓰나 | 단순한 값 넣기 (`setValue(input.value)`, `setCount(0)`) | **이전 값을 기반으로** 계산할 때 |

- state 업데이트는 **즉시 반영되지 않습니다**. React가 핸들러 안의 업데이트를 모아서 한 번에 처리합니다 (**batching**).
- 그래서 `setCount(count + 1)`을 세 번 써도 `count`는 이번 렌더링의 값 그대로라 결과는 `+1`입니다.

> ⚠️ 코드 확인: `+ 1` 버튼은 업데이터를 세 번 호출해서 실제로는 **3씩** 늘어납니다 (batching 실험용이면 괜찮지만 버튼 이름과는 다릅니다). 또 `<output>{count}</output>`이 세 곳에 있는데 모두 같은 state라서 늘 같은 값을 보여줍니다.
>

---

## 7. rest props로 속성 넘기기: `LayoutBox.tsx`

**필요한 props만 꺼내고 나머지는 `...restProps`로 모아서 `<div>`에 한꺼번에 넘깁니다.**

```tsx
interface Props {
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  style: React.CSSProperties & { [key: string]: string | number };   // CSS 변수(--color) 허용
  title?: string;
  name?: string;
  children?: React.ReactNode;
}

function LayoutBox({ onClick, children, ...restProps }: Props) {
  return (
    // 왼쪽 onClick: React가 정한 DOM 이벤트 속성
    // 오른쪽 {onClick}: 부모에게서 받은 핸들러 함수
    <div className="box" onClick={onClick} {...restProps}>
      {children}
    </div>
  );
}
```

- `...restProps`에는 `style`, `title`, `name`이 들어가고, `{...restProps}`로 펼치면 `<div style={...} title={...} name={...}>`과 같습니다.
- `children`: 여는 태그와 닫는 태그 사이에 넣은 내용입니다. 그래서 `LayoutBox` 안에 `LayoutBox`를 **중첩**할 수 있습니다.
- `React.CSSProperties`에는 `--color` 같은 **CSS 사용자 정의 속성**이 없습니다. 그래서 `& { [key: string]: string | number }`로 아무 키나 허용하도록 넓혔습니다.
- 컴포넌트 props 이름이 `onClick`이라고 저절로 이벤트가 되지는 않습니다. **DOM 요소(`<div>`)의 `onClick`에 넘겨야** 클릭에 반응합니다.

> ⚠️ 코드 확인: `name`은 `<div>`의 표준 HTML 속성이 아닙니다. 화면에는 영향이 없지만 의미 있는 값을 넘기려면 `data-name`처럼 `data-` 속성을 쓰는 편이 맞습니다.
>

---

## 8. 이벤트 전파 막기: `EventPropagation.tsx`

**중첩된 상자를 클릭하면 이벤트가 바깥 상자로 퍼지는데(버블링), `e.stopPropagation()`으로 막습니다.**

```tsx
import LayoutBox from './LayoutBox';

function EventPropagation() {
  const returnHandlePrint = (color: string, e: React.MouseEvent) => {
    e.stopPropagation();           // 부모 상자로 이벤트가 올라가지 않게 막기
    console.log(color, e.target);
  };

  return (
    <details>
      <summary><b>이벤트 전파 & 기본 동작 차단</b></summary>
      <LayoutBox title="layoutBox" name="레이아웃박스" style={styles.cyan} onClick={(e) => returnHandlePrint('cyan', e)}>
        <LayoutBox style={styles.magenta} onClick={(e) => returnHandlePrint('magenta', e)}>
          <LayoutBox style={styles.yellow} onClick={(e) => returnHandlePrint('yellow', e)}>
            <LayoutBox style={styles.purple} onClick={(e) => returnHandlePrint('purple', e)} />
          </LayoutBox>
        </LayoutBox>
      </LayoutBox>
    </details>
  );
}

const styles = {
  cyan:    { '--color': 'var(--cyan)' },      // .box의 background-color: var(--color)를 덮어씀
  magenta: { '--color': 'var(--magenta)' },
  yellow:  { '--color': 'var(--yellow)' },
  purple:  { '--color': 'var(--purple, #7423f6)' },   // --purple이 없으면 #7423f6
};
```

### ① ⭐ 이벤트 버블링

| 상황 | 가장 안쪽(purple) 클릭 시 콘솔 |
| --- | --- |
| `stopPropagation()` 없음 | `purple` → `yellow` → `magenta` → `cyan` (4번, 안 → 밖) |
| `stopPropagation()` 있음 | `purple` (1번) |

- 이벤트는 클릭한 요소에서 시작해서 **부모 쪽으로 차례로 올라갑니다**. 이걸 버블링(bubbling)이라고 합니다.
- `e.stopPropagation()`: **전파(위로 올라가는 것)** 를 멈춥니다.
- `e.preventDefault()`: **브라우저 기본 동작**(링크 이동, 폼 전송)을 막습니다. 둘은 서로 다른 기능입니다.
- `e.target`은 실제 클릭된 요소, `e.currentTarget`은 핸들러가 붙은 요소입니다. 이 예제에서는 `stopPropagation` 때문에 둘이 같습니다.

### ② 핸들러에 원하는 인수 넘기기

`onClick`은 **이벤트 객체만** 넘겨줍니다. `color` 같은 값을 더 넘기고 싶을 때 쓰는 방법이 두 가지입니다.

```tsx
// 방법 1 (지금 코드): 인라인 화살표 함수로 감싸기
onClick={(e) => returnHandlePrint('cyan', e)}

// 방법 2 (주석 처리된 코드): 핸들러를 반환하는 고차 함수
const returnHandlePrint = (color: string) => (e: React.MouseEvent<HTMLDivElement>) => {
  e.stopPropagation();
  console.log(color, e.target);
};
onClick={returnHandlePrint('cyan')}   // 호출 결과(= 핸들러 함수)를 전달
```

- 방법 2에서 `returnHandlePrint('cyan')`은 **함수를 반환**하므로 괄호를 붙여도 됩니다. 1번 규칙("호출하지 말고 전달")을 어기는 것처럼 보이지만, 결국 전달되는 건 함수입니다.
- 함수를 반환하거나 함수를 인수로 받는 함수를 **고차 함수**라고 합니다.

> ⚠️ 코드 확인: 함수 이름은 `returnHandlePrint`(핸들러를 반환)인데, 지금은 `return` 부분이 주석이라 그냥 **바로 실행하는 함수**입니다. 방법 1을 쓸 거면 `handlePrint`처럼 이름을 바꾸는 게 헷갈리지 않습니다. 또 제목은 "기본 동작 차단"도 다루지만, 이 파일에는 `preventDefault` 예제가 없습니다.
>

---

## 9. 이벤트 핸들러와 side effect: `EventWithSideEffects.tsx`

**이벤트 핸들러는 순수할 필요가 없어서 무언가를 바꾸는(side effect) 코드를 두기 가장 좋은 곳입니다.**

```tsx
import { useState } from 'react';

function EventWithSideEffects() {
  const [, setRender] = useState(0);              // 값은 안 쓰고 setter만 꺼냄
  const forceRender = () => setRender((prev) => prev + 1);   // 강제로 다시 렌더링

  const handleSideEffect = () => {
    const count = document.querySelector('.count') as HTMLOutputElement;

    const timeout = setInterval(() => {
      --count.value;                              // DOM 값을 직접 1씩 줄임
      if (count.value <= 0) clearInterval(timeout);   // 0이 되면 반복 멈춤
    });                                           // 지연 시간 생략 → 0ms (최대한 빠르게)
  };

  return (
    <details open>
      <summary><b>이벤트 핸들러와 사이드 이팩트</b></summary>
      <div className="countDown">
        <button type="button" onClick={handleSideEffect}>카운트 다운</button>
        <output className="count">100</output>
      </div>
    </details>
  );
}
```

### ① side effect를 둘 수 있는 곳

| 위치 | side effect | 이유 |
| --- | --- | --- |
| 컴포넌트 본문 (렌더링 중) | ❌ | 렌더링은 순수해야 함. StrictMode에서 두 번 실행됨 |
| 이벤트 핸들러 | ✅ | 사용자가 행동할 때 한 번 실행됨 |
| `useEffect` | ✅ | 이벤트 없이 렌더링 **후에** 실행하고 싶을 때 |

- `const [, setRender] = useState(0)`: 배열 구조 분해에서 첫 칸을 비워 **setter만** 받습니다.
- `setInterval(fn, ms)`은 `ms`마다 `fn`을 반복하고, 반환한 id를 `clearInterval(id)`에 넘기면 멈춥니다.

> ⚠️ 코드 확인:
> 1. 주석에는 "StrictMode가 한 번 더 실행해서 2씩 감소한다"고 되어 있는데, StrictMode가 두 번 실행하는 건 **렌더링 함수, 업데이터 함수, effect**이고 **이벤트 핸들러는 한 번만** 실행됩니다. 2씩 줄었다면 버튼을 두 번 눌러 interval이 2개 돌아간 경우일 가능성이 큽니다. (누를 때마다 새 interval이 생기고, 막는 코드가 없습니다.)
> 2. `count.value`는 문자열이라 `--count.value`는 JS에서는 숫자로 바뀌어 동작하지만, TypeScript에서는 "산술 연산자는 number 타입이어야 한다" 에러가 납니다.
> 3. `querySelector`로 DOM을 직접 바꾸는 건 **명령형**이고, React가 모르는 변경입니다. React 방식은 `const [count, setCount] = useState(100)` + `setCount(prev => prev - 1)`입니다.
> 4. `forceRender`는 만들기만 하고 쓰지 않습니다.
>

---

## 🧷 한 줄 요약: 이벤트 처리 도구 고르기

| 하고 싶은 것 | 방법 |
| --- | --- |
| 클릭에 반응 | `onClick={handleClick}` (호출 `()` 하지 않기) |
| 기본 동작 막기 | `e.preventDefault()` |
| 부모로 전파 막기 | `e.stopPropagation()` |
| 핸들러가 붙은 요소 / 실제 클릭된 요소 | `e.currentTarget` / `e.target` |
| 핸들러에 인수 더 넘기기 | `onClick={(e) => fn('값', e)}` 또는 고차 함수 |
| 폼 제출 처리 | `<form onSubmit={...}>` + `preventDefault` |
| 폼 안의 input 찾기 | `form.elements.namedItem('name')` |
| 화면에 반영되는 값 | `useState` + setter (일반 변수 X) |
| 이전 값 기반으로 업데이트 | `setCount(prev => prev + 1)` |
| 자식이 부모 값 바꾸기 | setter나 함수를 props로 전달 (`onXxx`) |
| 나머지 props 한꺼번에 넘기기 | `({ a, ...rest }) => <div {...rest} />` |
| 관련 컴포넌트 묶기 | `View.Sub = Sub` (네임스페이스 패턴) |
| side effect 위치 | 렌더링 중 X → 이벤트 핸들러 ✅ / `useEffect` ✅ |
