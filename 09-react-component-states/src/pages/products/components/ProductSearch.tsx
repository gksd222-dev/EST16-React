import { useId } from "react";

interface Props {
  searchTerm: string;
  onSearch: (userInput: string) => void;
}

function ProductSearch({ searchTerm, onSearch }: Props) {
  const id = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onSearch(e.target.value);

  return (
    <div className="ProductSearch">
      <label htmlFor={id}>상품 검색</label>
      <input
        id={id}
        type="search"
        value={searchTerm}
        placeholder="상품 이름 입력"
        onChange={handleChange}
      />
    </div>
  );
}
export default ProductSearch;
