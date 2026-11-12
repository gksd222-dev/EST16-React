import { Fragment } from "react/jsx-runtime";


interface Props {
  items: StatusMessageObject[];
  reactLibrary: ReactLibrary
}


function RenderList({ items, reactLibrary }:Props) {


  const demoList = items.map((item)=>
    <li key={item.id}>{item.message}</li>
  )
  
  const renderDemoList = () => 
  items.map((item)=> 
  <li key={item.id}>{item.message}</li> )

  

  const renderDefinitionList = (data:ReactLibrary) => {
    const definitionItem = Object.entries(data).map(([key, value])=>
          <Fragment key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </Fragment>
        )
    return definitionItem
  }
  

  return (
    <>
      <dt>리스트 랜더링 (list rendering)</dt>
      <dd>
        <ul>
          { items && demoList }
        </ul>
        <hr />
        <ul>
          { items && renderDemoList()}
        </ul>
      </dd>
      <dd>
        <p>상태 메시지 (status message) 배열을 역순 정렬하여 랜더링합니다.</p>
        <ul>
          {
            items.toReversed().map((item)=>
              <li key={item.id}>{item.message}</li>
            )
          }
        </ul>
      </dd>
      <dd>
        <p>React 라이브러리(reactLibrary) 객체의 키, 값을 <q>설명 목록</q>으로 랜더링합니다.</p>
        <dl>
          {renderDefinitionList(reactLibrary)}
        </dl>
      </dd>
    </>
  )
}
export default RenderList