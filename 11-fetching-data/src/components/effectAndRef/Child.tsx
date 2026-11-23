import { memo } from "react";


interface Props {
  message:string;
}


function Child({ message }:Props) {
  return (
    <p>{message}</p>
  )
}
export default memo(Child)
















