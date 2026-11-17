import usersData from '@/data/users.json';




export function getUserList(){
  return usersData;
}


export function getUser(userId:number){
  const userList = getUserList();
  const user = userList.find((user)=> user.id === userId);
  return user ? user : null;
}