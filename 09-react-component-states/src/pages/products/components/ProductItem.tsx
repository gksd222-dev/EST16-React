import type { ProductType } from "../types/product"

interface Props{
  product:ProductType;
}

function ProductItem({product}:Props) {

  const {inStock, name, price} = product;

  return (
    <li className={inStock ? '' : 'sold-out'}>
      <strong>{name}</strong>
      <span className="price">{price.toLocaleString()}원</span>
      <span className="badge">{inStock ? '재고 있음' : '품절'}</span>
    </li>

  )
}
export default ProductItem

