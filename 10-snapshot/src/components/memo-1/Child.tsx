import { memo } from "react";

interface Props{
  label:string;
  onClick: () => void;
}


function Child({label, onClick}:Props) {
  
  console.log(`나는 자식 컴포넌트야! ${label}`)
  
  return (
    <>
      <p>{label}</p>
      <button type="button" onClick={onClick}> 자식 요소가 누르는 버튼</button>

    </>
  )
}
export default memo(Child)













