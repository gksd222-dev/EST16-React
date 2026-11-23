import { useState } from "react"




function Form() {
  const [text, setText] = useState('');

  // 폼 상태를 React에 의해 제어/통제 => value + onChange (controlled)
  // 간단한 초기 입력값만 필요할 때, 외부 상태와 무관한 정보를 입력 => 'defaultValue' (uncontrolled)
  
  // 폼 리셋, 검증, 자동완성 => 'value'권장됨 (훨씬 제어가 쉬움)


  return (
    <div>
      <h2>Controlled Input</h2>
      <input 
        type="text"
        aria-label="제어 입력"
        value={text}
        onChange={(e)=>setText(e.target.value)}
      />
      <p>입력 값 : {text}</p>

      <hr />

      <h2>Uncontrolled Input</h2>
      <input 
        type="text"
        aria-label="비제어 입력"
        defaultValue={'처음 한번만 반영됨'}
        onChange={(e)=> console.log(e.target.value)}
      />
      <p>입력 값 : {text}</p>
      <hr />

    </div>
  )
}
export default Form