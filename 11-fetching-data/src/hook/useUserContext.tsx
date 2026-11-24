import { UserContext } from "@/components/context/UserContext";
import { use } from "react";






function useUserContext() {

  const ctx = use(UserContext);
  if(!ctx) throw new Error('useUserContext는 <UserContext> 안에서 사용해야 합니다.');

  return ctx;
}
export default useUserContext



















