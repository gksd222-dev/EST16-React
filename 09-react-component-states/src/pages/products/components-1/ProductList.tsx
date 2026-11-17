import type { ProductType } from "../types/product"
import ProductItem from "./ProductItem"



interface Prop{
  products: ProductType[] 
}


function ProductList({products}:Prop) {
  
  
  return (
    <ul className="ProductList">
      {
        products.map((product,index)=>(
          <ProductItem 
            key={product.id}
            product={product}
            index={index}
          />
        ))
      }
    </ul>
  )
}
export default ProductList