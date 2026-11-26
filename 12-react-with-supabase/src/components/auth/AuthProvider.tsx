import supabase from "@/supabase/supabase";
import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id:string;
  email:string;
  nickname:string;
}

interface AuthContextType {
  user: User | null;
  isAuth: boolean;
  logout:()=>void;
}


const AuthContext = createContext<AuthContextType|null>(null);

export function AuthProvider({children}:{children:React.ReactNode}){

  const [user, setUser] = useState<User | null>(null);


  useEffect(()=>{
    supabase.auth.getUser().then(({data:{user}})=>{
      
      if(user){
        setUser({ 
          id: user.id, 
          email: user.email!,
          nickname:user.user_metadata.nickname ?? user.email!.split('@')[0],
        })
      }
    })


    const {data} = supabase.auth.onAuthStateChange((event, session)=>{

      if(event === 'SIGNED_IN' && session?.user){
        setUser({ 
          id: session.user.id, 
          email: session.user.email!,
          nickname:session.user.user_metadata.nickname ?? session.user.email!.split('@')[0],
        })
      }
      else if(event === 'SIGNED_OUT'){
        setUser(null);
      }
      
    })


    return () => data.subscription.unsubscribe();


  },[])


  // 로그아웃 함수 만들기,
  // signOut넣기 -> 실행 setUser 비워주기
  // value에 담아서 내보내기


  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  }


  return (
    <AuthContext value={{user, isAuth:!!user, logout}}>
      {children}
    </AuthContext>
  )
}


// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(){
  const ctx = useContext(AuthContext);
  if(!ctx) throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다.');
  return ctx;
}