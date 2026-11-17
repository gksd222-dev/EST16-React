import type { CSSProperties } from "react";
import type { ProductType } from "../types/product";

interface Props{
  product:ProductType;
  index:number;
}

function ProductItem({product, index}:Props) {

  const {id, name, price, inStock} = product;
  const style = { '--i': index, '--hue': (id * 47) % 360 } as CSSProperties;

  return (
    <li style={style} className={inStock ? undefined : 'sold-out'}>
      <span className="product-initial">{name}</span>
      <span className="price">{price}원</span>
      <span className="badge">{inStock ? '재고 있음' : '품절'}</span>
    </li>
  )
}
export default ProductItem