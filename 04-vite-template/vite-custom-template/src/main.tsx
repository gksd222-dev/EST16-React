import { createRoot } from "react-dom/client";
import { AvatarPage } from "./pages/AvatarPage";


console.log( import.meta.env.VITE_USER_NAME );


const container = document.getElementById('root');


if(container){
  createRoot(container).render(
    <AvatarPage />
  )
}else{
  console.warn('문서에 root 요소가 존재하지 않습니다.');
}
















