import type { CSSProperties } from "react"





function JSXAttributes() {

  
  const boxStyle:CSSProperties = {
    width: 200, // 200px
    padding: 8, // 8px
    borderRadius: 4,
    backgroundColor: '#d9e6fc',
    lineHeight: 1.5 // 150%
  }



  return (
    <>
      <dt>HTML vs JSX 속성(attribute)의 차이</dt>
      <dd>
        <p>
          1️⃣ JavaScript 예약어와 겹치는 속성은 이름이 바뀝니다.
        </p>
        <div>
          <label htmlFor="jsx-name" className="status"></label>
          <input type="text" id="jsx-name"/>
        </div>
      </dd>
      <dd>
        <p>
          2️⃣ 여러 단어로 된 속성은 camelCase로 작성합니다.
        </p>
        <div>
          {/* <input tabindex="0" maxlength="10" readonly value="읽기 전용"> */}
          <input type="text" aria-label="입력 창" tabIndex={0} maxLength={10} readOnly value="읽기 전용"/>
        </div>
      </dd>
      <dd>
        <p>
          3️⃣ 예외로 aria-*, data-* 속성은 HTML과 똑같이 kebab-case 방식을 그대로 사용합니다.
        </p>
        <div>
          <span role="status" aria-live="polite" data-state="success" data-name="안내창" >✅ 로딩 성공</span>
        </div>
      </dd>
      <dd>
        <p>
          4️⃣ style 속성에는 문자열이 아닌 객체를 전달합니다. (그래서 중괄호가 두 겹)
        </p>
        <div>
          <div style={boxStyle}>변수에 담은 스타일 객체</div>
          <p style={{color:'dodgerblue', fontWeight:800}}>인라인 방식으로 작성한 스타일 객체</p>
        </div>
      </dd>
      <dd>
        <p>
          5️⃣ 내용이 없는 요소도 반드시 닫아야 합니다.( self closing tag )
        </p>
        <div>
          <img src="/favicon.svg" alt="" />
          <hr />
          <input type="text" placeholder="닫는 슬래시는 필수입니다." />
        </div>
      </dd>
      <dd>
        {/* 주석입니다. */}
        <p>6️⃣ boolean 속성은 값을 생략하면 true이고, false를 전달하면 속성 자체가 빠집니다.</p>
        <div>
          <button type="button" disabled>BUTTON</button>
          <hr />
          <button type="button" disabled={false}>BUTTON</button>
          <hr />
          <p hidden={false}>보이는 문단{' '}</p>
          <p hidden={false}>안 보이는 문단</p>
        </div>
      </dd>
  
    </>
  )
}
export default JSXAttributes