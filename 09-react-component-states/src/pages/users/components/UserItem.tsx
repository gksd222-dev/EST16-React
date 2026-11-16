import type { CSSProperties } from "react";
import type { UserType } from "../types/user"

interface Props{
  user:UserType;
  index:number;
}

function UserItem({user, index}:Props) {

  const {name, email, id, city} = user;
  const style = { '--i': index, '--hue': (id * 47) % 360 } as CSSProperties;

  return (
    <li style={style}>
      <span className="avatar-initial">{name}</span>
      <span className="info">
        <strong>{name}</strong>
        <a href="">{email}</a>
      </span>
      <span className="city">{city}</span>
    </li>
  )
}
export default UserItem