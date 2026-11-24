import Footer from "./components/Layout/Footer"
import Header from "./components/Layout/Header"
import { routes } from "./router/router"
import RouterProvider from "./router/RouterProvider"
import S from "./App.module.css";

function App() {
  


  return (
    <div className={S.app}>
      <RouterProvider navigation={<Header/>} routes={routes} />
      <Footer></Footer>
    </div>
  )
}
export default App