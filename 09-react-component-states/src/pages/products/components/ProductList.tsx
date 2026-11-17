import type { ProductType } from "../types/product";
import ProductItem from "./ProductItem";


interface Props {
  products:ProductType[];
}


function ProductList({products}:Props) {
  return (
    <ul className="ProductList">
      {
        products.map((product)=>(
          <ProductItem key={product.id} product={product}/>
        ))
      }
    </ul>
  );
}
export default ProductList;
