import type { JSX } from "react/jsx-runtime";
import { Avatar } from "@/components/Avatar";




export function AvatarPage():JSX.Element{
  
  return (
    <ul className="avatarList">
      <Avatar name="sinzzang" status="offline"/>
      <Avatar name="sinpapa" status="online"/>
      <Avatar name="bongmiseon" status="away"/>
    </ul>
  )
}