import { memo } from "react";


interface Props {
  item: string[];
}



function Child({item}:Props) {
  
  console.log('자식 컴포넌트 리렌더링!')

  return (
    <ul>
      {
        item.map((data,index)=>
          <li key={index}>{data}</li>
        )
      }
    </ul>
  )
}
export default memo(Child)



