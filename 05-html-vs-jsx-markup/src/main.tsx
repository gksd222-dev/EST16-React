import '@/styles/global.css';
import { createRoot } from 'react-dom/client'
//import Practice from './practice';
import Learn from './learn';

createRoot(document.getElementById('root')!).render(
  <Learn />
  //<Practice />
)
