import { useState } from 'react';
import './UserPage.css';
import UserList from './components/UserList';
import userData from '@/data/users.json';
import UserSearchBox from './components/UserSearchBox';
import InstantSearch from './components/InstantSearch';
import UserListCount from './components/UserListCount';


function UserPage() {
  
  // [상태 선언]
  const [searchTerm, setSearchTerm] = useState('');
  const [users] = useState(userData);
  const [isInstantSearch,setIsInstantSearch] = useState(false);


  // [상태 업데이트]
  // 컴포넌트 상태를 업데이트 하는 곳 
  const handleSearch = (userInput:string) => setSearchTerm(userInput);
  const handleReset = () => setSearchTerm('');
  const handleToggleInstantSearch = () => setIsInstantSearch(!isInstantSearch)

  
  // [파생 상태]
  // 검색된 유저 목록 
  // const 검색된유저목록 = users.filter((user)=> user.name.includes(searchTerm) || user.email.includes(searchTerm) || user.city.includes(searchTerm) )

  // every 모두 만족해야 true (and)
  // some  하나라도 만족하면 true (or)
  const searchedUserList = users.filter((user)=> 
    [user.name, user.email, user.city].some(
      (field)=> field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )


  return (
    <div className='UserPage'>

      <InstantSearch
        isInstantSearch={isInstantSearch}
        onToggle={handleToggleInstantSearch}
      />

      <UserSearchBox
       onSearch={handleSearch}
       searchTerm={searchTerm}
       onReset={handleReset}
       isInstantSearch={isInstantSearch}
      />

      <UserList users={searchedUserList}/>

      <UserListCount 
        userCount={searchedUserList.length}
        totalUserCount={users.length}
      />


    </div>
  )
}
export default UserPage