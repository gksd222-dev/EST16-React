import { useReducer } from "react"

type State = {count:number};

const INITIAL:State = {count:0};

type Action = 
  | { type:'increment' }
  | { type:'decrement' }
  | { type:'reset' }
  | { type:'set'; payload:number }

function reducer(state:State, action:Action): State{
  switch(action.type){
    case 'increment':
      return { count: state.count + 1 }
    case 'decrement':
      return { count: state.count - 1 }
    case 'reset':
      return INITIAL
    case 'set':
      return { count: action.payload }
    default:
      return state
  }
}

export default function CounterReducer(){

  const [state, dispatch] = useReducer(reducer,INITIAL);

  const setTo = 10;
  
  return (
    <div>
      <p>count: {state.count}</p>
       <button className="px-2 py-1 border border-accent m-1 rounded" onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button className="px-2 py-1 border border-accent m-1 rounded" onClick={() => dispatch({ type: "increment" })}>+</button>
      <button className="px-2 py-1 border border-accent m-1 rounded" onClick={() => dispatch({ type: "reset" })}>reset</button>
      <button className="px-2 py-1 border border-accent m-1 rounded" onClick={() => dispatch({ type: "set", payload:setTo })}>{setTo}으로</button>
    </div>
  )
}