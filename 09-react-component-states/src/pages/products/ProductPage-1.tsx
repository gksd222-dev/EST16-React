import { useState } from "react";
import ProductList from "./components-1/ProductList";
import { productData } from "./data";
import "./ProductPage.css";
import ProductListCount from "./components-1/ProductListCount";
import ProductStockFilter from "./components-1/ProductStockFilter";
import ProductSearchBox from "./components-1/ProductSearchBox";


/*
  [실습] 아래 마크업을 컴포넌트로 분리하고, 상태를 연결해 보세요.
  - 상품 데이터: ./data.ts 의 productData
  - 검색어로 상품 이름 필터링
  - "재고 있는 상품만 보기" 체크 시 재고 있는 상품만 표시
  - 표시 개수 / 전체 개수 출력
*/

function ProductPage() {

  const [products] = useState(productData);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  //const [isInstantSearch, setIsInstantSearch] = useState(false);

  //const handleToggleInstantSearch = () => setIsInstantSearch(!isInstantSearch);

  const searchedProductList = products.filter((product) =>
    product.name.includes(searchTerm) && (!inStockOnly || product.inStock)
  )

  const handleSearch = (userInput:string) => setSearchTerm(userInput);

  return (
    <div className="ProductPage">
      <h1>상품 목록</h1>

      {/* <ProductInstantSearch
        isInstantSearch={isInstantSearch}
        onToggle={handleToggleInstantSearch}
      /> */}


      <ProductSearchBox 
       onSearch={handleSearch}
       searchTerm={searchTerm}
  
      
      />

      <ProductStockFilter inStockOnly={inStockOnly} onInStockOnlyChange={setInStockOnly} />

      <ProductList products={searchedProductList}/>

      <ProductListCount 
        productCount={searchedProductList.length}
        totalProductCount={products.length}  
      />



    </div>
  );
}
export default ProductPage;