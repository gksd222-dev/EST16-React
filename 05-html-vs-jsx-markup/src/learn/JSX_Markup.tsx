import * as learnData from '@/data/learn';
import type { JSX } from "react/jsx-runtime"
import DataBinding from './DataBinding';



function JSX_Markup():JSX.Element {

  const {
    statusMessage,
  } = learnData;
  
  


  return (
    <dl className="descriptionList">
      <DataBinding statusMessages={statusMessage}/>
    </dl>
  )
}
export default JSX_Markup