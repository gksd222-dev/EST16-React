import { memo } from "react";


type Props = {
  value: number;
  onClick: (value:number)=> void;
}


function ListItem({value, onClick}:Props) {
  
  console.log('List Item Component 렌더링');

  return (
    <li>
      <button type="button" onClick={()=> onClick(value)}>{value}</button>
    </li>
  )
}
export default memo(ListItem)