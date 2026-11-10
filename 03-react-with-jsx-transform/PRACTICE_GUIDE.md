# 01. React 시작하기 – createElement와 createRoot로 화면 렌더링

> 빌드 도구 없이 브라우저 ES 모듈만으로 React 앱을 렌더링하고, "데이터가 바뀌면 다시 렌더링한다"는 React의 기본 흐름을 직접 구현해 봅니다.

- HTML 마크업을 `React.createElement()` 호출로 옮겨 **React 엘리먼트(가상 DOM 객체)** 를 만든다.
- `createRoot(container).render(element)` 로 엘리먼트를 실제 DOM에 렌더링/언마운트한다.
- 배열 데이터를 `map()` 으로 리스트 렌더링하고, 형제 요소에 **`key`** 가 필요한 이유를 이해한다.
- `Proxy` 로 반응성 데이터를 만들어 **데이터 변경 → 재렌더링** 흐름을 체험한다.

## 준비

- 시작 폴더: 별도 템플릿 없음. 이 폴더(`01-getting-started-with-react`)에서 **실습 1 `src/1-rendering-react-app.js` → 실습 2 `src/main.js`** 순서로 진행합니다.
- 실행: `npm install`(최초 1회) → `npm run dev` → <http://localhost:3000>
  - `server.js` 가 live-server 를 3000 포트로 띄우고 `public/` 을 `/` 에 마운트합니다(이미지 경로가 `/planet/...`, `/icons/...` 인 이유).
- React는 `src/lib/react.js`, `src/lib/react-dom.js` 에서 esm.sh CDN 모듈을 재수출해 사용합니다(인터넷 연결 필요).
- 사전 지식: HTML/CSS 기본, ES 모듈(`import`/`export`), 배열 `map()`, 구조 분해 할당.

## 진행 순서 한눈에 보기

| 파트 | 파일 | 하는 일 | Step |
| --- | --- | --- | --- |
| 실습 1 | `src/1-rendering-react-app.js` | 고정된 데이터로 리스트를 **한 번** 그리기 | 1 ~ 5 |
| 실습 2 | `src/main.js` | 데이터가 바뀔 때마다 **다시** 그리기 (Proxy 반응성) | 6 ~ 8 |

`index.html`의 `<script type="module" src="...">`가 어떤 파일을 실행할지 정합니다. 실습 1을 시작할 때 `src/1-rendering-react-app.js`로 바꾸고, 실습 2를 시작할 때 `src/main.js`로 되돌립니다.

## 실습 1 — `1-rendering-react-app.js`: 정적인 화면 그리기

### Step 1. 목표 마크업 확인하고 실행 파일 바꾸기
- 목표: React로 만들 결과물을 먼저 HTML로 보고, 실습 1 파일이 실행되도록 연결한다.
- 작업 파일: `index.html`
- 진행:
  1. `index.html`에서 주석 처리된 `<ul class="planet">` 블록을 잠시 풀어 브라우저에서 모양을 보여준다.
  2. `ul > li.item > img + span.content + button > img` 구조를 화이트보드에 트리로 그린다.
  3. 다시 주석 처리하고 `<div id="app"></div>`만 남긴다. "이 빈 div를 React가 채운다"고 설명한다.
  4. script의 `src`를 `src/1-rendering-react-app.js`로 바꾼다.
- 핵심 코드:
  ```html
  <script type="module" src="src/1-rendering-react-app.js"></script>
  ...
  <div id="app"></div>
  <!-- <ul class="planet" lang="en">
    <li class="item">
      <img src="/planet/image-01.jpg" alt="" />
      <span class="content">Climatology</span>
      <button type="button" title="아이템 이동 (위/아래 화살표 키 활용)">
        <img src="/icons/handle.svg" alt="아이템 이동 (위/아래 화살표 키 활용)" />
      </button>
    </li>
  </ul> -->
  ```
- 확인 포인트: 주석을 풀었을 때 행성 이미지, 제목, 핸들 버튼이 한 줄로 보인다.
- 💡 설명 포인트: 장식용 이미지는 `alt=""`, 의미 있는 아이콘 버튼은 `alt`/`title`로 이름을 준다(접근성).

### Step 2. React 불러오기와 루트 만들기
- 목표: React/ReactDOM 모듈을 가져와 `#app`에 React 루트를 만든다.
- 작업 파일: `src/1-rendering-react-app.js`
- 진행:
  1. `src/lib/react.js`를 열어 esm.sh 모듈을 다시 내보내는 구조임을 보여준다.
  2. `import React from './lib/react.js'`, `import { createRoot } from './lib/react-dom.js'`를 작성한다.
  3. `document.getElementById('app')`로 컨테이너를 찾고 `createRoot(container)`를 호출한다.
- 핵심 코드:
  ```js
  import React from "./lib/react.js";
  import { createRoot } from "./lib/react-dom.js";

  const container = document.getElementById("app");
  const reactDomRoot = createRoot(container);
  ```
- 확인 포인트: 콘솔 에러 없이 로드된다. Network 탭에서 esm.sh 요청을 확인한다.
- 💡 설명 포인트: `react`는 엘리먼트를 만드는 라이브러리, `react-dom/client`는 그것을 브라우저 DOM에 그리는 렌더러다. 옛 `ReactDOM.render()`는 React 19에서 제거되었고 `createRoot().render()`가 표준이다.

### Step 3. createElement로 엘리먼트 하나씩 만들기
- 목표: 가장 안쪽 요소부터 `createElement(type, props, ...children)`로 만든다.
- 작업 파일: `src/1-rendering-react-app.js`
- 진행:
  1. 버튼 안의 `img` → `button` → `span` → 썸네일 `img` → `li` 순으로 작성한다.
  2. `class` 대신 `className`을 써야 하는 이유를 설명한다.
  3. `console.log(li)`로 엘리먼트가 평범한 JS 객체(`type`, `props`)임을 보여준다.
- 핵심 코드:
  ```js
  const childImage = React.createElement("img", {
    src: "/icons/handle.svg",
    alt: "아이템 이동",
  });
  const button = React.createElement(
    "button",
    { type: "button", title: "아이템 이동" },
    childImage
  );
  const span = React.createElement("span", { className: "content" }, "Life on Earth");
  const img = React.createElement("img", { src: "/planet/image-01.jpg", alt: "" });

  const li = React.createElement("li", { className: "item" }, img, span, button);
  ```
- 확인 포인트: 콘솔에 `{ type: 'li', props: { className, children: [...] } }` 형태가 찍힌다.
- 💡 설명 포인트: 세 번째 인자부터는 모두 `children`이 된다. 아직 화면에는 아무것도 안 나온다(만들기와 그리기는 다른 일).

### Step 4. 데이터로 리스트 만들기 (map + key)
- 목표: `listData.items` 배열을 `map()`으로 `li` 엘리먼트 배열로 바꾼다.
- 작업 파일: `src/1-rendering-react-app.js`
- 진행:
  1. 파일 위쪽에 `listData` 객체(아이템 4개)를 선언한다.
  2. Step 3에서 하나씩 만든 코드를 `map(({ id, title }) => ...)` 안으로 옮긴다.
  3. 일부러 `key`를 빼고 렌더링해 콘솔 경고를 보여준 뒤 다시 넣는다(Step 5에서 렌더링한 후 확인).
- 핵심 코드:
  ```js
  const listData = {
    items: [
      { id: "1", title: "Life on Earth" },
      { id: "2", title: "Jupiter’s massive storms" },
      { id: "3", title: "Explore Mars now" },
      { id: "4", title: "Moonlight and craters" },
    ],
  };

  const children = listData.items.map(({ id, title }) =>
    React.createElement(
      "li",
      { key: id, className: "item" },
      React.createElement("img", { src: `/planet/image-0${id}.jpg`, alt: "" }),
      React.createElement("span", { className: "content" }, title),
      React.createElement(
        "button",
        { type: "button", title: "아이템 이동" },
        React.createElement("img", { src: "/icons/handle.svg", alt: "아이템 이동" })
      )
    )
  );
  ```
- 확인 포인트: `key`가 없으면 `Each child in a list should have a unique "key" prop` 경고가 뜬다.
- 💡 설명 포인트: `key`는 형제 사이에서 고유해야 하고 props로 전달되지 않는다(React 내부 비교용).

### Step 5. ul로 감싸 렌더링하고 언마운트해 보기
- 목표: 루트에 엘리먼트를 `render()`하고, `unmount()`로 지워 본다.
- 작업 파일: `src/1-rendering-react-app.js`
- 진행:
  1. `ul.planet` 엘리먼트에 `children` 배열을 넘긴다.
  2. `render()`, `unmount()` 함수로 감싸고 `render()`를 호출한다.
  3. 콘솔에서 직접 호출할 수 있도록 잠깐 `window.unmount = unmount`로 노출해 시연한다(선택).
- 핵심 코드:
  ```js
  const ul = React.createElement("ul", { className: "planet", lang: "en" }, children);

  function render() {
    reactDomRoot.render(ul);
  }

  function unmount() {
    reactDomRoot.unmount();
  }

  render();
  ```
- 확인 포인트: 행성 아이템 4개가 보이고, Elements 패널에서 `#app` 안에 `ul`이 생긴다. `unmount()` 후에는 `#app`이 비고, 같은 루트에 다시 `render()`하면 에러가 난다.
- 💡 설명 포인트: 여기까지는 데이터가 고정되어 있어 한 번 그리면 끝이다. "데이터가 바뀌면 어떻게 다시 그릴까?"라는 질문을 던지고 실습 2로 넘어간다.

## 실습 2 — `main.js`: 데이터가 바뀌면 다시 그리기

### Step 6. 실행 파일을 main.js로 바꾸고 엘리먼트 생성을 render() 안으로 옮기기
- 목표: 데이터가 바뀔 때마다 엘리먼트를 새로 만들 수 있도록 구조를 바꾼다.
- 작업 파일: `index.html`, `src/main.js`
- 진행:
  1. `index.html`의 script `src`를 `src/main.js`로 되돌린다.
  2. 실습 1의 코드를 가져오되, `children`과 `ul`을 만드는 코드를 `render()` 함수 안으로 옮긴다.
  3. `listData.items`는 빈 배열로 시작한다.
  4. 실습 1처럼 바깥에서 만들면 `ul`이 처음 데이터로 고정되어 버린다는 점을 비교해서 설명한다.
- 핵심 코드:
  ```js
  const listData = {
    items: [],
  };

  const reactDomRoot = ReactDOM.createRoot(document.getElementById('app'));

  function render() {
    const children = reactiveListData.items.map(({ id, title }) =>
      React.createElement('li', { key: id, className: 'item' }, /* img, span, button */)
    );

    const list = React.createElement('ul', { className: 'planet', lang: 'en' }, children);
    reactDomRoot.render(list);
  }
  ```
- 확인 포인트: 최초 렌더링 시 빈 `ul`만 생긴다(아직 `reactiveListData`는 다음 Step에서 만든다. 시연할 때는 `listData`로 먼저 확인해도 된다).
- 💡 설명 포인트: React 엘리먼트는 한 번 만들면 바뀌지 않는 스냅샷이다. 화면을 바꾸려면 새 데이터로 엘리먼트를 다시 만들어 `render()`한다. 이것이 나중에 배울 컴포넌트 함수가 매번 다시 실행되는 이유다.

### Step 7. Proxy로 반응성 데이터 만들기
- 목표: 데이터에 값을 대입하면 자동으로 `render()`가 호출되게 한다.
- 작업 파일: `src/main.js`
- 진행:
  1. `new Proxy(listData, { get, set })`를 작성한다. `set`에서 값을 저장한 뒤 `render()`를 호출한다.
  2. 파일의 주석(target / prop / newValue 설명)을 보며 get, set이 언제 발생하는지 짚는다.
  3. `render()` 안에서 `reactiveListData.items`를 읽도록 맞춘다.
- 핵심 코드:
  ```js
  const reactiveListData = new Proxy(listData, {
    get(target, prop) {
      return target[prop];
    },
    set(target, prop, newValue) {
      target[prop] = newValue;
      render();
      return true;
    },
  });
  ```
- 확인 포인트: 콘솔에서 `reactiveListData.items = [{ id: 1, title: 'Test' }]`처럼 대입하면 화면이 바로 바뀐다(콘솔에서 쓰려면 잠깐 `window.reactiveListData = reactiveListData`로 노출).
- 💡 설명 포인트: 이후 배울 `useState`의 아이디어(상태 변경 → 다시 렌더링)를 손으로 흉내 낸 것이다. `set` 트랩은 `true`를 반환해야 한다.

### Step 8. 시간차 업데이트로 자동 재렌더링 확인
- 목표: 1초 간격으로 아이템을 추가하면서 화면이 갱신되는 것을 관찰한다.
- 작업 파일: `src/main.js`
- 진행:
  1. 최초 `render()`를 호출한 뒤 `setTimeout` 4개로 1초 간격 아이템을 추가한다.
  2. 기존 배열을 바꾸지 않고 전개 연산자로 새 배열을 만들어 대입한다(그래야 `set` 트랩이 발생).
  3. Elements 패널을 열어 새로 추가된 `li`만 하이라이트되며 갱신되는 것을 보여준다.
  4. `reactiveListData.items.push(...)`로 바꿔 화면이 안 바뀌는 것을 시연한 뒤 되돌린다.
- 핵심 코드:
  ```js
  render(); // 최초 마운트

  setTimeout(() => {
    reactiveListData.items = [
      ...reactiveListData.items,
      { id: 1, title: 'Climatology' },
    ];
  }, 1000);
  ```
- 확인 포인트: 1~4초에 걸쳐 아이템이 하나씩 늘어난다. `push`로 바꾸면 늘어나지 않는다.
- 💡 설명 포인트: `push`는 `items` 배열 내부만 바꾸고 `items` 속성에 대입하지 않으므로 `set`이 발생하지 않는다. 불변 업데이트가 필요한 이유이며, 9차시 `useState`에서도 똑같이 적용된다.

## 정리 & 퀴즈

- React 엘리먼트는 화면을 **설명하는 객체**이고, `createRoot().render()` 가 이를 실제 DOM으로 반영한다.
- 리스트 렌더링 시 형제 요소에 고유한 `key` 를 준다.
- 데이터가 바뀌면 엘리먼트를 다시 만들어 `render()` 하고, React는 바뀐 부분만 DOM에 반영한다.

퀴즈
1. `React.createElement('span', { className: 'content' }, title)` 에서 세 번째 인자는 props의 어떤 키로 들어가나요?
2. Proxy 예제에서 `reactiveListData.items.push(newItem)` 을 하면 화면이 갱신될까요? 이유는?
3. `key` 를 배열 인덱스로 쓰면 어떤 문제가 생길 수 있나요?

## 코드 변경 내역

- `index.html` – 실습 순서(1-rendering → main.js) 안내 주석 추가. 동작 변경 없음
- 그 외 없음 (명백한 버그나 React 19 기준 구식 패턴이 발견되지 않음)
