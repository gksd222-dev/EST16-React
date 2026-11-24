import useUsers from "@/hook/useUsers";






function UserList() {

  //const [count, setCount] = useState(0);


  const {loading, error, users} = useUsers()

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