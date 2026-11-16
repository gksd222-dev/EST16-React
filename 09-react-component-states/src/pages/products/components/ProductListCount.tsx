


interface Props{
  productCount: number;
  totalProductCount: number;
}


function ProductListCount({productCount, totalProductCount}:Props) {
    
  return (
    <div className="ProductCount">
        <span>전체 <b>{totalProductCount}</b>개 중 <b>{productCount}</b>개 표시</span>
    </div>
  )
}
export default ProductListCount