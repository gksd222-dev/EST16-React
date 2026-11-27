import Divider from "@/components/Divider";
import useCounter from "@/hook/useCounter";
import Counter from "@/miniApp/Counter";
import { useCountStore } from "@/miniApp/Counter/@store";
import CountDisplay_ from "@/miniApp/Counter/CountDisplay_";
import CounterControls from "@/miniApp/Counter/CounterControls";
import Counter_ from "@/miniApp/Counter/index_";
import S from '@/miniApp/Counter/style.module.css';
import CounterReducer from "@/miniApp/CounterReducer";

function CounterPage() {

  // const {count, increment, reset} = useCounter();

  // 전체 구독 방식
  // const { count, increment } = useCountStore();

  //selector 방식 (선택적 구독 방식)
  // 스토어에 필요한 상태와 함수만 선택적으로 구독하는 방식
  
  // 스토어의 다른 상태가 변경되어도 선택한 값이 
  // 변경되지 않으면 해당 변경으로 인한 리렌더링은 발생하지 않는다.
  // const count = useCountStore((s)=> s.count);
  // const increment = useCountStore((s)=> s.increment);

  return (
    <>
      {/* <p>
        스토어 카운트 : {count}
        <button onClick={increment}>[+1]</button>
      </p> */}
      <title>카운터</title>

      <section id="page">
        <div className="learn">
          <h1>카운터</h1>
          <p>같은 카운터를 커스텀 훅 · useReducer · Zustand로 만들어 비교합니다.</p>

          <Divider />

          <h2 lang="en" className="uppercase">Counter</h2>
          <p>간단한 카운터 앱의 상태를 CustomHook을 사용해 관리합니다.</p>

          <Counter_ className="mb-3"/>
          <Counter_ />

          {/* lifting state up */}
          {/* <div className="flex gap-2 items-center mt-4">
            <div className={S.component}><CountDisplay_ count={count} /></div>
            <div className={S.component}><CountDisplay_ count={count} /></div>
            <button type="button" onClick={increment} className="px-3 py-1 border border-accent rounded-xs">+1</button>
            <button type="button" onClick={reset} className="px-3 py-1 border border-accent rounded-xs">reset</button>
          </div> */}

          <Divider />
          <h2 lang="en" className="uppercase">Counter Reducer</h2>
          <p>카운터의 상태를 useReducer를 사용해 관리합니다.</p>
          <CounterReducer />

          <Divider />
          <h2 lang="en" className="uppercase">Counter</h2>
          <p>카운터의 상태를 Zustand를 사용해 관리합니다.</p>
          <Counter className="mb-3" />
          <Counter className="mb-3" />
          <CounterControls />

        </div>
      </section>
    </>
  );
}

export default CounterPage;