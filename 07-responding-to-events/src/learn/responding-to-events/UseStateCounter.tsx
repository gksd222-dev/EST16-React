import { useState } from "react";


function UseStateCounter() {

  //리액트는 변수의 값이 바뀌어도 리랜더링하지 않습니다.
  // 설령 리렌더링이 된다 하더라도 변수는 0으로 초기화됩니다.
  
  let localCount = 0;

  // useState는 컴포넌트 내부에서 변수의 값을 기억하기 위해 (클로저)
  // useState에서 나온 set ... 함수는 컴포넌트를 리렌더링 시키는 renderTrigger를 내장하고 있습니다.
  // useState에서 지정한 변수는 컴포넌트 내부에 저장되지 않는다. (fiber 엔진 저장소)
  const [count, setCount] = useState(0);

  const handleLocalIncrement = () => {
    localCount += 1;
    console.log(localCount);

  }

  // React의 상태는 업데이트가 일어날 때 즉시 반영되지 않습니다. 
  // 여러 업데이트를 모아서 처리(batching)할 수 있는 방법이 있음
  // 기존 변수의 상태값을 이전 값을 받아 업데이트하고싶다? => useState callback
  // 간단한 값을 업데이트 input.value => setValue(input.value)

  const handleIncrement = () => {
    // 이전 상태를 기반으로 계산함
    // setCount((prev)=> {
    //   console.log( prev );
    //   return prev + 1;
    // });

    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
  
  }

  const handleDecrement = () => {
    setCount(count - 1);
  
  }
  const handleReset = () => {
    setCount(0);
  }

  return (
    <details open>
      <summary>
        <b>useState: 컴포넌트의 기억</b>
      </summary>
      <p>상태(state)는 렌더링 사이에 값을 기억하고, 값이 바뀌면 화면을 다시 그립니다.</p>
      <div>
        <button type="button" onClick={handleLocalIncrement}>지역 변수 + 1</button>
        {' '}
        <output> { localCount } </output>
        <span> - 출력결과</span>
      </div>
      <hr />
      <div>
        <button type="button" onClick={handleIncrement}>상태 변수 + 1</button>
        {' '}
        <output>{ count }</output>
        <span> - 출력결과</span>
      </div>
      <hr />
      <div>
        <button type="button" onClick={handleDecrement}>상태 변수 - 1</button>
        {' '}
        <output>{ count }</output>
        <span> - 출력결과</span>
      </div>
      <hr />
      <div>
        <button type="button" onClick={handleReset}> 초기화 </button>
        {' '}
        <output>{ count }</output>
        <span> - 출력결과</span>
      </div>
    </details>
  );
}
export default UseStateCounter

