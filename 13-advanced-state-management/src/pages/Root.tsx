import Footer from "@/components/Footer"
import GlobalNav from "@/components/GlobalNav"
import Header from "@/components/Header"
import Spinner from "@/components/Spinner"
import { Outlet, useNavigation } from "react-router"

function Root() {

  const navigation = useNavigation();

  const isLoading = navigation.state === 'loading';
  
  return (
    <div className="h-screen bg-indigo-50/30 flex flex-col">
      <Header />
      <GlobalNav />
      <main className="flex-1 m-4">
        {
          isLoading ? ( <Spinner /> ) : ( <Outlet></Outlet> )
        }
      </main>
      <Footer />
    </div>
  )
}
export default Root