import { useState } from "react"


//스냅샷 이론
//리액트의 스냅샷은 사진을 찍는 것과 같다.
//랜더링 순간에 State가 변경될 때 그 지점을 사진으로 찰칵 찍는 행위입니다.
//사진을 찍고 나서 실제 값이 변경되더라도 이미 찍힌 사진 속 값은 바뀌지 않는다.
//state를 변경하면 기존 스냅샷을 수정하는 게 아니라, 다음 렌더링에서 새로운 스냅샷을 만들어 냅니다.

// 이러한 개념을 공식문서에서는 State as a Snapshot 이라 한다.


// useState의 초기값은 언제 계산될까?
// 몇번 실행되는 걸까?

function slowInit(){
  console.log('초기값 계산중. . . ');
  let sum = 0;
  for(let i = 0; i < 1000; i++){
    sum += i;
  }
  return sum;
}

function Counter() {

  //지연 초기화 (lazy initialization)
  const [number,setNumber] = useState(slowInit);

  // useState(()=> getNoteList())
  //함수자체를 실행하거나 콜백을 활용하면 최초에 한번만 실행된다.

  const handleClick = () => {

    setNumber(number + 5);
    // setNumber(50);
    //setNumber(number + 5);
    // setNumber((n)=> n + 5);
    // setNumber((n)=> n + 5);        
    // alert(number);
  }

  return (
    <>
      <button type="button" onClick={()=> setNumber(number - 5)}>감소</button>
      <h1>{number}</h1>
      <button type="button" onClick={handleClick}>증가</button>
    
    </>
  )
}
export default Counter