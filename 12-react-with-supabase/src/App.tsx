import Footer from "./components/Layout/Footer"
import Header from "./components/Layout/Header"
import { routes } from "./router/router"
import RouterProvider from "./router/RouterProvider"
import S from "./App.module.css";
import { AuthProvider } from "./components/auth/AuthProvider";

function App() {
  


  return (
    <div className={S.app}>
      <AuthProvider>
        <RouterProvider navigation={<Header/>} routes={routes} />
        <Footer></Footer>
      </AuthProvider>
    </div>
  )
}
export default App