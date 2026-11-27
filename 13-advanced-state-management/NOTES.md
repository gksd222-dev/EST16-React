# 📘 learn 디렉터리 정리

## 0. 전체 구조: `pages/Counter/index.tsx`

**같은 카운터를 커스텀 훅 · useReducer · Zustand 세 가지 방식으로 만들어 비교합니다.**

```tsx
// pages/Counter/index.tsx
<h2>Counter</h2>            {/* ① 커스텀 훅(useState) */}
<Counter_ className="mb-3"/>
<Counter_ />                {/* 두 개 → 각자 따로 셈 */}

<h2>Counter Reducer</h2>    {/* ② useReducer */}
<CounterReducer />

<h2>Counter</h2>            {/* ③ Zustand */}
<Counter className="mb-3" />
<Counter className="mb-3" /> {/* 두 개 → 같은 숫자를 공유 */}
<CounterControls />          {/* props 없이 reset/step 조작 */}
```

- 페이지에 같은 카운터를 **두 번씩** 렌더링한 이유는 "상태가 어디에 사는가"를 눈으로 보기 위해서입니다.
- 커스텀 훅 카운터 두 개는 **따로** 움직입니다. 컴포넌트마다 `useState`가 따로 만들어지기 때문입니다.
- Zustand 카운터 두 개는 **같이** 움직입니다. 둘 다 컴포넌트 바깥에 있는 스토어 하나를 바라보기 때문입니다.
- `CounterControls`는 `Counter`와 부모·자식 관계가 아닌데도 props 없이 같은 상태를 바꿉니다.

---

## 1. 커스텀 훅(useState): `hook/useCounter.ts` + `Counter/index_.tsx`

**상태와 상태 변경 로직을 훅 하나로 묶어 재사용합니다. 상태는 훅을 부른 컴포넌트 안에 삽니다.**

```tsx
// hook/useCounter.ts
function useCounter({ count: initialCount = 0, step = 1, min = 0, max = 10 } = {}) {
  const [count, setCount] = useState(initialCount);

  const isMinDisabled = count <= min;   // 파생 상태: state로 만들지 않고 계산
  const isMaxDisabled = count >= max;

  const increment = useCallback(
    () => setCount((c) => {
      let nextCount = c + step;
      if (nextCount >= max) nextCount = max;   // 최댓값에서 멈춤
      return nextCount;
    }), [max, step]);                         // 함수 참조 고정 → memo 자식 리렌더 방지

  const reset = useCallback(() => setCount(initialCount), [initialCount]);

  return { count, increment, decrement, reset, isMinDisabled, isMaxDisabled };
}
```

```tsx
// Counter/index_.tsx — 훅을 쓰는 쪽
const { count, increment, decrement, step, isMaxDisabled, isMinDisabled } = useCounter();

<CountDisplay_ count={count} />                     {/* 값을 props로 내려줌 */}
<CountButton_ onUpdate={increment} ...>             {/* 함수도 props로 내려줌 */}
```

- 자식(`CountDisplay_`, `CountButton_`)은 상태를 모릅니다. 부모가 **props로 값과 함수를 내려줘야** 합니다.
- `setCount((c) => ...)`처럼 **함수형 업데이트**를 써서 항상 최신 값을 기준으로 계산합니다.
- `useCallback`으로 함수를 고정해야 `memo`로 감싼 `CountButton_`이 불필요하게 다시 그려지지 않습니다.
- 다른 컴포넌트와 같은 값을 공유하려면 상태를 공통 부모로 끌어올려야(**lifting state up**) 합니다. 페이지 파일의 주석 처리된 부분이 그 예시입니다.

> ⚠️ 코드 확인: `useCounter`는 `step`을 반환하지 않는데 `index_.tsx`에서 `step`을 꺼내 씁니다. 그래서 `step`이 `undefined`가 되고 버튼 라벨이 "undefined 증가"로 나옵니다. 반환 객체에 `step`을 추가하면 됩니다.
>

> ⚠️ 코드 확인: `index_.tsx`의 감소 버튼에도 `<GrFormUp />` 아이콘이 들어 있습니다. `<GrFormDown />`으로 바꿔야 합니다.
>

---

## 2. useReducer: `CounterReducer/index.tsx`

**"무엇을 할지(action)"와 "어떻게 바꿀지(reducer)"를 분리합니다. 상태는 여전히 컴포넌트 안에 삽니다.**

```tsx
type State = { count: number };
const INITIAL: State = { count: 0 };

type Action =                         // 가능한 행동을 유니온 타입으로 전부 나열
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }
  | { type: 'set'; payload: number }  // 데이터가 필요한 행동은 payload로 전달

function reducer(state: State, action: Action): State {   // 순수 함수
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };  // 새 객체 반환 (불변성)
    case 'decrement': return { count: state.count - 1 };
    case 'reset':     return INITIAL;
    case 'set':       return { count: action.payload };
    default:          return state;
  }
}

const [state, dispatch] = useReducer(reducer, INITIAL);

<button onClick={() => dispatch({ type: 'increment' })}>+</button>
<button onClick={() => dispatch({ type: 'set', payload: 10 })}>10으로</button>
```

### ① 구성 요소

| 이름 | 역할 |
| --- | --- |
| `state` | 현재 상태 |
| `action` | "무슨 일이 일어났는지" 설명하는 객체 (`type` 필수, 필요하면 `payload`) |
| `reducer(state, action)` | 이전 상태 + 액션 → **다음 상태**를 반환하는 순수 함수 |
| `dispatch(action)` | 액션을 reducer에게 보내는 함수 |

### ② ⭐ useState와 무엇이 다른가

- 상태를 바꾸는 규칙이 컴포넌트 바깥의 `reducer` 함수 하나에 모입니다. 그래서 "count는 이 네 가지 방법으로만 바뀐다"는 것이 코드에 드러납니다.
- `reducer`는 React와 상관없는 순수 함수라서 따로 테스트하기 쉽습니다.
- `dispatch`는 참조가 항상 같습니다. 그래서 `useCallback` 없이 자식에게 내려줘도 됩니다.
- 상태가 여러 값으로 얽혀 있거나 변경 종류가 많을 때 `useState`보다 정리가 잘 됩니다.
- 상태는 여전히 컴포넌트마다 따로 생깁니다. **공유 문제는 해결해 주지 않습니다.**

> ⚠️ 코드 확인: 이 예제는 비교용이라 `step`, `min`/`max` 제한이 없습니다. `-`를 계속 누르면 음수로 내려갑니다. 제한을 걸려면 `case 'decrement'`에서 `Math.max(state.count - 1, 0)`처럼 처리하면 됩니다.
>

---

## 3. Zustand 스토어: `Counter/@store.ts`

**상태와 함수를 컴포넌트 바깥의 스토어 하나에 두고, 필요한 컴포넌트가 직접 꺼내 씁니다.**

```tsx
import { create } from 'zustand';

type Store = {
  count: number; step: number; max: number; min: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setStep: (newStep: number) => void;
};

export const useCountStore = create<Store>()((set, _get, store) => {

  const increment = () =>
    set(({ count, step, max }) => {           // 현재 상태를 받아서
      let nextCount = count + step;
      if (nextCount >= max) nextCount = max;
      return { count: nextCount };            // 바꿀 부분만 반환 → 나머지는 자동 병합
    });

  const setStep = (newStep: number) => set({ step: newStep });   // 객체를 바로 넘겨도 됨

  const reset = () => set(store.getInitialState());              // 처음 상태로 되돌림

  return { step: 1, min: 0, max: 10, count: 0, increment, decrement, reset, setStep };
});
```

### ① `create`가 넘겨주는 세 인자

| 인자 | 역할 |
| --- | --- |
| `set` | 상태 변경. 객체 또는 `(state) => 객체`를 넘기면 **얕은 병합**됩니다. |
| `get` | 현재 상태 읽기 (이 예제에선 안 써서 `_get`) |
| `store` | 스토어 API. `store.getInitialState()`로 초기 상태를 가져옵니다. |

- `create<Store>()(...)`처럼 괄호가 두 번 붙는 건 TypeScript 타입 추론을 위한 Zustand의 작성 방식입니다.
- `set`은 `useState`의 setter와 달리 **바꿀 키만** 넘기면 됩니다. `{...state, count}`처럼 펼쳐 쓰지 않아도 됩니다.
- `reset`에서 `getInitialState()`를 쓰면 `count`뿐 아니라 `step`도 1로 돌아갑니다.
- 스토어가 모듈 하나에 딱 하나 있으므로 `<Counter>`를 몇 개 그리든 **모두 같은 값**을 봅니다.
- Provider로 감쌀 필요가 없습니다. Context와 가장 크게 다른 점입니다.

---

## 4. ⭐ Zustand 구독 방식: 전체 구독 · selector · useShallow

**스토어에서 무엇을 꺼내느냐에 따라 리렌더링 범위가 달라집니다.**

```tsx
// ❌ 전체 구독: 스토어의 아무 값이나 바뀌면 리렌더링
const { count } = useCountStore();

// ✅ selector 구독: count가 바뀔 때만 리렌더링
const count = useCountStore((s) => s.count);

// ✅ 여러 값을 한 번에 → useShallow로 감싸기
import { useShallow } from 'zustand/shallow';
const [count, step, min, max] = useCountStore(
  useShallow((s) => [s.count, s.step, s.min, s.max])
);
```

### ① 전체 구독

- 인자 없이 부르면 스토어 전체를 구독합니다. `step`만 바뀌어도 `count`만 쓰는 컴포넌트까지 다시 그려집니다.

### ② selector 구독

- `(s) => s.count`처럼 필요한 값만 고르면 **고른 값이 바뀔 때만** 리렌더링됩니다.
- Zustand는 selector의 이전 결과와 새 결과를 `Object.is`로 비교합니다.

### ③ ⭐ useShallow가 필요한 이유

- selector가 `[s.count, s.step]` 같은 **배열이나 객체를 새로 만들어** 반환하면, 값이 같아도 매번 새 참조라서 `Object.is` 비교가 늘 "다름"이 됩니다. 그러면 계속 리렌더링됩니다(v5에선 무한 루프 경고가 뜰 수 있습니다).
- `useShallow`로 감싸면 배열/객체의 **안쪽 값을 하나씩** 비교합니다. 안쪽 값이 같으면 리렌더링하지 않습니다.
- 값마다 selector를 따로 쓰는 방법(`const step = useCountStore(s => s.step)` × 4)도 있습니다. `index.tsx`의 주석이 그 방식입니다.

### ④ 함수도 selector로 고를 수 있음

```tsx
// CountButton.tsx
const handler = useCountStore((s) =>
  type === '+' ? s.increment : s.decrement
);
```

- 스토어의 함수는 처음 한 번 만들어진 뒤 참조가 바뀌지 않습니다. 그래서 `useCallback` 없이도 안정적입니다.

---

---

# 📗 practice 디렉터리 정리 (`miniApp/Counter/`)

## 1. `CountDisplay.tsx` vs `CountDisplay_.tsx`: props 대신 스토어 구독

**`_` 붙은 파일은 props 방식, 안 붙은 파일은 Zustand 방식입니다.**

```tsx
// CountDisplay_.tsx — 부모가 count를 내려줘야 함
function CountDisplay({ count }: { count: number }) {
  return <output className={S.output}>{count}</output>;
}

// CountDisplay.tsx — props 없음, 직접 구독
function CountDisplay() {
  const count = useCountStore((s) => s.count);
  console.log(' counter display ');   // 언제 리렌더링되는지 확인용
  return <output className={S.output}>{count}</output>;
}
```

- Zustand 버전은 props가 없어서, `memo`로 감싸 두면 부모가 리렌더링돼도 같이 다시 그려지지 않습니다. `count`가 바뀔 때만 다시 그려집니다.
- `console.log`를 보면서 `step`만 바꿔 보면 selector 구독의 효과를 확인할 수 있습니다.

---

## 2. `CountButton.tsx` vs `CountButton_.tsx`: 함수 받기 vs 직접 꺼내기

```tsx
// CountButton_.tsx — onUpdate를 props로 받음
<CountButton_ onUpdate={increment}>...</CountButton_>

// CountButton.tsx — type만 받고, 함수는 스토어에서 꺼냄
type Props = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  type?: '+' | '-';                   // 버튼 기본 type 속성을 빼고 '+' | '-'로 재정의
};
const handler = useCountStore((s) => (type === '+' ? s.increment : s.decrement));

<CountButton type="-">...</CountButton>
```

- `Omit<..., 'type'>`으로 HTML 버튼의 `type`(`'button' | 'submit'`)을 빼고, 같은 이름으로 `'+' | '-'`를 새로 정의했습니다.
- 실제 `<button>`에는 `type="button"`을 직접 넣습니다.

---

## 3. `index.tsx`: 여러 값을 useShallow로 구독

```tsx
const [count, step, min, max] = useCountStore(
  useShallow((s) => [s.count, s.step, s.min, s.max])
);

const isMinDisabled = count <= min;   // 비활성화 여부는 컴포넌트에서 계산
const isMaxDisabled = count >= max;

<CountDisplay />                                   {/* props 없음 */}
<CountButton disabled={isMaxDisabled}>...</CountButton>
<CountButton type="-" disabled={isMinDisabled}>...</CountButton>
```

- 부모는 라벨과 `disabled` 계산에 필요한 값만 구독합니다. 숫자 표시와 클릭 처리는 자식이 스스로 합니다.
- `{useMemo(() => <GrFormUp />, [])}`: 아이콘 JSX를 고정해서 `memo` 자식에게 매번 새 `children`이 가지 않게 합니다.

---

## 4. `CounterControls.tsx`: 멀리 떨어진 컴포넌트에서 상태 변경

```tsx
const [step, reset, setStep] = useCountStore(
  useShallow((s) => [s.step, s.reset, s.setStep])
);

<button onClick={reset}>reset</button>
<input type="number" min={1} value={step}
       onChange={(e) => setStep(Number(e.target.value))} />
```

- 페이지에서 `<Counter>`와 형제로 놓여 있을 뿐인데 같은 스토어를 바꿉니다. step을 3으로 바꾸면 두 카운터 모두 "3 증가"가 됩니다.
- 값(`step`)과 함수(`reset`, `setStep`)를 한 selector에 섞어서 골라도 됩니다.

> ⚠️ 코드 확인: `<input>`을 비우면 `Number('')`가 `0`이 되어 step이 0이 됩니다. 그러면 버튼을 눌러도 숫자가 안 바뀝니다. `Math.max(1, Number(e.target.value) || 1)`처럼 최솟값을 보장하면 안전합니다.
>

---

## 🧷 한 줄 요약: 카운터 상태 관리 도구 고르기

| 비교 | 커스텀 훅 (useState) | useReducer | Zustand |
| --- | --- | --- | --- |
| 상태 위치 | 컴포넌트 안 | 컴포넌트 안 | **컴포넌트 밖 (스토어)** |
| 같은 컴포넌트 2개 | 따로 셈 | 따로 셈 | **같은 값 공유** |
| 상태 변경 방법 | `setCount(fn)` | `dispatch({ type })` | 스토어 함수 `increment()` → `set()` |
| 변경 로직 위치 | 훅 안의 함수들 | `reducer` 하나에 모음 | `create` 안의 함수들 |
| 자식에게 전달 | props로 값·함수 내려줌 | props로 `state`·`dispatch` 내려줌 | **props 없이 자식이 직접 구독** |
| 함수 참조 고정 | `useCallback` 필요 | `dispatch`는 원래 고정 | 원래 고정 |
| 리렌더링 제어 | `memo` + `useCallback` | `memo` | **selector** / `useShallow` |
| 설치 | 필요 없음 | 필요 없음 | `zustand` 패키지 |
| 이럴 때 | 한 컴포넌트의 간단한 상태, 로직 재사용 | 변경 종류가 많고 복잡한 지역 상태 | 여러 컴포넌트가 공유하는 전역 상태 |

---

---

# 📗 practice 디렉터리 정리 (`miniApp/TaskManager/PinnedTaskList.tsx`)

## 0. 전체 구조: `TaskManager.tsx` vs `TaskManager_.tsx`

**고정(pin)된 할 일만 보여 주는 목록입니다. `_` 붙은 파일은 Context + Reducer 버전, 안 붙은 파일은 Zustand 버전입니다.**

```tsx
// TaskManager_.tsx — Context 버전: Provider로 감싸야 함
<TaskProvider>
  <PinnedTaskList />      {/* PinnedTaskList_.tsx */}
  <UnpinnedTaskList />
</TaskProvider>

// TaskManager.tsx — Zustand 버전: Provider 없음
<PinnedTaskList />        {/* PinnedTaskList.tsx */}
<UnpinnedTaskList />
```

- 두 버전의 JSX(`<ul>` 이하)는 똑같습니다. **데이터를 가져오는 윗부분 몇 줄만** 다릅니다.
- Zustand 버전은 스토어가 모듈에 있으므로 Provider로 감싸지 않아도 됩니다.

---

## 1. 데이터 가져오기: Context vs Zustand

**Context는 값 덩어리를 통째로 받고, Zustand는 필요한 것만 골라서 구독합니다.**

```tsx
// PinnedTaskList_.tsx — Context
const {
  pinnedTaskList,
  methods: { togglePin, setTask },
} = useTask();                       // 컨텍스트 값 전체를 받음

// PinnedTaskList.tsx — Zustand
const pinnedTaskList = usePinnedTasks();            // 고정된 할 일만 구독

const { togglePin, setTask } = useTaskStore(
  useShallow((s) => ({                              // 필요한 함수 두 개만 구독
    togglePin: s.togglePin,
    setTask: s.setTask,
  }))
);
```

| | Context (`_`) | Zustand |
| --- | --- | --- |
| 목록 | Provider가 `useMemo`로 미리 나눠 둔 `pinnedTaskList` | `usePinnedTasks()` 커스텀 selector 훅 |
| 함수 | `methods` 객체 안에서 꺼냄 | 스토어에서 `useShallow`로 골라냄 |
| 리렌더링 | `contextValue`가 바뀌면 **무조건** | **고른 값이 바뀔 때만** |

---

## 2. ⭐ `usePinnedTasks()`: 파생 상태를 selector로 만들기

**`@store.ts`에 목록을 걸러 주는 훅을 따로 만들어 두고 컴포넌트에서는 호출만 합니다.**

```tsx
// @store.ts
export const usePinnedTasks = () =>
  useTaskStore(useShallow((s) => s.tasks.filter((t) => t.isPin)));
```

### ① 주석 처리된 방식과 비교

```tsx
// ❌ 주석 처리된 방식: tasks 전체를 구독한 뒤 컴포넌트에서 거름
const tasks = useTaskStore((s) => s.tasks);
const pinnedTaskList = tasks.filter((t) => t.isPin);

// ✅ 현재 방식: 거른 결과만 구독
const pinnedTaskList = usePinnedTasks();
```

- 주석 방식은 `tasks` 배열 전체를 구독합니다. 고정되지 않은 할 일을 체크해도 `tasks`가 새 배열이 되므로 Pinned 목록까지 리렌더링됩니다.
- 현재 방식은 **걸러진 결과**만 비교합니다. 고정된 할 일이 그대로면 리렌더링하지 않습니다.

### ② ⭐ 여기서 useShallow가 꼭 필요한 이유

- `filter()`는 호출할 때마다 **새 배열**을 만듭니다. `useShallow` 없이 쓰면 결과가 매번 "다른 값"으로 판정되어 계속 리렌더링됩니다. Zustand v5에서는 무한 루프 에러가 납니다.
- `useShallow`는 배열 **안의 요소를 하나씩** `Object.is`로 비교합니다.
- reducer/스토어가 바뀐 할 일만 `{ ...t }`로 새로 만들고 나머지는 원래 객체를 그대로 두기 때문에 이 비교가 통합니다. **불변성을 지킨 덕분에** selector 최적화가 동작하는 것입니다.

### ③ 리렌더링 시나리오

| 일어난 일 | Context 버전 Pinned | Zustand 버전 Pinned |
| --- | --- | --- |
| 고정 **안 된** 할 일 체크 | 리렌더링 ⭕ | 리렌더링 ❌ |
| 고정 **된** 할 일 체크 | 리렌더링 ⭕ | 리렌더링 ⭕ |
| 할 일 고정/해제 | 리렌더링 ⭕ | 리렌더링 ⭕ |

- Context 버전은 `contextValue` 객체가 새로 만들어지면 그 컨텍스트를 쓰는 컴포넌트가 **모두** 다시 그려집니다.
- `console.log`를 열어 두고 Unpinned 쪽 체크박스를 눌러 보면 차이가 보입니다.

---

## 3. 함수 구독: `useShallow`로 객체 반환

```tsx
// 방법 A — 하나씩 (주석 처리된 방식)
const togglePin = useTaskStore((s) => s.togglePin);
const setTask   = useTaskStore((s) => s.setTask);

// 방법 B — 객체로 묶어서 (현재 방식)
const { togglePin, setTask } = useTaskStore(
  useShallow((s) => ({ togglePin: s.togglePin, setTask: s.setTask }))
);
```

- 객체 리터럴 `{ ... }`도 매번 새로 만들어지므로 `useShallow`가 필요합니다. 객체일 때는 **키별 값**을 비교합니다.
- 스토어 함수는 처음 만들어진 뒤 바뀌지 않습니다. 그래서 이 구독 때문에 리렌더링이 일어나는 일은 없습니다.
- A와 B는 결과가 같습니다. 가져올 게 많으면 B가 짧습니다.

---

## 4. 렌더링 부분: 목록 + 체크박스 + 핀 버튼

```tsx
<ul className="flex flex-col gap-2">
  {pinnedTaskList.map((task) => (
    <li key={task.id} className="flex justify-between gap-1.5">
      <label className={tw('text-2xl', task.isCompleted ? 'line-through' : '')}>
        <input
          type="checkbox"
          defaultChecked={task.isCompleted}                          // 비제어 체크박스
          onChange={(e) => handleSetTask(task.id, e.target.checked)}
        />{' '}
        {task.content}
      </label>
      <button type="button" onClick={() => handleTogglePin(task.id)}>
        {task.isPin ? <PiPushPinFill /> : <PiPushPinLight />}
      </button>
    </li>
  ))}
</ul>
```

- `key={task.id}`: 고유 id(`crypto.randomUUID()`)를 key로 써서 항목이 옮겨 다녀도 React가 구분할 수 있습니다.
- `tw(...)`: 완료된 할 일에 `line-through`(취소선)를 붙입니다. `tw`는 `clsx` + `tailwind-merge`를 합친 유틸입니다.
- `onClick={() => handleTogglePin(task.id)}`: 인자를 넘겨야 하므로 화살표 함수로 감쌉니다.
- 핀 버튼을 누르면 `isPin`이 `false`가 되어 이 목록에서 빠지고 Unpinned 목록으로 넘어갑니다.
- Pinned 목록에는 삭제 버튼이 없습니다. 고정된 할 일은 고정을 풀어야 지울 수 있습니다.

> ⚠️ 코드 확인: `console.log('[zustand] unpinned 렌더')`는 Unpinned 파일에서 복사해 온 문구입니다. 이 파일에서는 `'[zustand] pinned 렌더'`로 바꿔야 로그를 보고 두 목록을 구분할 수 있습니다.
>

> ⚠️ 코드 확인: 체크박스에 `defaultChecked`(비제어)를 썼기 때문에 처음 마운트될 때만 상태가 반영됩니다. 스토어의 `reset()` 등으로 `isCompleted`가 바깥에서 바뀌면 취소선은 바뀌어도 체크 표시는 그대로 남습니다. `checked={task.isCompleted}`(제어 컴포넌트)로 바꾸면 스토어와 항상 일치합니다.
>

> ⚠️ 코드 확인: 이 목록의 할 일은 항상 `isPin === true`라서 `task.isPin ? <PiPushPinFill /> : <PiPushPinLight />`의 `PiPushPinLight` 쪽은 실행되지 않습니다. `<PiPushPinFill />`만 써도 됩니다.
>

> ⚠️ 코드 확인: `import type { Task }`는 이 파일에서 쓰지 않습니다(ESLint 경고). `handleSetTask`, `handleTogglePin`도 받은 값을 그대로 넘기기만 하므로 `setTask`, `togglePin`을 바로 써도 됩니다.
>

---

## 🧷 한 줄 요약: PinnedTaskList 상태 가져오기

| 하고 싶은 것 | Context + Reducer | Zustand |
| --- | --- | --- |
| 고정된 목록 | `useTask().pinnedTaskList` | `usePinnedTasks()` |
| 함수 | `useTask().methods.togglePin` | `useTaskStore(useShallow(s => ({ ... })))` |
| 감싸기 | `<TaskProvider>` 필요 | 필요 없음 |
| 상태 변경 | `dispatch(togglePin(id))` (액션 생성 함수) | `set(state => ({ tasks: ... }))` |
| 새로고침 후 | 초기값으로 돌아감 | `persist`로 localStorage(`task-store`)에 유지 |
| 리렌더링 | 컨텍스트 값이 바뀌면 전부 | 고른 결과가 바뀔 때만 |
| 주의 | `useMemo`로 값·함수 고정 필요 | 새 배열·객체 반환 selector는 `useShallow` 필수 |

---

---

# 📗 practice 디렉터리 정리 (`miniApp/TaskManager/UnpinnedTaskList.tsx`)

## 0. 전체 구조: Pinned와 무엇이 다른가

**고정되지 않은 할 일 목록입니다. 뼈대는 `PinnedTaskList.tsx`와 같고, 삭제 버튼이 하나 더 있습니다.**

| | `PinnedTaskList.tsx` | `UnpinnedTaskList.tsx` |
| --- | --- | --- |
| 목록 훅 | `usePinnedTasks()` | `useUnpinnedTasks()` |
| 꺼내는 함수 | `togglePin`, `setTask` | `togglePin`, `setTask`, **`deleteTask`** |
| 버튼 | 핀 | 핀 + **삭제(✕)** |
| 글자 크기 | `text-2xl` (크게 강조) | 기본 크기 |
| 항목 간격 | `gap-2` | `gap-6` |
| 취소선 | `task.isCompleted ? 'line-through' : ''` | `task.isCompleted && 'line-through'` |

---

## 1. 데이터 가져오기: `useUnpinnedTasks()` + 함수 세 개

**고정되지 않은 할 일만 걸러서 구독하고, 필요한 함수 세 개를 객체 하나로 꺼냅니다.**

```tsx
// @store.ts
export const useUnpinnedTasks = () =>
  useTaskStore(useShallow((s) => s.tasks.filter((t) => !t.isPin)));   // !t.isPin

// UnpinnedTaskList.tsx
const unpinnedTaskList = useUnpinnedTasks();

const { togglePin, setTask, deleteTask } = useTaskStore(
  useShallow((s) => ({
    togglePin: s.togglePin,
    setTask: s.setTask,
    deleteTask: s.deleteTask,
  }))
);
```

- `filter()`가 매번 새 배열을 만들기 때문에 `useShallow`로 **요소를 하나씩** 비교합니다. 그래야 내용이 같을 때 리렌더링되지 않습니다.
- 객체 `{ togglePin, setTask, deleteTask }`도 매번 새로 만들어지므로 `useShallow`가 필요합니다. 객체는 **키별 값**을 비교합니다.
- 주석 처리된 방식(`tasks` 전체 구독 후 컴포넌트에서 `filter`)은 고정된 할 일만 바뀌어도 이 목록까지 다시 그립니다.

### ① 리렌더링 시나리오

| 일어난 일 | Context 버전 Unpinned | Zustand 버전 Unpinned |
| --- | --- | --- |
| 고정 **된** 할 일 체크 | 리렌더링 ⭕ | 리렌더링 ❌ |
| 고정 **안 된** 할 일 체크 | 리렌더링 ⭕ | 리렌더링 ⭕ |
| 할 일 삭제 | 리렌더링 ⭕ | 리렌더링 ⭕ |
| 할 일 고정/해제 | 리렌더링 ⭕ | 리렌더링 ⭕ (목록에서 빠지거나 들어옴) |

---

## 2. ⭐ 삭제: `deleteTask`

**스토어에서 `filter`로 해당 id만 빼고 새 배열을 만듭니다.**

```tsx
// @store.ts
deleteTask: (id) =>
  set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id),   // id가 다른 것만 남김 = 삭제
  })),

// UnpinnedTaskList.tsx
const handleDeleteTask = (deleteId: string) => {
  deleteTask(deleteId);
};

<button type="button" onClick={() => handleDeleteTask(task.id)}>
  <RxCross1 />                                        {/* ✕ 아이콘 */}
</button>
```

- 원본 배열을 `splice`로 고치지 않고 `filter`로 **새 배열**을 만듭니다(불변성). 그래야 Zustand가 변경을 알아챕니다.
- Context 버전에서는 같은 일을 `dispatch(deleteTask(deleteId))`로 하고, reducer의 `case ACTION_TYPE.DELETE_TASK`에서 똑같이 `filter`합니다.
- 삭제 버튼은 고정되지 않은 목록에만 있습니다. 중요한 할 일(고정)은 실수로 지우지 못하게 한 구조입니다.

---

## 3. 렌더링 부분

```tsx
<ul className="flex flex-col gap-6">
  {unpinnedTaskList.map((task) => (                       // ( ) → 바로 반환
    <li key={task.id} className="flex justify-between gap-1.5">
      <label className={tw('flex gap-1', task.isCompleted && 'line-through')}>
        <input
          type="checkbox"
          className="accent-accent"                         // 체크박스 색을 테마 accent 색으로
          defaultChecked={task.isCompleted}
          onChange={(e) => handleSetTask(task.id, e.target.checked)}
        />{' '}
        {task.content}
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={() => handleTogglePin(task.id)}>
          {task.isPin ? <PiPushPinFill /> : <PiPushPinLight />}
        </button>
        <button type="button" onClick={() => handleDeleteTask(task.id)}>
          <RxCross1 />
        </button>
      </div>
    </li>
  ))}
</ul>
```

### ① `map`의 두 가지 반환 방식

```tsx
// PinnedTaskList — 중괄호 + return
pinnedTaskList.map((task) => { return (<li>...</li>); })

// UnpinnedTaskList — 소괄호로 바로 반환
unpinnedTaskList.map((task) => (<li>...</li>))
```

- 결과는 같습니다. `return` 전에 계산할 게 없으면 소괄호 방식이 짧습니다.

### ② `tw('flex gap-1', task.isCompleted && 'line-through')`

- `isCompleted`가 `false`이면 `false && '...'`가 `false`가 됩니다. `tw`(내부적으로 `clsx`)는 `false`, `null`, `undefined`를 **무시**합니다. 그래서 삼항 연산자 `? 'line-through' : ''` 없이 `&&`만 써도 됩니다.
- JSX에서 `&&` 왼쪽에 숫자 `0`을 두면 안 되는 것과 달리, 여기서는 클래스 문자열을 만드는 것이라 그 함정이 없습니다.

### ③ `accent-accent`

- Tailwind의 `accent-{색}` 유틸리티는 CSS `accent-color`를 지정합니다. 체크박스·라디오의 체크 색이 바뀝니다. 뒤의 `accent`는 `_theme.css`에 정의한 테마 색 이름입니다.

> ⚠️ 코드 확인: `import { deleteTask, setTask, togglePin } from './@reducer'`는 쓰이지 않습니다. 함수 안에서 스토어에서 꺼낸 같은 이름의 변수(`const { togglePin, setTask, deleteTask } = ...`)가 이 import를 **가립니다(shadowing)**. 에러는 안 나지만, 읽는 사람이 "reducer의 액션 생성 함수를 쓰나?" 하고 헷갈립니다. 이 import 줄과 `import type { Task }`는 지우는 게 좋습니다.
>

> ⚠️ 코드 확인: `console.log('[zustand] unpinned 렌더')`는 이 파일에서는 맞는 문구입니다. 그런데 `PinnedTaskList.tsx`에도 같은 문구가 있어서 로그만 보면 두 목록을 구분할 수 없습니다. Context 버전 `UnpinnedTaskList_.tsx`는 반대로 `'Pinned render'`라고 찍습니다.
>

> ⚠️ 코드 확인: Pinned와 마찬가지로 `defaultChecked`(비제어)라서 `reset()`처럼 바깥에서 `isCompleted`가 바뀌면 체크 표시가 따라오지 않습니다. 핀을 토글할 때는 항목이 다른 목록으로 옮겨 가면서 **새로 마운트**되기 때문에 문제가 안 보이는 것입니다. `checked={task.isCompleted}`로 바꾸면 항상 일치합니다.
>

> ⚠️ 코드 확인: 이 목록의 할 일은 항상 `isPin === false`라서 `<PiPushPinFill />` 쪽은 실행되지 않습니다. `<PiPushPinLight />`만 써도 됩니다.
>

---

## 🧷 한 줄 요약: Pinned / Unpinned 목록 비교

| 하고 싶은 것 | Pinned | Unpinned |
| --- | --- | --- |
| 목록 구독 | `usePinnedTasks()` → `filter(t => t.isPin)` | `useUnpinnedTasks()` → `filter(t => !t.isPin)` |
| 완료 체크 | `setTask(id, checked)` | `setTask(id, checked)` |
| 고정/해제 | `togglePin(id)` → Unpinned로 이동 | `togglePin(id)` → Pinned로 이동 |
| 삭제 | 없음 | `deleteTask(id)` → `filter(t => t.id !== id)` |
| 리렌더링 조건 | 고정된 할 일이 바뀔 때만 | 고정되지 않은 할 일이 바뀔 때만 |
| 공통 주의 | 새 배열·객체 selector는 `useShallow`, 체크박스는 `checked` 권장 | 〃 |

---

---

# 📘 `@reducer.ts` vs `@store.ts` 비교 정리 (`miniApp/TaskManager/`)

## 0. 전체 구조: 같은 일을 하는 두 가지 방법

**`@reducer.ts`(+ `@context.tsx`)와 `@store.ts`는 할 일 목록의 추가·삭제·고정·완료 기능을 똑같이 구현합니다. 다른 것은 상태가 사는 곳과 바꾸는 방식입니다.**

```
[Context + Reducer]                              [Zustand]
@types.ts    Task 타입, INITIAL_TASKS              @types.ts  (같은 파일 공유)
@reducer.ts  액션 타입 · 액션 생성 함수 · reducer     @store.ts  상태 + 함수 + 파생 selector 훅
@context.tsx useReducer · methods · Provider · useTask
```

- Context 방식은 **파일 3개**(types · reducer · context)가 맞물려야 동작합니다.
- Zustand 방식은 **파일 1개**(store)에 상태와 함수가 다 들어 있습니다.
- `@types.ts`의 `Task` 타입과 `INITIAL_TASKS`는 두 방식이 같이 씁니다.

---

## 1. `@reducer.ts`: 액션 타입 → 액션 생성 함수 → reducer

### ① 액션 타입 상수

```ts
const ACTION_TYPE = {
  TOGGLE_PIN: '핀 토글',
  SET_TASK: '테스크 토글',
  DELETE_TASK: '테스크 삭제',
  ADD_TASK: '테스크 추가',
} as const;                       // 값을 string이 아니라 '핀 토글' 같은 리터럴 타입으로 고정
```

- 액션 이름을 문자열로 직접 쓰면 오타가 나도 모릅니다. 상수 객체에 모아 두면 자동 완성이 되고 오타가 타입 에러로 잡힙니다.
- `as const`가 없으면 `typeof ACTION_TYPE.TOGGLE_PIN`이 그냥 `string`이 되어서 아래의 유니온 구분이 동작하지 않습니다.

### ② 액션 타입 + 액션 생성 함수

```ts
export type TogglePinAction = {
  type: typeof ACTION_TYPE.TOGGLE_PIN;   // '핀 토글'
  payload: string;                       // taskId
};
export const togglePin = (taskId: string): TogglePinAction => ({
  type: ACTION_TYPE.TOGGLE_PIN,
  payload: taskId,
});

export type SetTaskAction = {
  type: typeof ACTION_TYPE.SET_TASK;
  payload: { taskId: string; isCompleted: boolean };   // 값이 둘이면 객체로
};
export const setTask = (taskId: string, isCompleted: boolean): SetTaskAction => ({
  type: ACTION_TYPE.SET_TASK,
  payload: { taskId, isCompleted },
});

export type Action = TogglePinAction | SetTaskAction | DeleteTaskAction | AddTaskAction;
```

- **액션 생성 함수**(action creator)는 액션 객체를 만들어 주는 함수입니다. `dispatch({ type: '핀 토글', payload: id })` 대신 `dispatch(togglePin(id))`라고 쓸 수 있습니다.
- `Action` 유니온 하나로 "이 reducer가 받을 수 있는 액션은 이 네 가지뿐"이라고 정합니다.

### ③ ⭐ reducer: 구별된 유니온(discriminated union)

```ts
export default function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ACTION_TYPE.TOGGLE_PIN: {               // { } 블록 → 블록마다 const 이름 재사용 가능
      const taskId = action.payload;             // 여기선 payload가 string으로 좁혀짐
      return state.map((item) =>
        item.id === taskId ? { ...item, isPin: !item.isPin } : item
      );
    }
    case ACTION_TYPE.SET_TASK: {
      const { taskId, isCompleted } = action.payload;   // 여기선 객체로 좁혀짐
      return state.map((item) =>
        item.id === taskId ? { ...item, isCompleted } : item
      );
    }
    case ACTION_TYPE.DELETE_TASK:
      return state.filter((item) => item.id !== action.payload);
    case ACTION_TYPE.ADD_TASK:
      return [
        { id: crypto.randomUUID(), content: action.payload, isCompleted: false, isPin: false },
        ...state,                                 // 새 할 일을 맨 앞에
      ];
    default:
      return state;
  }
}
```

- `switch (action.type)`로 분기하면 TypeScript가 각 `case` 안에서 `action.payload`의 타입을 **자동으로 좁혀 줍니다**. `type` 필드가 유니온을 구별하는 열쇠 역할을 해서 "구별된 유니온"이라고 부릅니다.
- `case` 안을 `{ }`로 감싼 이유: `switch` 전체가 스코프 하나라서, 감싸지 않으면 `const nextState`를 두 번 선언할 때 에러가 납니다.
- 모든 `case`가 **새 배열**을 반환합니다(`map`, `filter`, 스프레드). 원본 `state`는 건드리지 않습니다.
- 실제 파일은 `if / else`와 `nextState` 변수로 풀어 썼습니다. 위 코드는 같은 내용을 삼항 연산자로 줄인 것입니다.

> ⚠️ 코드 확인: `SET_TASK`의 값이 `'테스크 토글'`인데, 이 액션은 값을 뒤집는(toggle) 게 아니라 넘겨받은 값으로 `isCompleted`를 **설정(set)**합니다. `'태스크 완료 설정'`처럼 바꾸면 로그를 볼 때 덜 헷갈립니다. 철자도 `태스크`가 표준 표기입니다.
>

---

## 2. `@context.tsx`: reducer를 컴포넌트에 연결하기

**reducer만으로는 공유가 안 됩니다. `useReducer`로 상태를 만들고 Context로 내려 보내야 합니다.**

```tsx
export function TaskProvider(props: React.PropsWithChildren) {
  const [taskList, dispatch] = useReducer(taskReducer, INITIAL_TASKS);

  // ① 메서드: dispatch를 감싼 함수들 (dispatch는 참조가 고정이라 deps는 [])
  const taskMethods = useMemo<TaskMethods>(() => ({
    addTask:    (nextStep) => dispatch(addTask(nextStep)),
    deleteTask: (deleteId) => dispatch(deleteTask(deleteId)),
    togglePin:  (taskId) => dispatch(togglePin(taskId)),
    setTask:    (taskId, isCompleted) => dispatch(setTask(taskId, isCompleted)),
  }), []);

  // ② 파생 상태: taskList가 바뀔 때만 다시 거름
  const { pinnedTaskList, unpinnedTaskList } = useMemo(() => ({
    pinnedTaskList:   taskList.filter((task) => task.isPin),
    unpinnedTaskList: taskList.filter((task) => !task.isPin),
  }), [taskList]);

  // ③ 컨텍스트 값도 useMemo로 고정
  const contextValue = useMemo(
    () => ({ pinnedTaskList, unpinnedTaskList, methods: taskMethods }),
    [pinnedTaskList, unpinnedTaskList, taskMethods]
  );

  return <TaskContext value={contextValue} {...props} />;   // React 19: .Provider 생략 가능
}

export const useTask = () => {
  const contextValue = useContext(TaskContext);
  if (!contextValue) throw new Error('useTask 훅은 TaskProvider 내부에서만 사용해야 합니다.');
  return contextValue;                                      // 여기서 null이 걸러져 타입이 좁혀짐
};
```

- `useMemo`가 **세 번** 나옵니다. 하나라도 빠지면 Provider가 다시 그려질 때마다 새 객체가 만들어지고, 컨텍스트를 쓰는 모든 컴포넌트가 리렌더링됩니다.
- 그래도 `contextValue`는 `taskList`가 바뀌면 통째로 새로 만들어집니다. 결국 할 일 하나만 바뀌어도 Pinned·Unpinned **둘 다** 다시 그려집니다. Context 방식의 한계입니다.
- `useTask`에서 `null` 검사를 하면 Provider 밖에서 실수로 쓴 경우를 바로 알 수 있고, 반환 타입에서 `null`도 빠집니다.

---

## 3. `@store.ts`: 상태 + 함수 + persist를 한 파일에

```ts
type TaskState = {
  tasks: Task[];                          // reducer는 Task[]가 상태 자체, 여기선 객체의 한 키
  addTask: (content: string) => void;
  deleteTask: (id: string) => void;
  togglePin: (id: string) => void;
  setTask: (id: string, isCompleted: boolean) => void;
  reset: () => void;
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, _get, store) => ({
      tasks: INITIAL_TASKS,
      addTask: (content) =>
        set((state) => ({
          tasks: [{ id: crypto.randomUUID(), content, isCompleted: false, isPin: false }, ...state.tasks],
        })),
      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      togglePin: (id) =>
        set((state) => ({ tasks: state.tasks.map((t) => (t.id === id ? { ...t, isPin: !t.isPin } : t)) })),
      setTask: (id, isCompleted) =>
        set((state) => ({ tasks: state.tasks.map((t) => (t.id === id ? { ...t, isCompleted } : t)) })),
      reset: () => set(store.getInitialState),   // 함수를 넘김 → set이 호출해서 초기 상태를 받음
    }),
    { name: 'task-store' }                       // localStorage 키 이름
  )
);

// 파생 상태는 selector 훅으로
export const usePinnedTasks   = () => useTaskStore(useShallow((s) => s.tasks.filter((t) => t.isPin)));
export const useUnpinnedTasks = () => useTaskStore(useShallow((s) => s.tasks.filter((t) => !t.isPin)));
```

### ① 상태 모양이 다른 이유

- reducer의 상태는 `Task[]` 배열 그 자체입니다.
- Zustand의 `set`은 **객체를 얕게 병합**하는 방식이라 상태가 객체여야 합니다. 그래서 `{ tasks: Task[] }`처럼 키 하나를 두고, 같은 객체 안에 함수도 같이 넣습니다.

### ② ⭐ persist 미들웨어

- `persist(스토어 함수, { name })`으로 감싸면 상태가 바뀔 때마다 **localStorage**에 자동 저장되고, 새로고침하면 다시 불러옵니다.
- 저장은 JSON으로 하기 때문에 함수는 저장되지 않고 `tasks` 같은 데이터만 저장됩니다. 불러올 때는 저장된 데이터가 초기 상태 위에 합쳐집니다.
- 개발자 도구 → Application → Local Storage에서 `task-store` 키를 보면 저장된 값을 확인할 수 있습니다.
- Context 버전에는 이 기능이 없어서 새로고침하면 `INITIAL_TASKS`로 돌아갑니다.

### ③ `reset: () => set(store.getInitialState)`

- `set`에 함수를 넘기면 Zustand가 그 함수를 `(state) => ...`처럼 호출합니다. `getInitialState`는 인자를 무시하고 초기 상태를 돌려주므로 결과는 `set(store.getInitialState())`와 같습니다.
- persist가 켜져 있으므로 reset한 상태도 그대로 localStorage에 덮어써집니다.

> ⚠️ 코드 확인: persist를 켠 뒤에는 `@types.ts`의 `INITIAL_TASKS`를 고쳐도 화면에 반영되지 않습니다. localStorage에 저장된 예전 값을 먼저 불러오기 때문입니다. 초기 데이터를 바꿨다면 Local Storage의 `task-store`를 지우거나 `reset()`을 호출하세요. 배포한 앱이라면 persist 옵션의 `version`을 올려 예전 데이터를 버리게 할 수 있습니다.
>

> ⚠️ 코드 확인: `addTask`(두 방식 모두)와 `reset`(store)은 정의만 있고 화면에서 호출하는 곳이 없습니다. 입력창이나 reset 버튼을 붙여야 실제로 쓸 수 있습니다.
>

---

## 4. ⭐ 기능별 1:1 대응

| 기능 | Context + Reducer | Zustand |
| --- | --- | --- |
| 초기 상태 | `useReducer(taskReducer, INITIAL_TASKS)` | `tasks: INITIAL_TASKS` |
| 상태 모양 | `Task[]` | `{ tasks: Task[], ...함수 }` |
| 할 일 추가 | `dispatch(addTask(text))` → `case ADD_TASK` | `addTask(text)` → `set(...)` |
| 삭제 | `dispatch(deleteTask(id))` → `filter` | `deleteTask(id)` → `filter` |
| 고정 토글 | `dispatch(togglePin(id))` → `map` | `togglePin(id)` → `map` |
| 완료 설정 | `dispatch(setTask(id, done))` → `map` | `setTask(id, done)` → `map` |
| 초기화 | 없음 | `reset()` → `store.getInitialState` |
| 파생 목록 | Provider 안 `useMemo` + `filter` | `usePinnedTasks()` / `useUnpinnedTasks()` |
| 함수 참조 고정 | `useMemo(..., [])` 직접 | 처음부터 고정 |
| 공유 범위 | `<TaskProvider>` 안쪽만 (Provider마다 따로) | 앱 전체에서 하나 |
| 새로고침 | 초기값으로 돌아감 | `persist`로 유지 |

- **상태를 바꾸는 계산 자체(`map`, `filter`, 스프레드)는 두 방식이 똑같습니다.** 다른 건 그 계산을 어디에 두고 어떻게 부르느냐입니다.
- Reducer: "액션을 보내면 reducer가 처리" → 상태가 바뀌는 방법이 `switch` 한 곳에 다 모여 있어 흐름을 따라가기 쉽습니다.
- Zustand: "스토어 함수를 바로 호출" → 액션 타입 · 생성 함수 · dispatch 단계가 없어서 코드가 짧습니다.

---

## 🧷 한 줄 요약: Reducer vs Store 고르기

| 상황 | 추천 |
| --- | --- |
| 한 컴포넌트 안의 복잡한 상태 | `useReducer` |
| 하위 트리에만 공유, 라이브러리 추가 없이 | Context + `useReducer` |
| 앱 여러 곳에서 공유, 리렌더링 최소화 | Zustand + selector / `useShallow` |
| 새로고침해도 유지 | Zustand `persist` |
| 상태 변경 규칙을 한눈에 보고 싶음 | reducer의 `switch` + 액션 유니온 |
| 코드를 짧게 | Zustand 스토어 함수 |

---

---

# 📘 hook 디렉터리 정리 (`src/hook/`)

## 0. 전체 구조

**상태 로직을 컴포넌트에서 떼어 낸 커스텀 훅 3개가 있습니다. `useCounter`는 완성된 훅이고, `useSwitch`·`useSwitchReducer`는 아직 속이 비어 있는 실습용 뼈대입니다.**

| 파일 | 상태 도구 | 사용하는 곳 | 상태 |
| --- | --- | --- | --- |
| `useCounter.ts` | `useState` | `miniApp/Counter/index_.tsx` | ✅ 완성 |
| `useSwitch.ts` | `useState` (예정) | `miniApp/Switcher/Switch.tsx` | 🚧 뼈대 |
| `useSwitchReducer.ts` | `useReducer` (예정) | 아직 없음 | 🚧 뼈대 (`useSwitch.ts`와 내용 같음) |

- 커스텀 훅은 이름이 `use`로 시작하고, 안에서 다른 훅(`useState`, `useId` 등)을 부르는 **함수**입니다.
- 훅은 **로직**을 공유할 뿐 **상태**를 공유하지 않습니다. 같은 훅을 두 컴포넌트에서 부르면 상태가 두 벌 생깁니다.
- 페이지 설명(`pages/Switch/index.tsx`): "제어 · 비제어를 모두 지원하는 훅을 만들고, 안쪽만 useReducer로 바꿔 봅니다." → `useSwitch`를 먼저 완성하고, 같은 겉모습(반환값)을 유지한 채 안쪽만 `useReducer`로 바꾸는 것이 실습 목표입니다.

---

## 1. `useCounter.ts`: 옵션 객체 + 파생 상태 + useCallback

**카운터 상태와 증가·감소·초기화 함수를 묶어서 반환합니다.** (자세한 내용은 위 "커스텀 훅(useState)" 절 참고)

```ts
function useCounter({
  count: initialCount = 0,   // 옵션 이름은 count, 훅 안에서는 initialCount로 이름 바꿈
  step = 1,
  min = 0,
  max = 10,
} = {}) {                    // 인자를 안 넘기면 {} → 모든 기본값 사용
  const [count, setCount] = useState(initialCount);

  const isMinDisabled = count <= min;    // 파생 상태
  const isMaxDisabled = count >= max;

  const increment = useCallback(() => setCount((c) => Math.min(c + step, max)), [max, step]);
  const decrement = useCallback(() => setCount((c) => Math.max(c - step, min)), [min, step]);
  const reset     = useCallback(() => setCount(initialCount), [initialCount]);

  return { count, increment, decrement, reset, isMinDisabled, isMaxDisabled };
}
```

- `{ count: initialCount = 0 }`: 구조 분해하면서 **이름 바꾸기 + 기본값**을 한 번에 합니다.
- `= {}`: 인자 자체가 없을 때 `undefined`를 구조 분해하다 에러가 나는 것을 막습니다.
- 실제 파일은 `let nextCount` + `if`로 썼습니다. 위 코드의 `Math.min` / `Math.max`와 결과가 같습니다.

> ⚠️ 코드 확인: 반환값에 `step`이 없습니다. `index_.tsx`가 `step`을 꺼내 쓰므로 `return { count, step, ... }`처럼 추가해야 합니다.
>

---

## 2. `useSwitch.ts`: 제어 · 비제어를 모두 지원하는 스위치 훅 (뼈대)

**스위치 컴포넌트가 쓸 상태와 접근성 속성(`a11yProps`)을 만들어 주는 훅입니다. 지금은 상태 부분이 비어 있습니다.**

```ts
type UseSwitchOptions = {
  defaultChecked?: boolean;              // 비제어: 처음 값만 정해 주고 이후엔 훅이 관리
  checked?: boolean;                     // 제어: 부모가 값을 쥐고 있음
  onChange?: (next: boolean) => void;    // 값이 바뀌려 할 때 부모에게 알림
  id?: string;
  disabled?: boolean;
};

export function useSwitch(opts: UseSwitchOptions = {}) {
  const { defaultChecked = false, checked, onChange, id, disabled = false } = opts;

  const reactId = useId();                       // 컴포넌트마다 고유한 id 자동 생성

  const isChecked = false;                       // 🚧 항상 false
  const setChecked = (_next: boolean) => {};     // 🚧 아무것도 안 함
  const toggle = () => {};                       // 🚧 아무것도 안 함

  const a11yProps = { /* 아래 ② 참고 */ };

  return { checked: isChecked, setChecked, toggle, a11yProps, disabled };
}
```

### ① ⭐ 제어(controlled) vs 비제어(uncontrolled)

```tsx
// pages/Switch/index.tsx
const [dark, setDark] = useState(false);

<Switcher size="lg" checked={dark} onChange={setDark} />   // 제어: 부모의 dark가 진짜 값
<Switcher defaultChecked />                                // 비제어: 스위치가 혼자 켜고 끔
```

| | 제어 | 비제어 |
| --- | --- | --- |
| 넘기는 prop | `checked` + `onChange` | `defaultChecked` (선택) |
| 진짜 값을 가진 곳 | **부모** state | **훅 내부** state |
| 클릭하면 | `onChange(next)`만 호출 → 부모가 바꿔야 화면이 바뀜 | 내부 state를 바꿈 (+ `onChange`가 있으면 알림) |
| 구분 방법 | `checked !== undefined` | `checked === undefined` |

- `<input>`의 `value` / `defaultValue`, `checked` / `defaultChecked`와 같은 개념입니다. 위 TaskList에서 본 `defaultChecked` 문제도 이 차이 때문입니다.

### ② `a11yProps`: 접근성 속성 묶음

```ts
const a11yProps = {
  id: id ?? reactId,                     // id를 안 넘기면 useId 값 사용
  role: 'switch' as const,               // 스크린 리더에 "스위치"로 알림 (as const로 리터럴 타입)
  'aria-checked': isChecked,             // 켜짐/꺼짐 상태 전달
  'aria-disabled': disabled || undefined,// false일 땐 속성 자체를 빼기 위해 undefined
  tabIndex: disabled ? -1 : 0,           // 비활성화면 Tab으로 못 들어옴
  onKeyDown: (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }  // 기본 클릭 막고 직접 토글
    if (e.key === 'ArrowLeft') setChecked(false);
    if (e.key === 'ArrowRight') setChecked(true);
  },
  onClick: () => toggle(),
};

// Switch.tsx — 한 번에 펼쳐서 적용
<button {...a11yProps} type="button" className="switch ...">
```

- 훅이 속성을 **객체로 묶어 반환**하고 컴포넌트는 `{...a11yProps}`로 펼치기만 합니다. 이렇게 속성을 만들어 주는 훅을 "prop getter" 패턴이라고도 합니다.
- `?? `(널 병합): `id`가 `null`/`undefined`일 때만 `reactId`를 씁니다. 빈 문자열은 그대로 둡니다.
- `disabled || undefined`: React는 `undefined`인 속성을 DOM에 아예 넣지 않습니다. `aria-disabled="false"`가 붙는 것을 피하려는 것입니다.

### ③ 완성 예시 (useState 버전)

```ts
import { useCallback, useId, useState } from 'react';

export function useSwitch(opts: UseSwitchOptions = {}) {
  const { defaultChecked = false, checked, onChange, id, disabled = false } = opts;
  const reactId = useId();

  const [innerChecked, setInnerChecked] = useState(defaultChecked);   // 비제어용 내부 상태
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : innerChecked;            // 진짜 값 고르기

  const setChecked = useCallback((next: boolean) => {
    if (disabled || next === isChecked) return;   // 비활성화거나 값이 같으면 무시
    if (!isControlled) setInnerChecked(next);     // 비제어일 때만 내부 상태 변경
    onChange?.(next);                             // 제어든 비제어든 부모에게 알림
  }, [disabled, isChecked, isControlled, onChange]);

  const toggle = useCallback(() => setChecked(!isChecked), [setChecked, isChecked]);

  // a11yProps, return은 그대로
}
```

- 핵심은 `isChecked = isControlled ? checked : innerChecked` 한 줄입니다. **값을 어디서 읽을지**만 바꾸면 두 방식을 모두 지원할 수 있습니다.
- `onChange?.(next)`: `onChange`가 없으면 호출하지 않는 옵셔널 체이닝입니다.

> ⚠️ 코드 확인: 뼈대 상태라 `isChecked`가 항상 `false`이고 `toggle`이 아무것도 하지 않습니다. 그래서 지금은 Switch 페이지의 스위치를 눌러도 반응이 없고, `defaultChecked`를 준 아래 스위치도 꺼진 상태로 보입니다. `defaultChecked`, `checked`, `onChange`도 꺼내기만 하고 쓰지 않습니다(`tsconfig`의 `noUnusedLocals: false`라서 빌드 에러는 안 납니다).
>

> ⚠️ 코드 확인: `onClick: () => toggle()`에는 `disabled` 검사가 없습니다. `onKeyDown`처럼 `if (disabled) return;`을 넣거나, 위 완성 예시처럼 `setChecked` 안에서 막아야 비활성화 스위치를 클릭해도 바뀌지 않습니다.
>

---

## 3. `useSwitchReducer.ts`: 안쪽만 useReducer로 (뼈대)

**`useSwitch`와 반환값(겉모습)은 같게 두고, 내부 상태 관리만 `useReducer`로 바꾸는 실습 파일입니다. 지금은 `useSwitch.ts`를 그대로 복사한 상태입니다.**

### ① 완성 예시 (useReducer 버전)

```ts
import { useId, useReducer } from 'react';

type State = { checked: boolean };
type Action =
  | { type: 'toggle' }
  | { type: 'set'; payload: boolean };

function switchReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'toggle': return { checked: !state.checked };
    case 'set':    return { checked: action.payload };
    default:       return state;
  }
}

export function useSwitchReducer(opts: UseSwitchOptions = {}) {
  const { defaultChecked = false, checked, onChange, id, disabled = false } = opts;
  const reactId = useId();

  const [state, dispatch] = useReducer(switchReducer, { checked: defaultChecked });
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : state.checked;

  const setChecked = (next: boolean) => {
    if (disabled || next === isChecked) return;
    if (!isControlled) dispatch({ type: 'set', payload: next });   // setState 대신 dispatch
    onChange?.(next);
  };
  const toggle = () => setChecked(!isChecked);

  // a11yProps, return은 useSwitch와 동일
}
```

- 바뀐 곳은 `useState` → `useReducer`, `setInnerChecked(next)` → `dispatch({ type: 'set', payload: next })` 두 군데뿐입니다.
- 반환값이 같으므로 `Switch.tsx`에서 import만 바꾸면 그대로 동작합니다. **훅 안쪽 구현을 바꿔도 쓰는 쪽은 몰라도 된다**는 것이 커스텀 훅의 장점입니다.
- 스위치처럼 상태가 boolean 하나면 `useState`로 충분합니다. 이 실습은 `useReducer`로 옮기는 연습용입니다.

> ⚠️ 코드 확인: 파일 이름은 `useSwitchReducer`인데 export하는 함수 이름이 `useSwitch`입니다. 두 파일을 같이 import하면 이름이 겹치므로 `export function useSwitchReducer`로 바꾸는 게 좋습니다.
>

---

## 🧷 한 줄 요약: 커스텀 훅 만들기

| 하고 싶은 것 | 방법 |
| --- | --- |
| 옵션을 받고 기본값 주기 | `function useX({ a = 1, b = 2 } = {})` |
| 옵션 이름 바꾸기 | `{ count: initialCount = 0 }` |
| 계산으로 알 수 있는 값 | state 말고 변수로 계산 (`isMaxDisabled`) |
| 반환 함수 참조 고정 | `useCallback` |
| 제어 · 비제어 둘 다 지원 | `isControlled = value !== undefined` → `isControlled ? value : inner` |
| 고유 id | `useId()` |
| 접근성 속성 묶어서 주기 | `a11yProps` 객체 반환 → `<button {...a11yProps}>` |
| 내부를 reducer로 교체 | 반환값은 그대로, `setState` → `dispatch`만 바꾸기 |
| 주의 | 훅은 로직 공유이지 상태 공유가 아님 (공유하려면 Context / Zustand) |

---

---

# 📗 Counter 디렉터리 정리 (`miniApp/Counter/`)

## 0. 전체 구조: `_` 있는 파일 vs 없는 파일

**같은 카운터 UI를 두 벌 만들었습니다. `_` 붙은 파일은 커스텀 훅 + props 방식, 안 붙은 파일은 Zustand 스토어 방식입니다.**

| 역할 | 커스텀 훅 방식 (`_`) | Zustand 방식 |
| --- | --- | --- |
| 상태 | `hook/useCounter.ts` | `@store.ts` |
| 조립 (부모) | `index_.tsx` | `index.tsx` |
| 숫자 표시 | `CountDisplay_.tsx` (props로 `count` 받음) | `CountDisplay.tsx` (직접 구독) |
| 증감 버튼 | `CountButton_.tsx` (props로 `onUpdate` 받음) | `CountButton.tsx` (`type`만 받고 직접 구독) |
| step · reset 조작 | 없음 | `CounterControls.tsx` |
| 스타일 | `style.module.css` (공통) | 〃 |

```
[커스텀 훅 방식]                         [Zustand 방식]
index_.tsx ── useCounter()               @store.ts (useCountStore)
  ├ CountDisplay_  ← count (props)          ↑         ↑          ↑
  └ CountButton_ ×2 ← onUpdate (props)   index.tsx  CountDisplay  CountButton ×2
                                          CounterControls (형제인데도 같은 스토어)
```

- 훅 방식은 데이터가 **부모 → 자식(props)** 한 방향으로 내려갑니다.
- Zustand 방식은 각 컴포넌트가 **스토어에 직접** 연결됩니다. 부모는 자식에게 데이터를 내려 주지 않습니다.

---

## 1. `@store.ts`: 카운터 스토어

**`count`, `step`, `min`, `max`와 이를 바꾸는 함수 4개를 한 스토어에 둡니다.** (자세한 설명은 위 "Zustand 스토어" 절 참고)

```ts
export const useCountStore = create<Store>()((set, _get, store) => {
  const increment = () =>
    set(({ count, step, max }) => ({ count: Math.min(count + step, max) }));
  const decrement = () =>
    set(({ count, step, min }) => ({ count: Math.max(count - step, min) }));
  const setStep = (newStep: number) => set({ step: newStep });
  const reset = () => set(store.getInitialState());

  return { step: 1, min: 0, max: 10, count: 0, increment, decrement, reset, setStep };
});
```

- `set((state) => 바꿀 부분)`: 현재 상태를 받아 **바꿀 키만** 반환하면 나머지와 자동으로 합쳐집니다.
- `reset`은 `count`와 `step`을 모두 처음 값으로 돌립니다.
- 실제 파일은 `let nextCount` + `if`로 썼고, 위 코드의 `Math.min` / `Math.max`와 결과가 같습니다.

---

## 2. `index_.tsx` + `CountDisplay_.tsx` + `CountButton_.tsx`: props 방식

```tsx
// index_.tsx
const { count, increment, decrement, step, isMaxDisabled, isMinDisabled } = useCounter();

<CountDisplay_ count={count} />
<CountButton_ disabled={isMaxDisabled} onUpdate={increment}>
  {useMemo(() => <GrFormUp />, [])}
</CountButton_>

// CountDisplay_.tsx
function CountDisplay({ count }: { count: number }) {
  return <output className={S.output}>{count}</output>;
}

// CountButton_.tsx
function CountButton({ children, onUpdate, ...restProps }:
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & { onUpdate: () => void }) {
  return (
    <button type="button" className={S.button} onClick={onUpdate} {...restProps}>
      {children}
    </button>
  );
}
```

- 자식은 상태를 전혀 모르는 **표현용(presentational) 컴포넌트**입니다. 받은 값을 그리고, 받은 함수를 부를 뿐입니다.
- `...restProps`: `title`, `aria-label`, `disabled` 같은 나머지 버튼 속성을 그대로 `<button>`에 넘깁니다.
- `<output>`: 계산 결과를 보여 주는 시맨틱 HTML 태그입니다. 값이 바뀐 것을 스크린 리더가 알아채기 쉽습니다.
- 이 카운터를 두 개 렌더링하면 `useCounter`가 두 번 불려 **상태가 따로** 생깁니다.

> ⚠️ 코드 확인: `useCounter`가 `step`을 반환하지 않아 라벨이 "undefined 증가"가 됩니다. 감소 버튼에도 `<GrFormUp />`이 들어가 있으니 `<GrFormDown />`으로 바꿔야 합니다. 그리고 `index_.tsx`에서 import한 `useState`는 쓰이지 않습니다.
>

---

## 3. `index.tsx`: Zustand 방식의 부모

```tsx
const [count, step, min, max] = useCountStore(
  useShallow((s) => [s.count, s.step, s.min, s.max])   // 여러 값 → useShallow
);

const incrementLabel = `${step} 증가`;
const isMinDisabled = count <= min;
const isMaxDisabled = count >= max;

<div className={tw(S.component, className)}>
  <CountDisplay />                                     {/* props 없음 */}
  <div role="group" className={S.group}>
    <CountButton title={incrementLabel} aria-label={incrementLabel} disabled={isMaxDisabled}>
      {useMemo(() => <GrFormUp />, [])}
    </CountButton>
    <CountButton type="-" ... disabled={isMinDisabled}>
      {useMemo(() => <GrFormDown />, [])}
    </CountButton>
  </div>
</div>
```

- 부모가 구독하는 값은 **라벨과 `disabled` 계산**에 쓰입니다. 숫자 표시와 클릭 처리는 자식이 알아서 합니다.
- `tw(S.component, className)`: CSS 모듈 클래스와 밖에서 받은 `className`(`mb-3` 등)을 합칩니다.
- `role="group"`: 위/아래 버튼 두 개가 한 묶음이라는 것을 보조 기술에 알립니다.
- `{useMemo(() => <GrFormUp />, [])}`: 아이콘 JSX를 한 번만 만들어 둡니다. `children`이 매번 새 객체면 `memo`로 감싼 `CountButton`이 매번 다시 그려지기 때문입니다.

> ⚠️ 코드 확인: JSX 안에서 `useMemo`를 직접 부르는 것은 조건문 안이 아니라서 동작은 합니다. 다만 훅이 JSX 속에 숨어 있어서 읽기 어렵습니다. `const upIcon = useMemo(() => <GrFormUp />, []);`처럼 위로 빼 두면 "훅은 컴포넌트 최상단에서" 규칙이 한눈에 보입니다.
>

---

## 4. `CountDisplay.tsx`: 단일 값 구독

```tsx
function CountDisplay() {
  // const { count } = useCountStore();        // ❌ 전체 구독
  const count = useCountStore((s) => s.count); // ✅ selector 구독
  console.log(' counter display ');
  return <output className={S.output}>{count}</output>;
}
export default memo(CountDisplay);
```

- `count`가 바뀔 때만 다시 그려집니다. `step`을 바꿔도 로그가 찍히지 않습니다.
- props가 없으니 `memo`로 감싸면 부모가 다시 그려져도 같이 그려지지 않습니다.

---

## 5. `CountButton.tsx`: 함수를 직접 구독

```tsx
type Props = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  type?: '+' | '-';                  // HTML type 속성을 빼고 '+' | '-'로 다시 정의
};

function CountButton({ children, type = '+', ...restProps }: Props) {
  const handler = useCountStore((s) => (type === '+' ? s.increment : s.decrement));
  return (
    <button type="button" className={S.button} onClick={handler} {...restProps}>
      {children}
    </button>
  );
}
```

- `type` prop으로 어떤 함수를 구독할지 고릅니다. `onUpdate`를 받던 `_` 버전과 달리 부모가 함수를 내려 줄 필요가 없습니다.
- 스토어 함수는 참조가 바뀌지 않으므로 `useCallback`이 필요 없습니다.

---

## 6. `CounterControls.tsx`: 부모·자식이 아닌 곳에서 조작

```tsx
const [step, reset, setStep] = useCountStore(
  useShallow((s) => [s.step, s.reset, s.setStep])
);

<button onClick={reset}>reset</button>
<input type="number" min={1} value={step} onChange={(e) => setStep(Number(e.target.value))} />
```

- 페이지에서 `<Counter>` 두 개와 **형제**로 놓여 있습니다. 그래도 step을 바꾸면 두 카운터의 증감 폭과 라벨이 같이 바뀝니다.
- `value={step}` + `onChange`: 스토어 값을 그대로 보여 주는 **제어 컴포넌트**입니다.

> ⚠️ 코드 확인: 입력을 비우면 `Number('')`가 `0`이 되어 step이 0이 됩니다. `min={1}`은 화살표 버튼에만 적용되고 직접 입력은 막지 못합니다. `setStep(Math.max(1, Number(e.target.value) || 1))`처럼 막아 두면 안전합니다.
>

---

## 7. `style.module.css`: CSS 모듈 + Tailwind `@apply`

```css
@import "tailwindcss/theme.css" layer(theme);   /* Tailwind 테마 값 불러오기 */
@import "@/styles/_theme.css";                  /* 프로젝트 색(accent 등) 불러오기 */

.component { @apply inline-flex items-center border rounded-sm border-solid border-accent; }
.component .output { @apply select-none text-sm font-light text-center text-accent; inline-size: 2rem; }
.component .group  { @apply inline-flex items-center; flex-flow: column; }   /* 버튼 위아래 배치 */
.component .button { @apply select-none text-[#999] text-xs bg-transparent opacity-75 p-0 border-0;
                     block-size: 14px; inline-size: 14px; }
.component .button:hover:not(:disabled) { @apply opacity-100 bg-[#ededed] text-accent; }
```

- `*.module.css`는 **CSS 모듈**입니다. `import S from './style.module.css'` → `S.component`처럼 쓰면 클래스 이름이 파일마다 고유하게 바뀌어서 다른 컴포넌트와 이름이 겹치지 않습니다.
- `@apply`: Tailwind 유틸리티 클래스를 CSS 안에서 한데 모아 씁니다. CSS 모듈 파일은 따로 처리되기 때문에 맨 위에서 테마 파일을 `@import`해야 `border-accent` 같은 커스텀 색을 쓸 수 있습니다.
- `inline-size` / `block-size`: `width` / `height`의 논리 속성 버전입니다(가로쓰기 기준 같은 뜻).
- `:hover:not(:disabled)`: 비활성화된 버튼에는 hover 효과를 주지 않습니다.

---

## 8. ⭐ 리렌더링 확인표 (Zustand 방식)

| 일어난 일 | `index.tsx` | `CountDisplay` | `CountButton` | `CounterControls` |
| --- | --- | --- | --- | --- |
| +/- 클릭 (`count` 변경) | ⭕ | ⭕ | `disabled`가 바뀔 때만 ⭕ | ❌ |
| step 변경 | ⭕ (라벨) | ❌ | ⭕ (`title` 바뀜) | ⭕ |
| reset | 바뀐 값이 있으면 ⭕ | `count`가 바뀌면 ⭕ | props가 바뀌면 ⭕ | `step`이 바뀌면 ⭕ |

- `CountDisplay`의 `console.log`를 켜 두고 step만 바꿔 보면, selector 구독 덕분에 로그가 찍히지 않는 것을 확인할 수 있습니다.
- `CountButton`은 `memo` + 고정된 `children`(useMemo) 덕분에 props가 실제로 바뀔 때만 다시 그려집니다.

---

## 🧷 한 줄 요약: Counter 두 방식 비교

| 비교 | 커스텀 훅 방식 (`_`) | Zustand 방식 |
| --- | --- | --- |
| 상태 위치 | 각 `Counter_` 안 | 모듈의 스토어 하나 |
| 카운터 2개 | 따로 셈 | 같이 셈 |
| 자식에게 데이터 | props (`count`, `onUpdate`) | 자식이 직접 구독 |
| 함수 참조 고정 | `useCallback` | 원래 고정 |
| 여러 값 구독 | 해당 없음 | `useShallow((s) => [...])` |
| 멀리 있는 컴포넌트에서 조작 | lifting state up 필요 | `CounterControls`처럼 바로 가능 |
| 스타일 | `style.module.css` + `tw()` 공통 | 〃 |

---

---

# 📘 Context · CounterReducer · Zustand 차이점 정리

## 0. 한눈에 보기: 세 도구가 맡은 일

**`useReducer`는 상태를 "어떻게 바꿀지" 정하는 도구, Context는 값을 "어떻게 전달할지" 정하는 도구, Zustand는 둘 다 하는 도구입니다.**

| | `useReducer` (CounterReducer) | Context (TaskManager_) | Zustand (Counter · TaskManager) |
| --- | --- | --- | --- |
| 정체 | React 내장 **상태 훅** | React 내장 **전달 통로** | 외부 **상태 관리 라이브러리** |
| 상태를 만드나? | ⭕ | ❌ (상태는 `useState`/`useReducer`가 만듦) | ⭕ |
| 상태를 공유하나? | ❌ (컴포넌트 안에만) | ⭕ (Provider 안쪽 트리) | ⭕ (앱 전체) |
| 예제 파일 | `miniApp/CounterReducer/index.tsx` | `TaskManager/@context.tsx` + `@reducer.ts` | `Counter/@store.ts`, `TaskManager/@store.ts` |

- ⭐ Context는 상태 관리 도구가 아니라 **값을 아래로 전달하는 통로**입니다. 그래서 TaskManager에서도 상태는 `useReducer`가 만들고, Context는 그 값을 자식들에게 나눠 주기만 합니다.
- 그래서 이 단원의 실제 비교는 **① useReducer 혼자 ② Context + useReducer ③ Zustand** 세 단계입니다.

---

## 1. useReducer: `CounterReducer/index.tsx`

**상태 변경 규칙을 reducer 함수 하나에 모읍니다. 상태는 그 컴포넌트 안에만 있습니다.**

```tsx
type Action =
  | { type: 'increment' } | { type: 'decrement' } | { type: 'reset' }
  | { type: 'set'; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: state.count - 1 };
    case 'reset':     return INITIAL;
    case 'set':       return { count: action.payload };
    default:          return state;
  }
}

const [state, dispatch] = useReducer(reducer, INITIAL);
<button onClick={() => dispatch({ type: 'increment' })}>+</button>
```

- 흐름: **이벤트 → `dispatch(action)` → `reducer(state, action)` → 새 state → 리렌더링**
- 장점: 상태가 바뀌는 경우가 `switch` 한 곳에 다 나열되어 있습니다. reducer는 순수 함수라 테스트하기 쉽습니다.
- 한계: `<CounterReducer />`를 두 개 그리면 상태도 두 개입니다. 다른 컴포넌트와 나누려면 props로 내려 주거나 Context가 필요합니다.

---

## 2. Context + useReducer: `TaskManager/@context.tsx`

**useReducer로 만든 상태를 Provider에 실어서, 그 안쪽 어디서든 `useTask()`로 꺼내 씁니다.**

```tsx
const TaskContext = createContext<TaskContextValue>(null);         // ① 통로 만들기

export function TaskProvider(props: React.PropsWithChildren) {
  const [taskList, dispatch] = useReducer(taskReducer, INITIAL_TASKS);   // ② 상태는 reducer가
  const taskMethods = useMemo(() => ({ togglePin: (id) => dispatch(togglePin(id)), /* ... */ }), []);
  const lists = useMemo(() => ({ /* pinned / unpinned 거르기 */ }), [taskList]);
  const contextValue = useMemo(() => ({ ...lists, methods: taskMethods }), [lists, taskMethods]);
  return <TaskContext value={contextValue} {...props} />;           // ③ 값을 실어 보냄
}

export const useTask = () => {                                      // ④ 꺼내 쓰기
  const value = useContext(TaskContext);
  if (!value) throw new Error('useTask 훅은 TaskProvider 내부에서만 사용해야 합니다.');
  return value;
};

// TaskManager_.tsx
<TaskProvider>
  <PinnedTaskList />      {/* const { pinnedTaskList, methods } = useTask(); */}
  <UnpinnedTaskList />
</TaskProvider>
```

- 흐름: **이벤트 → `methods.togglePin(id)` → `dispatch` → reducer → 새 taskList → 새 `contextValue` → 컨텍스트를 쓰는 컴포넌트 모두 리렌더링**
- 장점: 라이브러리 없이 props 내려 주기(prop drilling)를 없앨 수 있습니다.
- 한계 ①: `contextValue`가 바뀌면 그 컨텍스트를 쓰는 컴포넌트가 **전부** 다시 그려집니다. 일부만 골라서 구독할 수 없습니다.
- 한계 ②: 이를 줄이려고 `useMemo`를 세 번이나 써야 하고, 액션 타입 · 액션 생성 함수 · reducer · Provider · 커스텀 훅까지 **준비할 코드가 많습니다**.
- 한계 ③: `<TaskProvider>` **바깥**에서는 쓸 수 없습니다(그래서 `useTask`에서 에러를 던짐).

---

## 3. Zustand: `Counter/@store.ts`, `TaskManager/@store.ts`

**컴포넌트 바깥에 스토어를 만들고, 필요한 컴포넌트가 필요한 값만 골라서 구독합니다.**

```tsx
// Counter/@store.ts
export const useCountStore = create<Store>()((set, _get, store) => ({
  count: 0, step: 1, min: 0, max: 10,
  increment: () => set(({ count, step, max }) => ({ count: Math.min(count + step, max) })),
  reset: () => set(store.getInitialState()),
  // ...
}));

// 컴포넌트 — Provider 없이 바로
const count = useCountStore((s) => s.count);                           // 값 하나
const [step, setStep] = useCountStore(useShallow((s) => [s.step, s.setStep]));   // 여러 개

// TaskManager/@store.ts — persist로 새로고침해도 유지
export const useTaskStore = create<TaskState>()(persist((set) => ({ /* ... */ }), { name: 'task-store' }));
export const usePinnedTasks = () => useTaskStore(useShallow((s) => s.tasks.filter((t) => t.isPin)));
```

- 흐름: **이벤트 → `increment()` → `set(...)` → 스토어 변경 → selector 결과가 바뀐 컴포넌트만 리렌더링**
- 장점 ①: **Provider가 필요 없습니다.** `CounterControls`처럼 부모·자식 관계가 아닌 컴포넌트도 바로 연결됩니다.
- 장점 ②: **selector**로 필요한 값만 구독하므로 리렌더링이 최소화됩니다.
- 장점 ③: 함수가 처음부터 고정되어 `useCallback` / `useMemo`가 필요 없습니다. `persist` 같은 미들웨어로 기능을 쉽게 붙일 수 있습니다.
- 주의: selector가 배열·객체를 **새로 만들어** 반환하면 반드시 `useShallow`로 감싸야 합니다.
- 주의: 스토어가 앱에 하나뿐이라 **모든 사용처가 같은 상태를 봅니다**. 컴포넌트마다 따로 상태를 갖게 하려면 Zustand가 맞지 않습니다.

---

## 4. ⭐ 같은 동작, 세 가지 코드

**"카운트 1 증가"를 각 방식으로 쓰면:**

```tsx
// ① useReducer
const [state, dispatch] = useReducer(reducer, INITIAL);
<button onClick={() => dispatch({ type: 'increment' })}>+</button>

// ② Context + useReducer (TaskManager 패턴을 카운터에 적용하면)
const { methods } = useCounterContext();              // Provider 안에서만
<button onClick={methods.increment}>+</button>

// ③ Zustand
const increment = useCountStore((s) => s.increment);  // 어디서든
<button onClick={increment}>+</button>
```

---

## 5. ⭐ 상세 비교표

| 비교 | useReducer | Context + useReducer | Zustand |
| --- | --- | --- | --- |
| 상태 위치 | 컴포넌트 안 | Provider 컴포넌트 안 | 컴포넌트 **밖** (모듈) |
| 공유 범위 | 없음 | `<Provider>` 안쪽 트리 | 앱 전체 |
| 같은 컴포넌트 2개 | 따로 | Provider가 다르면 따로, 같으면 공유 | 항상 공유 |
| 감싸기 | 필요 없음 | `<TaskProvider>` 필요 | 필요 없음 |
| 상태 변경 | `dispatch({ type, payload })` | `methods.xxx()` → `dispatch` | 스토어 함수 → `set()` |
| 변경 로직 위치 | `reducer`의 `switch` | `reducer`의 `switch` | `create()` 안의 각 함수 |
| 꺼내 쓰기 | `state.count` | `useTask()` (전부 받음) | `useStore((s) => s.x)` (골라 받음) |
| 리렌더링 | 그 컴포넌트 | 컨텍스트 값이 바뀌면 **사용처 전부** | **selector 결과가 바뀐 곳만** |
| 최적화 도구 | `memo` | `useMemo` ×3 + `memo` | selector + `useShallow` |
| 함수 참조 | `dispatch`는 고정 | `useMemo`로 직접 고정 | 처음부터 고정 |
| 새로고침 | 초기화 | 초기화 | `persist`로 유지 가능 |
| 준비 코드 | 적음 | **많음** (types · reducer · context · hook) | 적음 (store 한 파일) |
| 설치 | 내장 | 내장 | `npm i zustand` |
| 디버깅 | 액션 로그로 흐름 추적 쉬움 | 〃 | 함수 호출 추적 (devtools 미들웨어 가능) |

---

## 6. 이 프로젝트에서 직접 확인하기

| 확인할 것 | 방법 | 결과 |
| --- | --- | --- |
| useReducer는 공유 안 됨 | Counter 페이지의 CounterReducer를 하나 더 그려 보기 | 서로 따로 셈 |
| Zustand는 공유됨 | Counter 페이지 Zustand 카운터 두 개의 +를 누르기 | 둘 다 같이 바뀜 |
| Context는 전부 리렌더링 | Tasks 페이지 Context 버전에서 체크박스 클릭 + 콘솔 확인 | 두 목록 로그 모두 찍힘 |
| Zustand는 골라서 리렌더링 | Zustand 버전에서 Unpinned 항목 체크 + 콘솔 확인 | Unpinned 로그만 찍힘 |
| persist | Zustand 할 일을 고정한 뒤 새로고침 | Zustand 쪽만 유지됨 |

> ⚠️ 코드 확인: 콘솔로 비교하려면 먼저 로그 문구를 고쳐야 합니다. Zustand 버전은 Pinned·Unpinned가 둘 다 `'[zustand] unpinned 렌더'`이고, Context 버전은 둘 다 `'Pinned render'`라서 지금은 어느 목록의 로그인지 구분할 수 없습니다.
>

---

## 🧷 한 줄 요약: 상태 관리 도구 고르기

| 상황 | 도구 |
| --- | --- |
| 한 컴포넌트 안, 값 하나 | `useState` |
| 한 컴포넌트 안, 변경 종류가 많고 복잡함 | `useReducer` |
| 몇 단계 아래로만 전달, 자주 안 바뀌는 값 (테마 · 로그인 정보 · 언어) | Context |
| 하위 트리에서 공유, 라이브러리 없이 | Context + `useReducer` |
| 여러 곳에서 공유, 자주 바뀜, 리렌더링 최소화 | Zustand + selector |
| 새로고침해도 유지 | Zustand `persist` |
| 기억할 것 | **reducer = 바꾸는 규칙 / Context = 전달 통로 / Zustand = 규칙 + 저장소 + 골라 구독** |
