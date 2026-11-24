import { RouterContext } from "@/router/RouterProvider";
import { useContext } from "react";
import S from './Layout/Header.module.css';

interface Props{
  to:string;
  children: React.ReactNode,
  className?:string;
  activeClassName?:string;
}

function NavLink({to, children, activeClassName = S.active, className}:Props) {

  const { currentPath, setHistoryRoute } = useContext(RouterContext)!;

  const isActive = currentPath === to;
  
  const classNames = `${isActive ? activeClassName : ''} ${className}`.trim();

  const handleLink = (e:React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setHistoryRoute(to);
    history.pushState(null,'',to); // SPA의 핵심 
  }

  return (
    <a href={to} className={classNames} onClick={handleLink}>{children}</a>
  )
}

export default NavLink