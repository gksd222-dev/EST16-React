# 📗 practice 디렉터리 정리 (`pages/products/components-1/`)

## 0. 전체 구조: `ProductPage-1.tsx`

**상태는 부모(`ProductPage`)가 갖고, 자식에게는 값과 "값을 바꾸는 함수"를 props로 내려줍니다.**

```tsx
// ProductPage-1.tsx
function ProductPage() {
  const [products] = useState(productData);            // 원본 데이터 (변경 안 함)
  const [inStockOnly, setInStockOnly] = useState(false); // 체크박스 상태
  const [searchTerm, setSearchTerm] = useState('');      // 검색어 상태

  // ⭐ 파생 데이터: 상태로 따로 만들지 않고, 렌더링할 때마다 계산
  const searchedProductList = products.filter((product) =>
    product.name.includes(searchTerm) && (!inStockOnly || product.inStock)
  );

  const handleSearch = (userInput: string) => setSearchTerm(userInput);

  return (
    <div className="ProductPage">
      <h1>상품 목록</h1>
      <ProductSearchBox onSearch={handleSearch} searchTerm={searchTerm} />
      <ProductStockFilter inStockOnly={inStockOnly} onInStockOnlyChange={setInStockOnly} />
      <ProductList products={searchedProductList} />
      <ProductListCount
        productCount={searchedProductList.length}   // 표시 개수
        totalProductCount={products.length}          // 전체 개수
      />
    </div>
  );
}
```

- 이 페이지가 관리하는 상태는 **검색어(`searchTerm`)와 재고 필터(`inStockOnly`) 두 개**뿐입니다.
- 필터링된 목록(`searchedProductList`)과 개수(`.length`)는 상태에서 **계산해서 얻는 값**이라 `useState`로 만들 필요가 없습니다. 상태를 늘리면 서로 값이 어긋날 위험만 생깁니다.
- 자식은 상태를 직접 바꾸지 못하고, 부모가 넘겨준 함수(`onSearch`, `onInStockOnlyChange`)를 호출해서 부모에게 알립니다. 이것을 **상태 끌어올리기(Lifting State Up)** 라고 합니다.
- `setInStockOnly`처럼 **setter 함수를 그대로 props로 넘겨도** 됩니다. 타입이 `(checked: boolean) => void`와 맞기 때문입니다.

### ① 필터 조건 읽는 법

```tsx
product.name.includes(searchTerm) && (!inStockOnly || product.inStock)
```

| `inStockOnly` | `!inStockOnly \|\| product.inStock` | 결과 |
| --- | --- | --- |
| `false` (체크 안 함) | `true \|\| ...` → 항상 `true` | 재고와 상관없이 모두 통과 |
| `true` (체크함) | `false \|\| product.inStock` | 재고 있는 상품만 통과 |

- `''.includes('')`는 `true`입니다. 그래서 검색어가 빈 문자열이면 모든 상품이 통과합니다.
- `includes`는 대소문자를 구분합니다. 영문 상품명이 있다면 `toLowerCase()`로 맞춰 비교해야 합니다.

### ② 데이터 흐름 한눈에 보기

```
            ┌──────────── ProductPage (state: searchTerm, inStockOnly) ────────────┐
            │                                                                      │
  onSearch ↑│ searchTerm ↓     onInStockOnlyChange ↑│ inStockOnly ↓   products ↓   count ↓
   ProductSearchBox            ProductStockFilter            ProductList    ProductListCount
                                                                  ↓
                                                             ProductItem
```

- **↓ 데이터(props)는 아래로**, **↑ 이벤트(함수 호출)는 위로** 흐릅니다.

> ⚠️ 코드 확인: `const [products] = useState(productData);`는 setter를 쓰지 않습니다. 바뀌지 않는 값이라면 `const products = productData;`로도 충분합니다. 나중에 추가·삭제 기능을 붙일 계획이라면 지금처럼 두어도 괜찮습니다.
>

---

## 1. `types/product.ts`: 상품 타입

**모든 컴포넌트가 같은 `ProductType`을 import해서 씁니다.**

```ts
export type ProductType = {
  id: number,
  name: string,
  price: number,
  inStock: boolean
}
```

- 타입만 가져올 때는 `import type { ProductType } from "../types/product";`처럼 `import type`을 씁니다. 빌드 결과물에서 이 import는 지워집니다.

---

## 2. `ProductSearchBox.tsx`: 검색 입력 ⭐

**입력값을 `onSearch`로 부모에게 전달합니다. 방법은 두 가지로, 제출(submit)할 때와 입력(change)할 때(디바운스)입니다.**

```tsx
interface Props {
  onSearch: (userInput: string) => void;
  searchTerm: string;
}

function ProductSearchBox({ onSearch, searchTerm }: Props) {
  const id = useId();

  // ① 폼 제출(Enter) 시
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();                                   // 새로고침 막기
    const input = document.getElementById(id) as HTMLInputElement;
    const value = input.value.trim();

    if (value.length > 0) onSearch(value);
    else alert('검색어를 입력해주세요.');

    input.value = '';
    input.focus();
  };

  // ② 입력할 때마다, 단 300ms 동안 추가 입력이 없을 때만 실행
  const handleChange = debounce((e: React.ChangeEvent<HTMLInputElement>) =>
    onSearch(e.target.value), 300);

  return (
    <form onSubmit={handleSearch}>
      <div className="ProductSearch">
        <label htmlFor="product-search">상품 검색</label>
        <input id={id} type="search" defaultValue={searchTerm} onChange={handleChange} />
      </div>
    </form>
  );
}
```

### ① 이벤트 타입

| 이벤트 | 타입 | 값 꺼내기 |
| --- | --- | --- |
| `onSubmit` (form) | `React.FormEvent<HTMLFormElement>` | `e.preventDefault()` 필수 |
| `onChange` (input) | `React.ChangeEvent<HTMLInputElement>` | `e.target.value` |
| `onChange` (checkbox) | `React.ChangeEvent<HTMLInputElement>` | `e.target.checked` |

### ② ⭐ 디바운스(`debounce`)

```ts
// utils/debounce.ts
export function debounce<T extends (...args: any[]) => void>(callback: T, delay = 400) {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timerId) clearTimeout(timerId);              // 이전 예약 취소
    timerId = setTimeout(() => callback(...args), delay); // 다시 예약
  };
}
```

- 키를 누를 때마다 타이머를 **취소하고 다시 예약**합니다. 그래서 입력을 멈추고 300ms가 지나야 `onSearch`가 한 번 실행됩니다.
- 글자 하나마다 부모 상태가 바뀌고 목록이 다시 그려지는 일을 줄여 줍니다.
- `Parameters<T>` 덕분에 반환된 함수도 원래 함수와 같은 인자 타입을 가집니다.

### ③ 비제어(uncontrolled) 입력

- `value` 대신 `defaultValue`를 쓰면 **처음 값만 넣어 주고**, 이후 입력값은 DOM이 직접 관리합니다.
- 그래서 값을 읽을 때 `document.getElementById(id)`처럼 DOM에서 꺼내 옵니다.

> ⚠️ 코드 확인 1: `<label htmlFor="product-search">`인데 input의 id는 `useId()`로 만든 값입니다. 둘이 달라서 라벨을 눌러도 입력창에 포커스가 가지 않습니다. `htmlFor={id}`로 맞춰야 합니다.
>

> ⚠️ 코드 확인 2: 제출 후 `input.value = ''`로 입력창은 비우지만, 코드로 값을 바꾸면 `onChange`가 발생하지 않습니다. 그래서 **입력창은 비어 있는데 목록은 이전 검색어로 걸러진 상태**가 됩니다. 비울 거라면 `onSearch('')`도 같이 호출하거나, 입력창을 비우지 않는 편이 자연스럽습니다.
>

> ⚠️ 코드 확인 3: `debounce(...)`를 컴포넌트 본문에서 호출하면 **렌더링할 때마다 새 디바운스 함수(새 타이머)** 가 생깁니다. 지금 구조에서는 크게 문제가 없지만, 안정적으로 쓰려면 `useMemo`나 `useRef`로 한 번만 만들어 두는 것이 좋습니다.
>

> ⚠️ 코드 확인 4: React에서는 `document.getElementById` 대신 `useRef`를 쓰거나, `new FormData(e.currentTarget)`로 폼 값을 읽는 방식을 권장합니다.
>

---

## 3. `ProductStockFilter.tsx`: 체크박스 (제어 컴포넌트)

**`checked`는 부모 상태로 정하고, 바뀐 값은 `e.target.checked`로 부모에게 돌려줍니다.**

```tsx
interface Props {
  inStockOnly: boolean;
  onInStockOnlyChange: (checked: boolean) => void;
}

function ProductStockFilter({ inStockOnly, onInStockOnlyChange }: Props) {
  return (
    <div className="StockFilter">
      <input
        type="checkbox"
        id="stock-filter"
        checked={inStockOnly}                                    // 상태가 화면을 결정
        onChange={(e) => onInStockOnlyChange(e.target.checked)}  // 화면 변화 → 상태 변경
      />
      <label htmlFor="stock-filter">재고 있는 상품만 보기</label>
    </div>
  );
}
```

- `checked`를 주면 **제어 컴포넌트**가 됩니다. 이때는 `onChange`가 반드시 있어야 합니다. 없으면 체크박스가 클릭해도 바뀌지 않고 콘솔에 경고가 뜹니다.
- 이 컴포넌트는 상태를 직접 갖지 않습니다. 같은 props를 주면 항상 같은 화면을 그립니다.

| 구분 | 제어 (`ProductStockFilter`) | 비제어 (`ProductSearchBox`) |
| --- | --- | --- |
| 값 지정 | `checked` / `value` | `defaultChecked` / `defaultValue` |
| 값의 주인 | React 상태 | DOM |
| 값 읽기 | 상태 변수 | `e.target`, ref, DOM 조회 |

> ⚠️ 코드 확인: `id="stock-filter"`가 고정값이라 이 컴포넌트를 한 화면에 두 번 쓰면 id가 겹칩니다. 검색창처럼 `useId()`를 쓰면 안전합니다.
>

---

## 4. `ProductList.tsx` / `ProductItem.tsx`: 리스트 렌더링

**`ProductList`는 배열을 `map`으로 돌리고, 상품 하나는 `ProductItem`이 그립니다.**

```tsx
// ProductList.tsx
function ProductList({ products }: { products: ProductType[] }) {
  return (
    <ul className="ProductList">
      {products.map((product, index) => (
        <ProductItem key={product.id} product={product} index={index} />
      ))}
    </ul>
  );
}
```

```tsx
// ProductItem.tsx
function ProductItem({ product, index }: Props) {
  const { id, name, price, inStock } = product;
  const style = { '--i': index, '--hue': (id * 47) % 360 } as CSSProperties; // CSS 변수 전달

  return (
    <li style={style} className={inStock ? undefined : 'sold-out'}>
      <span className="product-initial">{name}</span>
      <span className="price">{price}원</span>
      <span className="badge">{inStock ? '재고 있음' : '품절'}</span>
    </li>
  );
}
```

- `key`에는 `index`가 아니라 **고유한 `product.id`** 를 씁니다. 필터링으로 목록 순서가 바뀌어도 React가 항목을 정확히 구분할 수 있습니다.
- `index`는 `key`가 아니라 **CSS 변수(`--i`)** 로 넘겨서 애니메이션 지연 같은 스타일에 씁니다.
- `'--i'` 같은 CSS 사용자 정의 속성은 `CSSProperties` 타입에 없습니다. 그래서 `as CSSProperties`로 타입 단언을 합니다.
- `className={조건 ? undefined : 'sold-out'}`: `undefined`를 주면 class 속성 자체가 붙지 않습니다.

> ⚠️ 코드 확인: 가격이 `45000원`처럼 그대로 찍힙니다. `{price.toLocaleString()}원`을 쓰면 `45,000원`으로 표시됩니다.
>

---

## 5. `ProductListCount.tsx`: 개수 표시

**계산은 부모가 하고, 이 컴포넌트는 받은 숫자를 보여 주기만 합니다.**

```tsx
interface Props {
  productCount: number;
  totalProductCount: number;
}

function ProductListCount({ productCount, totalProductCount }: Props) {
  return (
    <div className="ProductCount">
      <span>전체 <b>{totalProductCount}</b>개 중 <b>{productCount}</b>개 표시</span>
    </div>
  );
}
```

- 상태도 이벤트도 없는 **표시용(프레젠테이셔널) 컴포넌트**입니다.

---

## 6. `ProductInstantSearch.tsx`: 즉시 검색 토글 (미사용)

**`ProductPage-1.tsx`에서 주석 처리되어 지금은 화면에 나오지 않습니다.**

```tsx
interface Props {
  onToggle: () => void;
  isInstantSearch: boolean;
}

function InstantSearch({ onToggle, isInstantSearch }: Props) {
  const id = useId();
  return (
    <header className="UserPage__header">
      <h1>사용자 목록</h1>
      <div className="formControl InstantSearch">
        <label htmlFor={id}>
          <input type="checkbox" checked={isInstantSearch} id={id} onChange={onToggle} />
        </label>
      </div>
    </header>
  );
}
```

- 의도는 "즉시 검색(입력할 때마다 검색)"과 "제출 시 검색"을 체크박스로 바꾸는 기능입니다.
- `onToggle`은 값을 받지 않는 `() => void`입니다. 부모가 `setIsInstantSearch(!isInstantSearch)`로 직접 뒤집습니다.

> ⚠️ 코드 확인: users 페이지에서 복사한 코드라 제목이 `사용자 목록`, 클래스가 `UserPage__header`로 남아 있습니다. 라벨 안에 글자가 없어서 체크박스가 무엇인지 알 수 없습니다. 파일명(`ProductInstantSearch`)과 함수명(`InstantSearch`)도 다릅니다. 다시 쓸 거라면 `<h1>`은 빼고 라벨에 `즉시 검색` 같은 텍스트를 넣어야 합니다.
>

---

## 🧷 한 줄 요약: 상태 vs props vs 파생 값 고르기

| 상황 | 도구 | 이번 코드 예 |
| --- | --- | --- |
| 사용자가 바꾸고, 여러 컴포넌트가 함께 쓰는 값 | 부모의 `useState` | `searchTerm`, `inStockOnly` |
| 상태에서 계산할 수 있는 값 | 렌더링 중 계산 (상태 ❌) | `searchedProductList`, `.length` |
| 자식이 부모 상태를 바꿔야 할 때 | 함수를 props로 전달 | `onSearch`, `onInStockOnlyChange` |
| 입력값을 React가 관리 | 제어 컴포넌트 (`checked` + `onChange`) | `ProductStockFilter` |
| 입력값을 DOM이 관리 | 비제어 컴포넌트 (`defaultValue`) | `ProductSearchBox` |
| 입력마다 실행되는 작업 줄이기 | `debounce` | 검색 300ms |
| 리스트 항목 구분 | `key={고유 id}` | `key={product.id}` |

---

---

# 📗 practice 디렉터리 정리 (`src/NoteApp/`)

## 0. 전체 구조: `App.tsx` + `routes.ts`

**상태는 App 한 곳에만 둡니다. 페이지와 컴포넌트는 props로 값과 함수를 받아서 쓰기만 합니다.**

```tsx
// routes.ts : 라우트 이름을 상수로 모아 둠 (오타 방지)
export const ROUTES = { list: 'list', detail: 'detail', create: 'create', edit: 'edit' } as const;

// App.tsx : 상태 2개 + 파생 값 2개
const [list, setList] = useState(() => getNoteList());                       // 노트 배열
const [routeInfo, setRouteInfo] = useState({ route: 'list', noteId: null }); // 현재 화면 + 선택된 노트

const newNoteId = Math.max(0, ...list.map((item) => item.id)) + 1;              // 파생: 새 노트 id
const selectedNote = list.find((item) => item.id === routeInfo.noteId) ?? null; // 파생: 선택된 노트

switch (routeInfo.route) {   // 라우터 대신 switch로 페이지 고르기
  case ROUTES.list:   return <NoteListPage ... />
  case ROUTES.detail: return <NoteDetailPage ... />
  case ROUTES.create: return <NoteCreatePage ... />
  case ROUTES.edit:   return <NoteEditPage ... />
}
```

```
App (list, routeInfo)
 ├ NoteListPage   ─ NoteList             (항목 클릭 → detail / 노트 작성 → create)
 ├ NoteDetailPage ─ BackLink, PrintError (수정 → edit)
 ├ NoteCreatePage ─ BackLink, NoteForm(mode='create')
 └ NoteEditPage   ─ BackLink, NoteForm(mode='edit')
```

- 페이지를 바꾸는 방식은 모두 같습니다. 자식이 `onChangeRoute(ROUTES.xxx, noteId)`를 호출하면 App의 `routeInfo`가 바뀌고, `switch`가 다른 페이지를 반환합니다.
- `selectedNote`와 `newNoteId`는 `list`에서 계산할 수 있어서 상태로 만들지 않습니다(파생 값).
- `newNoteId`를 `list.length + 1`로 만들면 삭제한 뒤 id가 겹칠 수 있습니다. 그래서 **가장 큰 id + 1**을 씁니다.

---

## 1. `components/BackLink.tsx`: 목록으로 돌아가기 링크

**`<a>`의 기본 이동을 막고, 부모가 준 함수를 실행합니다.**

```tsx
interface Props {
  onChangeRoute: () => void;   // 값을 받지 않는 함수
}

function BackLink({ onChangeRoute }: Props) {
  const handleBackToList = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();   // href="#back"으로 이동하지 않게 막음
    onChangeRoute();      // 어디로 갈지는 부모가 결정
  };

  return (
    <a href="#back" className="BackLink" onClick={handleBackToList} aria-label="목록으로 돌아가기">
      <svg aria-hidden="true" ...>...</svg>
    </a>
  );
}
```

- BackLink는 어디로 가는지 모릅니다. 부모가 `() => onChangeRoute(ROUTES.list, 0)`을 만들어 넘겨 줍니다. 그래서 어느 페이지에서나 재사용할 수 있습니다.
- 아이콘만 있는 링크라서 `aria-label`로 스크린 리더용 이름을 붙이고, `svg`에는 `aria-hidden="true"`를 줍니다.

---

## 2. `components/PrintError.tsx`: 에러 메시지

**`children`으로 받은 문자열을 `role="alert"` 문단으로 보여 줍니다.**

```tsx
function PrintError({ children }: { children: string }) {
  return <p role="alert" className="PrintError">{children}</p>;
}

// 사용
<PrintError> 이런! 노트를 찾을 수 없습니다. 🚫 </PrintError>
```

- 여는 태그와 닫는 태그 사이의 내용이 `children` prop으로 들어옵니다.
- `role="alert"`를 주면 내용이 나타날 때 스크린 리더가 바로 읽어 줍니다.
- props 타입은 `interface` 없이 `{ children: string }`처럼 바로 적을 수도 있습니다.

---

## 3. `components/NoteList.tsx`: 노트 목록

**`map()`으로 링크 목록을 그리고, 클릭한 노트의 id를 부모에게 넘깁니다.**

```tsx
interface Props {
  list: Note[];
  onChangeRoute: (nextRoute: string, pickNoteId: number) => void;
}

// ⭐ 함수를 반환하는 함수 (커링)
const handleClick = (pickNoteId: number) => (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  onChangeRoute(ROUTES.detail, pickNoteId);
};

{list.map((item) => {
  const slug = `#${convertSlug(item.title)}`;   // 제목 → 주소용 문자열
  return (
    <li key={item.id}>
      <a href={slug} onClick={handleClick(item.id)}>{item.title}</a>
    </li>
  );
})}
```

### ① ⭐ `handleClick(item.id)`는 왜 렌더링할 때 클릭 처리가 되지 않을까?

| 쓰는 법 | 렌더링할 때 | 클릭할 때 |
| --- | --- | --- |
| `onClick={handleClick}` | 함수 전달만 | `handleClick(e)` 실행 → id를 못 넘김 |
| `onClick={() => handleClick(item.id)}` | 화살표 함수 전달 | `handleClick(item.id)` 실행 |
| `onClick={handleClick(item.id)}` (커링) | `handleClick(item.id)` 실행 → **함수를 반환** | 반환된 `(e) => {...}` 실행 |

- 커링 버전은 바깥 함수가 id를 기억하고, 안쪽 함수가 이벤트 객체 `e`를 받습니다. 그래서 id와 `e.preventDefault()`를 함께 쓸 수 있습니다.
- `key`에는 배열 index가 아니라 고유한 `item.id`를 씁니다.

---

## 4. `components/NoteForm.tsx`: 작성·수정 폼 ⭐

**`mode` prop 하나로 작성 폼과 수정 폼을 같은 컴포넌트에서 처리합니다.**

```tsx
interface Props {
  mode: 'create' | 'edit';          // 리터럴 유니온: 두 값만 허용
  onBackLink: () => void;
  newNoteId?: number;               // create에서만 필요 → 선택(?)
  note?: Note;                      // edit에서만 필요
  onCreate?: (newNoteItem: Note) => void;
  onEdit: (willEditNote: Note) => void;
  onDelete: (willDeleteNoteId: number) => void;
}
```

### ① 입력 칸 여러 개 → 객체 상태 하나

```tsx
type FormEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

const [formData, setFormData] = useState<FormData>(() => {   // ⭐ 초기화 함수 (처음 한 번만 실행)
  if (mode === 'edit' && note) {
    return {
      title: note.title,
      content: convertHTMLToText(note.content),   // 저장된 HTML → 편집용 텍스트
      userId: note.userId,
    };
  }
  return { title: '', content: '', userId: 0 };
});

const handleUpdateFormData = (e: FormEvent) => {
  const { name, value } = e.target;
  setFormData({ ...formData, [name]: value });   // 복사한 뒤 바꿀 키만 덮어쓰기
};

<input name="title" value={formData.title} onChange={handleUpdateFormData} />
<textarea name="content" value={formData.content} onChange={handleUpdateFormData} />
```

- input의 `name`을 상태 객체의 키와 똑같이 맞춥니다. 그러면 `[name]: value`(계산된 속성 이름) 하나로 모든 칸을 업데이트할 수 있습니다.
- `{ ...formData }`로 새 객체를 만들어야 React가 바뀐 것을 알아챕니다(불변성).
- `value`와 `onChange`를 함께 쓰므로 **제어 컴포넌트**입니다.
- `useId()`로 `label`의 `htmlFor`와 input의 `id`를 연결합니다. 컴포넌트를 여러 번 써도 id가 겹치지 않습니다.
- `userList = getUserList()`는 컴포넌트 **밖**에서 호출합니다. 바뀌지 않는 값이라 렌더링마다 다시 부를 필요가 없습니다.

### ② 작성: `handleCreateNote`

```tsx
const handleCreateNote = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();                       // 새로고침 막기
  const { title, content, userId } = formData;
  const newUserId = Number(userId);         // select 값은 문자열 → 숫자로
  const user = getUser(newUserId);
  if (!user) return;                        // 작성자를 안 골랐으면 중단
  if (!newUserId || !newNoteId) return;

  const newNote = {
    id: newNoteId,
    title: title.trim(),
    content: convertTextToHTMLString(content),   // 줄마다 <p>로 감싸기 (+ 특수문자 이스케이프)
    userId: newUserId,
    createdAt: '', updatedAt: '',
    expand: { user },
  };
  onCreate?.(newNote);   // 선택 prop이라 ?.()로 호출
  onBackLink();          // 목록으로
};
```

### ③ 수정·삭제: `handleEdit`, `handleDelete`

```tsx
const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (note && onEdit) {
    onEdit({
      ...note,                                          // id, expand 등은 그대로
      title: formData.title.trim(),
      content: convertTextToHTMLString(formData.content),
      userId: Number(formData.userId),
    });
    onBackLink();
  }
};

const handleDelete = () => {
  if (note && onDelete) {
    onDelete(note.id);   // id만 넘기면 App이 filter로 제거
    onBackLink();
  }
};
```

### ④ mode에 따라 바뀌는 JSX

```tsx
const isCreateMode = mode.includes('create');

<form
  onSubmit={isCreateMode ? handleCreateNote : handleEdit}            // 제출 핸들러 교체
  onReset={() => setFormData({ title: '', content: '', userId: 0 })} // 상태도 같이 비우기
>
  {isCreateMode && ( /* 작성자 select: 작성할 때만 */ )}
  <button type="submit">{isCreateMode ? '추가' : '수정'}</button>
  {isCreateMode
    ? <button type="reset">초기화</button>
    : <button type="button" onClick={handleDelete}>삭제</button>}
</form>
```

- `type="reset"` 버튼은 DOM만 비웁니다. 제어 컴포넌트는 상태가 값을 정하므로 `onReset`에서 상태도 비워야 화면이 초기화됩니다.
- 삭제 버튼에는 `type="button"`을 적습니다. 빼면 form 안 버튼의 기본값인 `submit`이 되어 수정이 실행됩니다.

### ⑤ `NoteForm-강사님.tsx`와 비교

| 항목 | 강사님 버전 | 내 버전 (`NoteForm.tsx`) |
| --- | --- | --- |
| 지원 모드 | 작성만 | `mode`로 작성/수정 |
| 초기 상태 | 빈 객체 | 초기화 함수로 edit이면 note 값 채움 |
| `onCreate` | 필수 | 선택(`?`) + `onCreate?.()` |
| 작성자 select | 항상 표시 | 작성 모드에서만 |
| 두 번째 버튼 | 초기화 | 작성: 초기화 / 수정: 삭제 |

> ⚠️ 코드 확인: Props에서 `onEdit`, `onDelete`가 필수인데 `NoteCreatePage`는 이 둘을 넘기지 않아서 TypeScript 에러가 납니다. 수정 모드에서만 쓰는 prop이므로 `onEdit?`, `onDelete?`로 바꾸는 것이 맞습니다.
>

> ⚠️ 코드 확인: `handleUpdateFormData` 안의 `console.log(formData)`는 **바뀌기 전 값**을 찍습니다. `setFormData`는 다음 렌더링부터 반영되기 때문입니다. 새 값을 보려면 `console.log(nextFormData)`를 써야 합니다.
>

> ⚠️ 코드 확인: select에서 받은 `userId`는 문자열인데 `FormData` 타입은 `number`입니다. 제출할 때 `Number()`로 바꿔서 동작은 하지만, 그 전까지 상태 안에는 문자열이 들어 있습니다.
>

---

## 5. `pages/NoteListPage.tsx`: 목록 페이지

**NoteList에 목록을 넘기고, "노트 작성" 링크로 create 페이지로 이동합니다.**

```tsx
const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  onChangeRoute(ROUTES.create, 0);   // 0 = 선택한 노트 없음
};

<NoteList list={list} onChangeRoute={onChangeRoute} />   // 받은 함수를 그대로 전달
<a href="#create-note" className="createNoteLink" onClick={handleClick}>노트 작성</a>
```

- 페이지는 App에서 받은 `onChangeRoute`를 자식에게 **그대로 내려 줍니다**(props drilling).
- App의 `handleChangeRoute`는 `pickNoteId`가 0이면 기존 `noteId`를 그대로 둡니다.

---

## 6. `pages/NoteDetailPage.tsx`: 상세 페이지

**선택된 노트를 보여 주고, HTML 문자열인 본문은 `dangerouslySetInnerHTML`로 출력합니다.**

```tsx
if (!noteId) return <PrintError> 이런! 노트를 찾을 수 없습니다. 🚫 </PrintError>;   // 조기 반환

const createMarkup = () => {
  if (!note) return;
  return { __html: note.content };   // 반드시 { __html: 문자열 } 형태
};

const handleChangeRoute = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  onChangeRoute(ROUTES.edit, noteId);   // 수정 페이지로
};

<BackLink onChangeRoute={() => onChangeRoute(ROUTES.list, 0)} />
{!note && <PrintError> 이런! 노트를 찾을 수 없습니다. 🚫 </PrintError>}
{note && (
  <>
    <h2>{note.title}</h2>
    <span>
      {note.expand?.user.name}   {/* 옵셔널 체이닝: expand가 없으면 undefined */}
      <a href={`#/edit/${convertSlug(note.title)}`} onClick={handleChangeRoute}>수정</a>
    </span>
    <div dangerouslySetInnerHTML={createMarkup()} />
  </>
)}
```

- 노트 본문은 `<p>...</p>` 같은 HTML 문자열입니다. `{note.content}`로 쓰면 태그가 글자 그대로 보입니다.
- `dangerouslySetInnerHTML`은 이름 그대로 위험합니다(XSS). 이 프로젝트는 `convertTextToHTMLString` 안의 `escapeHTML`로 `<`, `>` 같은 문자를 바꿔 사용자 입력을 안전하게 만듭니다.
- 노트를 직접 찾지 않고, App이 계산한 `selectedNote`를 `note` prop으로 받습니다(주석 처리된 `getNodeItem` 대신).

---

## 7. `pages/NoteCreatePage.tsx`: 작성 페이지

**BackLink와 `mode='create'`인 NoteForm을 조립합니다.**

```tsx
function NoteCreatePage({ onChangeRoute, onCreate, newNoteId }: Props) {
  const handleBackLink = () => onChangeRoute(ROUTES.list, 0);   // 한 번 만들어 두 곳에서 사용

  return (
    <div className="NoteCreatePage">
      <BackLink onChangeRoute={handleBackLink} />
      <NoteForm mode="create" onCreate={onCreate} onBackLink={handleBackLink} newNoteId={newNoteId} />
    </div>
  );
}
```

- 페이지 컴포넌트는 로직 없이 **조립만** 합니다. 실제 추가는 App의 `handleCreateNote`가 `setList([...list, newNoteItem])`로 처리합니다.

---

## 8. `pages/NoteEditPage.tsx`: 수정 페이지

**`mode='edit'`과 수정할 `note`를 NoteForm에 넘기고, 수정·삭제 함수도 같이 전달합니다.**

```tsx
function NoteEditPage({ onDelete, noteId, note, onChangeRoute, onEdit }: Props) {
  if (!noteId) return;   // 선택된 노트가 없으면 아무것도 그리지 않음

  const handleBackLink = () => onChangeRoute(ROUTES.list, 0);

  return (
    <div className="NoteEditPage">
      <BackLink onChangeRoute={handleBackLink} />
      {note && (
        <>
          <h2>노트 편집</h2>
          <NoteForm mode="edit" note={note} onEdit={onEdit} onDelete={onDelete} onBackLink={handleBackLink} />
        </>
      )}
    </div>
  );
}
```

- App의 수정 로직은 `list.map((item) => item.id === willEditNote.id ? willEditNote : item)`입니다. id가 같은 항목만 새 객체로 바꾼 **새 배열**을 만듭니다.
- App의 삭제 로직은 `list.filter((item) => item.id !== willDeleteNoteId)`입니다. 선택한 id만 빠진 새 배열을 만듭니다.
- `note && (...)` 덕분에 note가 있을 때만 NoteForm이 마운트됩니다. 그래서 NoteForm의 초기화 함수는 항상 note 값을 읽을 수 있습니다.

> ⚠️ 코드 확인: `if (!noteId) return;`은 `undefined`를 반환합니다. React 18부터 허용되지만 `return null;`로 쓰면 의도가 더 분명합니다. note가 없을 때도 상세 페이지처럼 `PrintError`를 보여 주면 사용자가 상황을 알 수 있습니다.
>

---

## 🧷 한 줄 요약: CRUD에 맞는 도구 고르기

| 상황 | 도구 | 이번 코드 예 |
| --- | --- | --- |
| 여러 페이지가 함께 쓰는 데이터 | App의 `useState` | `list`, `routeInfo` |
| 상태에서 계산할 수 있는 값 | 파생 값 | `selectedNote`, `newNoteId` |
| 추가 (Create) | 스프레드로 새 배열 | `[...list, newNoteItem]` |
| 수정 (Update) | `map` + id 비교 | `handleEditNote` |
| 삭제 (Delete) | `filter` | `handleDeleteNote` |
| 입력 칸 여러 개 | 객체 상태 + `[name]: value` | `formData` |
| 조건에 따라 다른 초기값 | `useState(() => ...)` | edit 모드 초기값 |
| 한 컴포넌트를 두 용도로 | `mode` prop + 조건부 렌더링 | `NoteForm` |
| 클릭할 때 인자 넘기기 | 커링 핸들러 | `handleClick(item.id)` |
| 링크 기본 이동 막기 | `e.preventDefault()` | BackLink, NoteList |
| HTML 문자열 출력 | `dangerouslySetInnerHTML` + 이스케이프 | NoteDetailPage |
