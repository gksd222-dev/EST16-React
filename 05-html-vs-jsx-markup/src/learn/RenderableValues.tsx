const items = [];

function RenderableValues() {
  return (
    <>
      <dt>1️⃣ JSX가 랜더링하는 값 / 랜더링하지 않는 값</dt>
      <dd className="renderableValue">
        <p>문자열과 숫자는 그대로 화면에 랜더링됩니다. (0, NaN도 숫자입니다.)</p>
        <ul>
          <li>{'react'}</li>
          <li>{19}</li>
          <li>{0}</li>
          <li>{NaN}</li>
        </ul>
      </dd>
      <dd>
        <p>2️⃣ null, undefined, true, false, 빈 문자열('')은 아무것도 랜더링하지 않습니다.</p>
        <ul>
          <li> null → {null} </li>
          <li> undefined → {undefined} </li>
          <li> true → {true} </li>
          <li> false → {false} </li>
          <li> '' → {''} </li>
          <li> ' ' → {' '} </li>
        </ul>
        <p> &&, 삼항 연산자의 결과로 false 나 null을 반환하면 '화면에 아무것도 안그리기' </p>
      </dd>
      <dd>
        <p>3️⃣ 배열은 요소를 이어 붙여 랜더링하지만, 객체는 랜더링할 수 없습니다.</p>
        <ul>
          <li>배열 → {['A','B','C']}</li>
          {/* <li>객체 → {{name:'tiger'}}</li> */}
          <li>객체 → {JSON.stringify({name:'tiger'})}</li>
        </ul>
      </dd>
      <dd>
        <p>4️⃣ && 왼쪽이 숫자 0 이면 false가 아니라 0이 반환됨, 그래서 화면에 0이 찍힙니다.</p>
        <ul>
          <li>{
            items.length > 0 ? (
             <ul>
              <li key={items.id}>{items.message}</li>
             </ul> 
            ) : (<div>empty</div>)
            }</li>
        </ul>
      </dd>
    </>
  )
}
export default RenderableValues