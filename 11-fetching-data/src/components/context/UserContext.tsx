import { createContext } from "react";


export interface UserContextType {
  username:string;
  setUsername:(name:string)=> void
}



export const UserContext = createContext<UserContextType | null>(null);




