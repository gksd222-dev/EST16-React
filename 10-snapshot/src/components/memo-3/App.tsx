import { useCallback, useMemo, useState } from "react"
import List from "./List";


function App() {

  const [count, setCount] = useState(0);

  const items = useMemo(()=>{
    return Array.from({length:5}, (_,i) => i + count)
  },[count])

  const handleItemClick = useCallback((value:number) => {
    console.log('클릭한 값', value)
  },[])

  return (
    <div>
      <h1>Count:{count}</h1>
      <button type="button" onClick={()=> setCount((c)=> c + 1)}> + 1</button>
      <List items={items} onItemClick={handleItemClick}/>
    </div>
  )

}
export default App