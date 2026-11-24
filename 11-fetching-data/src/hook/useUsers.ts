import { useEffect, useState } from "react";


function useUsers() {

  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState<Error | null>(null);  

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


  return {users, loading, error}
}
export default useUsers


