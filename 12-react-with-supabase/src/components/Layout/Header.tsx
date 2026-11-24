import { routes } from "@/router/router";
import S from "./Header.module.css";
import NavLink from "../NavLink";

function Header() {

  //routes



  return (
    <header className={S.header}>
      <h1><img width={100} src="/logo-white.png" alt="" /></h1>
      <nav>
        <h2 className="a11y-hidden">메인 메뉴</h2>
        <ul>
          {
            routes.map(({path, title})=>(
              <li key={path}>
                <NavLink 
                to={path} 
                className='logo'
                activeClassName='on'>{title}</NavLink>
              </li>
            ))
          }
        </ul>
      </nav>
    </header>
  )
}
export default Header