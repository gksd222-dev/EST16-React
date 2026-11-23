import { useEffect, useState } from "react"





function UserList() {

  //const [count, setCount] = useState(0);
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState<Error | null>(null);  

  //useEffect(fn) => 매 렌더링마다 실행
  //useEffect(fn,[]) => 첫 렌더링(마운트) 이후 딱 한 번만
  //useEffect(fn,[count]) => count가 지난번값과 같지 않다면 호출

  // useEffect => 컴포넌트 안에서 [이벤트 핸들러를 제외한] 일반 함수 또 만들고 싶을 때

  

  // useEffect(()=>{

  //   console.log('useEffect 실행!')

  //   const id = setInterval(() => {
  //     console.log('실행');
  //   }, 1000);

  //  return () => {

  //     console.log(' 청소를 깨끗이 하자! ')
  //     clearInterval(id);
  //   }
  // },[count])


  useEffect(()=>{

    const controller = new AbortController();

    fetch("https://jsonplaceholder.typicode.com/users",{signal: controller.signal})
    .then( res => {
      if(!res.ok) throw new Error('네트워크 응답 오류');
      return res.json();
    })
    .then( (data:User[]) => {
      setUsers(data);
      setLoading(false);

    })
    .catch( (err:Error) => {
      if(err.name === 'AbortError') return;

      console.error('데이터 가져오기 실패',err);
      setLoading(false);
      setError(err);
    });

    return ()=> controller.abort();

  },[])

  if(loading) return <p>로딩 중....</p>;
  if(error) return <p> ❌ 에러 발생!!! : {error.message} ❌ </p>

  return (
    // <div>
    //   <p>카운트 : {count}</p>
    //   <button type="button" onClick={()=>setCount(count + 1)}> +1 </button>
    // </div>
    <ul>
      {
        users && users.map((user)=>
          <li key={user.id}>{user.name} ({user.email})</li>
        )
      }
    </ul>
  )
}
export default UserList