import { useId } from "react";

interface Props {
  onlyInStock: boolean;
  onToggle: () => void;
}

function StockFilter({ onlyInStock, onToggle }: Props) {
  const id = useId();

  return (
    <div className="StockFilter">
      <input
        type="checkbox"
        id={id}
        checked={onlyInStock}
        onChange={onToggle}
      />
      <label htmlFor={id}>재고 있는 상품만 보기</label>
    </div>
  );
}
export default StockFilter;
