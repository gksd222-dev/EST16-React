import type { Ref } from "react";

interface Props {
  placeholder: string;
  ref?:Ref<HTMLInputElement>
}

// react 19 + 

function Child({placeholder, ref}:Props) {
  return (
    <input
     ref={ref} 
     placeholder={placeholder} 
     type="text" 
    />
  )
}
export default Child

 





