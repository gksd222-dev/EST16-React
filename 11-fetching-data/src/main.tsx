import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/main.css';
import Parent from './components/layoutEffect/Parent';
//import Parent from './components/effectAndRef/Parent';
//import UserList from './components/effect/Effect';
// import Parent from './components/ref/Parent';


const container = document.getElementById('react-app');

if (container) {
  createRoot(container).render(
    <StrictMode>
      {/* <main>main</main> */}
      
      {/* <UserList /> */}
      
      <Parent />

    </StrictMode>
  );
} else {
  console.warn('문서에 "#app" 요소가 존재하지 않습니다.');
}
