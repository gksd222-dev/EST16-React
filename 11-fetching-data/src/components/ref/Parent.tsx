import { useRef } from "react";
import Child from "./Child";

// useRef = 리액트 방식으로 DOM 요소를 선언형으로 선택하는 방법

// 가상돔이기 때문에 React가 커밋 단계를 거칠 때 current 실제 DOM을 넣어주는 자리

function Parent() {

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    // const input = document.querySelector('input');
    // input?.focus();

    if(inputRef.current){
      inputRef.current.focus()
    }
    
  }

  return (
    <>
      <input type="text" placeholder="아이디를 입력하세요"/>
      <Child
       ref={inputRef} 
       placeholder="아이디를 입력하세요"
      />
      <button type="button" onClick={handleFocus}>인풋에 포커스</button>
    </>
  )
}
export default Parent




