



interface Props {
  inStockOnly: boolean;
  onInStockOnlyChange: (checked: boolean) => void;
}




function ProductStockFilter({ inStockOnly, onInStockOnlyChange }:Props) {
  return (
    <div className="StockFilter">
      <input
       type="checkbox"
       id="stock-filter"
       checked={inStockOnly}
       onChange={(e) => 
       onInStockOnlyChange(e.target.checked)}
        />
      <label htmlFor="stock-filter">재고 있는 상품만 보기</label>
    </div>
  );
}
export default ProductStockFilter









