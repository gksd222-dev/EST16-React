import { routes } from '@/router/router';
import S from './Header.module.css';
import NavLink from '../NavLink';
import { useAuth } from '../auth/AuthProvider';
import { useEffect, useState } from 'react';
import { getAvatarUrl } from '@/api/getAvatarUrl';

function Header() {
  // routes
  const { user, isAuth, logout } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string|null>(null);
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);

  const hideWhenLoggedIn = ['로그인', '회원가입'];
  const alwayHidden = ['상품상세','상품등록'];

  const visibleRoutes = routes.filter(
    ({title})=> 
      !alwayHidden.includes(title) && 
      !(isAuth && hideWhenLoggedIn.includes(title))
  )

  useEffect(()=>{
    let ignore = false;

    const fetchAvatarUrl = async () => {
      if(user){
        const avatarUrl = await getAvatarUrl(user.id);
        if(ignore) return;
        setAvatarUrl(avatarUrl)
        setIsAvatarLoaded(true);
      }else{
        setAvatarUrl(null)
        setIsAvatarLoaded(false);
      }
    }
    fetchAvatarUrl();

    return ()=> {
      ignore = true;
    }

  },[user])
  return (
    <header className={S.header}>
      <h1><img width={100} src="/logo-white.png" alt="" /></h1>
      <nav>
        <h2 className="a11y-hidden">메인 메뉴</h2>
        {user && <p className={S.greeting}>{user.nickname}님 반갑습니다 😄</p>}
        <ul>
          {
            visibleRoutes.map(({path, title})=>(
              <li key={path}>
                <NavLink
                to={path}
                >{title}</NavLink>
              </li>
            ))
          }
          {
            isAuth && (
              <li>
                {
                  isAvatarLoaded && (
                    <img
                      style={{
                        width:'30px',
                        position:'absolute',
                        right:'1px',
                        top:'1px'
                      }}
                      src={avatarUrl ?? '/vite.svg'}
                      alt="" 
                    />
                  )
                }
                <a href="#"
                  onClick={(e)=>{
                    e.preventDefault();
                    if(confirm('너... 진짜 떠날꺼야? 넌 예쁘지 않아 죄를 지었어')){
                      logout()
                    }
                  }}
                >
                  로그아웃
                </a>
              </li>
            )
          }
        </ul>
      </nav>
    </header>
  )
}
export default Header