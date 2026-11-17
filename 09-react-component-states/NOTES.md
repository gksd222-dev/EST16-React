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
