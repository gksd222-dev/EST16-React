import { createRoot } from "react-dom/client";
import Headline from "./components/Headline";
import { StrictMode } from "react";

// 리액트의 컴포넌트는 순수해야합니다. (순수함수)
// 순수 함수는 => 동일입력 -> 동일출력 원칙
// f(1) //1
// f(2) //1

// 함수가 순수한지 불순한지 확인할 수 있는 방법? 함수를 2번 실행

const container = document.getElementById('root');

if(!container) throw new Error('문서에 #root 요소가 존재하지 않습니다.');

createRoot(container).render(
  <StrictMode>
    <Headline />
  </StrictMode>
)
















