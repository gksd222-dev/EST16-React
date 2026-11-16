// 타입 지정하고 이벤트 연결 
// 목표는 onSearch에 input값을 전달하자 

import { debounce } from "@/utils/debounce";
import { useId } from "react";

interface Props {
  onSearch: (userInput:string) => void;
  onReset: () => void;
  searchTerm: string;
  isInstantSearch:boolean;
}



function UserSearchBox({onSearch, searchTerm, onReset, isInstantSearch}:Props) {

  const id = useId();

  const handleSearch = (e:React.FormEvent<HTMLFormElement>)=>{

    e.preventDefault();
    const input = document.getElementById(id) as HTMLInputElement;
    const value = input.value.trim();

    if(value.length > 0){
      onSearch(value);
    }else{
      alert('검색어를 입력해주세요.');
    }

    input.value = '';
    input.focus();
  }

  const handleChange = debounce((e:React.ChangeEvent<HTMLInputElement>) => 
    onSearch(e.target.value),300)

  return (
    <form className="UserSearchBox" onSubmit={handleSearch}>
      <div className="control">
        <label htmlFor={id}>사용자 검색</label>
        <input 
          type="search" 
          id={id} 
          placeholder='사용자 정보 입력' 
          defaultValue={searchTerm}
          onChange={isInstantSearch ? handleChange : undefined}
        />
      </div>
      <button type="submit">찾기</button>
      <button type="reset" onClick={onReset}>목록 초기화</button>
    </form>
  )
}
export default UserSearchBox