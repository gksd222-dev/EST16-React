import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import Form from "./programming/declarative.tsx";

// 이름이 같은 파일이 있을 경우에는 확장자를 붙여줘서 구분을 해야한다.

const root = document.getElementById('root')!

if(root){
  createRoot(root).render(
    <StrictMode>
      <Form></Form>
    </StrictMode>
  )
}


































