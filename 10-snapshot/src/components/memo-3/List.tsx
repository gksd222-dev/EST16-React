import { memo } from "react";
import ListItem from "./ListItem";

type Props = {
  items: number[];
  onItemClick: (value:number) => void;
}


function List({items, onItemClick}:Props) {
  
  console.log('List Component 렌더링');
  
  return (
    <ul>
      {
        items.map((item)=>
          <ListItem key={item} value={item} onClick={onItemClick}/>
        )
      }
    </ul>
  )
}
export default memo(List)