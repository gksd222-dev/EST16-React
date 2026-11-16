// 타입 지정하고 이벤트 연결 
// 목표는 onSearch에 input값을 전달하자 

import { debounce } from "@/utils/debounce";
import { useId } from "react";

interface Props {
  onSearch: (userInput:string) => void;
  searchTerm: string;
  isInstantSearch:boolean;
}



function ProductSearchBox({onSearch, searchTerm, isInstantSearch}:Props) {

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
    <form onSubmit={handleSearch}>
      <div className="ProductSearch" >
        <label htmlFor="product-search">상품 검색</label>
        <input
          id={id}
          type="search"
          placeholder="상품 이름 입력"
          defaultValue={searchTerm}
          onChange={isInstantSearch ? handleChange : undefined}
          />
      </div>
    </form>
  )
}
export default ProductSearchBox