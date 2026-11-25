import { useContext, useId, useState } from 'react';
import S from './Login.module.css';
import supabase from '@/supabase/supabase';
import Swal from 'sweetalert2';
import { RouterContext } from '@/router/RouterProvider';


function Login() {
  const userId = useId();
  const pwId = useId();
  
  // 1. 상태 설정하기
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ error, setError ] = useState<string|null>(null);
  const {setHistoryRoute} = useContext(RouterContext)!;

  // 2. 이벤트 바인딩하기 onChange, onSubmit
  const handleLogin = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // 3. supabase 통신하기 
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if(error){
      console.log(error);
      setError(error.message);
    }else{
      Swal.fire({
        icon:'success',
        title:'로그인 성공!',
        text: "확인을 누르면 메인 페이지로 이동합니다.",
        showConfirmButton:true,
        iconColor:'#FD98AF',
        confirmButtonColor:'#FD98AF',
      }).then(() => {
          history.pushState(null,'','/');
          setHistoryRoute('/')
      });
    }

  }

  
  // 4. redirect 하기 


  return (
    <div className={S.container}>
      <div>
        <form onSubmit={handleLogin}>
          <h2>로그인</h2>
          <hr />
          <div>
            <label htmlFor={userId}>이메일:</label>
            <input 
              id={userId}
              type="email" 
              name="email"
              required
              aria-required="true"
              value={email}
              onChange={(e)=> setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={pwId}>비밀번호:</label>
            <input 
              id={pwId}
              type="password" 
              name="password"
              required
              aria-required="true"
              value={password}
              onChange={(e)=> setPassword(e.target.value)}
            />
          </div>
          {error && <p style={{color:'red'}}>{error}</p>}
          <button type="submit">로그인</button>
          <hr />
          <a href="" onClick={(e)=>{
            e.preventDefault();
            history.pushState(null,'','/Register');
            setHistoryRoute('/Register') // 이걸 안 하면 뒤로가기가 안됨
          }}>
            아직도 효블리 회원이 아니세요?
          </a>
        </form>
      </div>
    </div>
  )
}
export default Login