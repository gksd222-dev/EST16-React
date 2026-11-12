import type { Dispatch, SetStateAction } from "react";



type Props = {
  onPrintMessage: (add:string) => void;
  message:string;
  text:string;
  setText:Dispatch<SetStateAction<string>>

}

function EventHandleProp({onPrintMessage, message,text, setText }:Props) {


  const handleMouseEnter = () => {
    // console.log('enter');
    // onPrintMessage('hello');
    setText('안쪽 컴포넌트에서 setText를 호출했습니다.')

  }

  const handleMouseLeave = () => {
    // console.log('leave');
  }

  return (
    <details>
      <summary onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <b>이벤트 핸들러 추가하기</b>
      </summary>
      <p>
        이벤트 핸들러 추가를 위해서는 먼저 함수를 정의하고 <br />
        적절한 JSX요소에 prop으로 전달해야 합니다.
        <output>결과 : {message}</output>
      </p>
    </details>
  )
}
export default EventHandleProp