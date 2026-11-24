import { useState } from "react"
import Parent from "./Parent";
import { UserContext } from "./UserContext";
import { ThemeProvider } from "./ThemeContext";



function App() {

  const [username, setUsername] = useState('안경찬');

  console.log( UserContext );


  return (
    <ThemeProvider>
      <UserContext value={{username, setUsername}}>
        <div style={{border:'1px solid gray', padding:'10px'}}>
          <h1>버튼을 클릭하면 사용자가 변경됩니다!</h1>
          <Parent />
          <button
          type="button" 
          onClick={()=> setUsername('신재훈')}
          >사용자 변경</button>
        </div>
      </UserContext>
    </ThemeProvider>
  )
}
export default App