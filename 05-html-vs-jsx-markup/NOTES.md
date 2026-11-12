# 📘 learn 디렉터리 정리

## 0. 전체 구조: `JSX_Markup.tsx`

**학습 컴포넌트를 `<dl>` 하나에 모아 두고, 데이터는 props로 넘깁니다.**

```tsx
// JSX_Markup.tsx
import * as learnData from '@/data/learn';   // 전부 learnData라는 객체 하나로 가져옴

const { statusMessage, imageType, reactLibrary, isShowReactImage, statusMessagesWithID } = learnData; // 구조 분해

return (
  <dl className="descriptionList">
    <DataBinding statusMessages={statusMessage} />
    <ConditionalRendering imageType={imageType}>
      <h1></h1>
    </ConditionalRendering>
    <ConditionalDisplay isShowReactImage={isShowReactImage} />
    <RenderList items={statusMessagesWithID} reactLibrary={reactLibrary} />
    <RenderableValues />   // 이번에 새로 추가
  </dl>
);
```

- `import * as 이름 from '...'`: 모듈에서 export한 것을 **전부 객체 하나로** 가져옵니다.
- 자식 컴포넌트들은 `<dt>`와 `<dd>`를 `<>...</>`로 감싸서 반환합니다. 그래서 부모의 `<dl>` 안에 바로 들어가도 HTML 구조가 맞습니다.
- 여는 태그와 닫는 태그 사이에 넣은 내용(`<h1></h1>`)은 자식 컴포넌트에서 `children`으로 받습니다.

---

## 1. JSX가 렌더링하는 값: `RenderableValues.tsx`

| # | 값 | 화면 | 설명 |
| --- | --- | --- | --- |
| 1 | `{'react'}`, `{19}` | react, 19 | 문자열과 숫자는 그대로 렌더링 |
| 1 | `{0}`, `{NaN}` | **0**, **NaN** | 둘 다 숫자라서 화면에 찍힘 |
| 2 | `{null}`, `{undefined}` | (없음) | 아무것도 그리지 않음 |
| 2 | `{true}`, `{false}` | (없음) | boolean도 그리지 않음 |
| 2 | `{''}` | (없음) | 빈 문자열도 그리지 않음 |
| 3 | `{['A', 'B', 'C']}` | ABC | 배열은 요소를 이어 붙여 렌더링 |
| 3 | `{{ name: 'tiger' }}` | ❌ 에러 | 객체는 렌더링할 수 없음 |

### ① 아무것도 안 그리는 값 활용

- `&&`나 삼항 연산자의 결과로 `false`나 `null`을 반환하면 "화면에 아무것도 안 그리기"가 됩니다.
- `' '`(공백 한 칸)는 빈 문자열이 아닙니다. 공백 문자가 실제로 들어가는데 눈에 안 보일 뿐입니다.

### ② 배열은 OK, 객체는 NO

```tsx
<li>배열 → {['A', 'B', 'C']}</li>                     // → ABC
{/* <li>객체 → {{ name: 'tiger' }}</li> */}           // ❌ Objects are not valid as a React child
<li>객체 → {JSON.stringify({ name: 'tiger' })}</li>   // ✅ 문자열로 바꾸면 출력 → {"name":"tiger"}
```

- 배열을 그대로 그릴 수 있기 때문에 `map()`으로 만든 **JSX 배열**도 그대로 렌더링됩니다. 이것이 리스트 렌더링의 원리입니다.

### ③ ⭐ `&&`와 숫자 0 함정

```tsx
{items.length && <ul>...</ul>}                          // ❌ length가 0이면 화면에 "0"이 찍힘
{items.length > 0 && <ul>...</ul>}                      // ✅ 비교식으로 boolean 만들기
{items.length > 0 ? <ul>...</ul> : <div>empty</div>}    // ✅ 삼항으로 빈 상태 처리
```

- `A && B`는 A가 falsy이면 **A 자체를 반환합니다**. `false`는 안 그려지지만 `0`은 숫자라서 그려집니다.
- 그래서 `&&` 왼쪽에는 항상 **boolean**이 오게 합니다 (`> 0`, `!!값`, `Boolean(값)`).

> ⚠️ 코드 확인: `const items = [];`는 타입이 없습니다. `const items: StatusMessageObject[] = [];`처럼 타입을 붙여야 합니다.
> 또 `items.id`, `items.message`는 **배열 자체**의 속성을 읽어서 `undefined`가 나옵니다. 요소를 그리려면 `items.map((item) => <li key={item.id}>{item.message}</li>)`로 써야 합니다.
>

---

## 2. 리스트 렌더링: `RenderList.tsx`

### ① `map()`으로 배열을 JSX 배열로 바꾸기

```tsx
const demoList = items.map((item) => <li key={item.id}>{item.message}</li>);              // 변수로
const renderDemoList = () => items.map((item) => <li key={item.id}>{item.message}</li>);  // 함수로

<ul>{items && demoList}</ul>
<ul>{items && renderDemoList()}</ul>   // 함수는 호출해야 함 ()
```

- 두 방법의 결과는 같습니다. 렌더 함수는 인자를 받아서 재사용할 수 있습니다.

> ⚠️ 코드 확인: `items && ...`에서 빈 배열 `[]`도 truthy라서 이 조건은 항상 참입니다. 비었을 때 안 그리려면 `items.length > 0 &&`로 써야 합니다.
>

### ② `key` 규칙

| 규칙 | 설명 |
| --- | --- |
| 고유하고 변하지 않는 값 | 보통 데이터의 `id`를 씀 |
| index는 되도록 X | 순서가 바뀌거나 추가·삭제되면 엉뚱한 항목과 매칭됨 |
| 가장 바깥 요소에 | `map` 콜백이 반환하는 맨 바깥 요소에 붙임 |

- React는 key로 어떤 항목이 추가·삭제·이동됐는지 구분합니다 (재조정, reconciliation).

### ③ 역순 정렬: `toReversed()`

```tsx
items.toReversed().map((item) => <li key={item.id}>{item.message}</li>)
```

| 메서드 | 원본 배열 |
| --- | --- |
| `reverse()` | **원본을 바꿈** ❌ |
| `toReversed()` | **새 배열 반환** ✅ |

- props나 state 같은 원본 데이터는 바꾸지 않는 것이 React의 원칙입니다 (불변성).
- `toSorted()`, `toSpliced()`도 원본을 안 바꾸는 같은 계열입니다.

### ④ 객체를 설명 목록으로 렌더링: `Object.entries()` + `Fragment`

```tsx
import { Fragment } from 'react';

const renderDefinitionList = (data: ReactLibrary) =>
  Object.entries(data).map(([key, value]) => (
    <Fragment key={key}>
      <dt>{key}</dt>
      <dd>{value}</dd>
    </Fragment>
  ));

<dl>{renderDefinitionList(reactLibrary)}</dl>
```

- `Object.entries(obj)`는 `[[키, 값], [키, 값], ...]` 형태의 배열을 반환하므로 `map`을 쓸 수 있습니다.
- `([key, value]) =>`처럼 매개변수 자리에서 바로 배열 구조 분해를 합니다.
- **`<>...</>`에는 key를 줄 수 없습니다.** key가 필요하면 `<Fragment key={...}>`를 씁니다.

---

---

# 📗 practice 디렉터리 정리 (`renderList/`)

## 1. `data.ts`: 타입과 데이터

```tsx
export interface Song {
  id: string;
  title: string;
  artist: string;
  isLiked: boolean;
}

export interface PlaylistInfo {
  만든이: string;     // 한글 키도 가능
  장르: string;
  공개여부: string;
  업데이트: string;
}

export interface Playlist {
  id: string;
  title: string;
  tags: string[];        // 문자열 배열
  info: PlaylistInfo;    // 객체 하나
  songs: Song[];         // 객체 배열
}

export const playlists: Playlist[] = [ /* P-01, P-02 */ ];
```

- interface 안에 다른 interface를 넣어서 데이터 구조를 조합합니다.
- `PlaylistInfo`의 한글 키(만든이, 장르...)는 나중에 `Object.entries`로 꺼내면 그대로 `<dt>` 라벨이 됩니다.
- 데이터 특징: `P-01`은 곡 4개 중 좋아요 2개이고, `P-02`는 좋아요가 0개라서 **빈 목록 처리**를 확인할 수 있습니다.
- 다른 파일에서는 `import type { Playlist, Song } from './data'`로 타입만 가져옵니다.

## 2. `PlayListCard.tsx`: 리스트 렌더링 실습

### props 받기와 구조 분해

```tsx
interface Props { playlist: Playlist; }

function PlaylistCard({ playlist }: Props): JSX.Element {
  const { title, tags, info, songs } = playlist;
```

### ① `for...of` + `push`로 JSX 배열 만들기 (TODO 1)

```tsx
const tagItems: JSX.Element[] = [];

for (const tag of tags) {
  tagItems.push(<li key={tag} className="tag">#{tag}</li>);
}

<ul className="tags">{tagItems}</ul>
```

- `map`을 안 써도 JSX를 배열에 담기만 하면 렌더링됩니다 (배열은 렌더링 가능하니까).
- 빈 배열에는 타입 `JSX.Element[]`를 붙여 줘야 합니다.
- 태그 문자열을 key로 쓰므로 **태그가 중복되면 안 됩니다**.

### ② 렌더 함수 만들기: 재사용 템플릿 (TODO 2)

```tsx
const renderSongItem = ({ id, title, artist, isLiked }: Song) => (
  <li key={id}>
    <span className="songTitle">{title}</span>
    <span className="artist">{artist}</span>
    {isLiked && <span aria-label="좋아요">❤️</span>}
  </li>
);

<ol className="songs">{songs.map(renderSongItem)}</ol>
```

- 매개변수 자리에서 바로 구조 분해하고 타입(`Song`)을 붙였습니다.
- `map(renderSongItem)`은 `map((song) => renderSongItem(song))`과 같습니다. 함수 이름만 넘기면 됩니다.
- 이 함수 하나를 **전체 곡 / 역순 / 좋아요 목록** 세 곳에서 재사용합니다.
- `isLiked`는 boolean이라서 `&&`를 써도 0 함정이 없습니다.

### ③ `filter`로 조건에 맞는 것만 고르기 (TODO 3)

```tsx
const likedSongs = songs.filter((song) => song.isLiked);
```

- 콜백이 `true`를 반환한 요소만 모아서 **새 배열**을 반환합니다 (원본 유지).

### ④ `Object.entries` + `map`으로 정보 목록 (TODO 4)

```tsx
<dl className="info">
  {Object.entries(info).map(([key, value]) => (
    <Fragment key={key}>
      <dt>{key}</dt>
      <dd>{value}</dd>
    </Fragment>
  ))}
</dl>
```

- learn의 `renderDefinitionList`와 같은 패턴입니다.

### ⑤ 곡 수 출력

```tsx
<h3>전체 곡 ({songs.length})</h3>
```

### ⑥ 역순 렌더링 (TODO 5)

```tsx
<ol className="songs">{songs.toReversed().map(renderSongItem)}</ol>
```

- "최근 추가 순" = 배열 뒤쪽이 최신이라는 뜻입니다. `toReversed()`라서 props 원본은 그대로입니다.

### ⑦ ⭐ 빈 목록 처리: 리스트 렌더링 + 조건부 렌더링 (TODO 6)

```tsx
{likedSongs.length > 0
  ? <ul className="songs">{likedSongs.map(renderSongItem)}</ul>
  : <p className="empty">좋아요를 누른 곡이 없습니다.</p>}
```

- `length > 0`으로 boolean을 만들어서 0이 찍히는 함정을 피합니다.
- 목록이 비었을 때 안내 문구를 보여 주면 사용자가 상황을 알 수 있습니다 (UX).

> ⚠️ 코드 확인: `<ul className="songs"> {likedSongs.map(...)} </ul>`처럼 중괄호 양옆에 공백을 두면 그 공백이 텍스트로 `<ul>` 안에 들어갑니다. `<ul>{...}</ul>`처럼 붙여 쓰는 게 깔끔합니다.
>

---

## 🧷 한 줄 요약: 리스트 렌더링 도구 고르기

| 하고 싶은 것 | 방법 |
| --- | --- |
| 배열 → 목록 | `arr.map(item => <li key={item.id}>...</li>)` |
| 반복문으로 목록 | `for...of` + `push`로 JSX 배열 만들기 |
| 같은 모양 재사용 | 렌더 함수 `renderXxx = (item) => <li>...</li>` |
| 조건에 맞는 것만 | `arr.filter(...)` 후 `map` |
| 역순 | `arr.toReversed()` (원본 유지) |
| 객체 → 목록 | `Object.entries(obj).map(([k, v]) => ...)` |
| 태그 여러 개 + key | `<Fragment key={...}>` (`<>`는 key 불가) |
| 빈 목록 처리 | `arr.length > 0 ? 목록 : 안내문` |
| 안 그려지는 값 | `null`, `undefined`, `true`, `false`, `''` |
| 주의 | `0`과 `NaN`은 그려짐 → `&&` 왼쪽엔 boolean |
