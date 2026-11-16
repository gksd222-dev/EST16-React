import type { UserType } from "../types/user"
import UserItem from "./UserItem"

interface Prop{
  users: UserType[]
}

function UserList({users}:Prop) {

  
  
  return (
    <ul className="UserList">
      {
        users.map((user,index)=>(
          <UserItem 
            key={user.id}
            user={user}
            index={index}
          />
        ))
      }
      
    </ul>
  )
}
export default UserList