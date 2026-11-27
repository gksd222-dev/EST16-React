import { NavLink } from "react-router"
import { IoLogoReact } from 'react-icons/io5';

function Header() {
  return (
    <header className="flex justify-center py-3 bg-white border-b border-b-indigo-500/10">
      <NavLink 
        to='/'
        className="flex items-center gap-2 px-3 py-1 rounded-full"
        >
          <IoLogoReact className="text-indigo-800 w-7 h-7 hover:animate-spin" />
          <span className="text-indigo-800 text-sm select-none">
            고급 상태 관리
          </span>
        </NavLink>
      
    </header>
  )
}
export default Header