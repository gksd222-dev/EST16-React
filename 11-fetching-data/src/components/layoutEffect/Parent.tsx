import { useEffect, useLayoutEffect, useRef, useState } from "react";

/*

컴포넌트 실행(렌더링)
↓
DOM 업데이트
↓
화면 그리기
↓
useEffect 실행

*/
// 레이아웃에 관련된 작업을 미리 수행해야 할 때
// 툴팁 & 팝오버 위치 계산
// 아코디언 & 애니메이션 크기 측정
// 스크롤 위치 조정
// 탭 인디케이터 위치 조정

function Parent() {
  
  const boxRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  console.log('🐴 컴포넌트 실행 영역');
  
  useLayoutEffect(()=>{
    console.log('🐱 useLayoutEffect 실행 영역');
    if(boxRef.current){
      const h = boxRef.current?.getBoundingClientRect().height;
      setHeight(h);
    }
  },[])



  useEffect(()=>{
    console.log('🐺 useEffect 실행 영역');

    // div가 가지고 있는 높이 값


  })
  
  
  return (
    <div>
      <div
        ref={boxRef}
        style={{
          background:'#00000',
          padding:'20px',
          fontSize:'24px'
        }}
      >
        이 박스의 높이 : {height}px
      </div>
    </div>
  )
}
export default Parent