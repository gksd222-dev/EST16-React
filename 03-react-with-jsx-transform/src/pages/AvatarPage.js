
import {createElement as h} from '../lib/react.js';
import { Avatar } from "../components/avatar/Avatar.js";

export function AvatarPage(){

  return /* createElement return */ h(
    'ul',
    { className: 'avatarList'},
    h(Avatar,{name:'sinzzang',status:'online'}),
    h(Avatar,{name:'zzanga',status:'offline'}),
    h(Avatar,{name:'sinpapa',status:'disturb'}),
    h(Avatar,{name:'bongmiseon',status:'away'})
  )
}
