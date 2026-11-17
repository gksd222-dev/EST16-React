import { useState } from "react";
import ProductList from "./components/ProductList";
import StockFilter from "./components/StockFilter";
import productData from "./data";

import "./ProductPage.css";
import ProductSearch from "./components/ProductSearch";
import ProductCount from "./components/ProductCount";

function ProductPage() {
  const [products] = useState(productData);
  const [searchTerm, setSearchTerm] = useState("");
  const [onlyInStock, setOnlyInStock] = useState(false);

  const handleSearch = (userInput: string) => setSearchTerm(userInput);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.includes(searchTerm.trim());
    const matchesStock = onlyInStock ? product.inStock : true;
    return matchesSearch && matchesStock;
  });

  const handleToggleStock = () => setOnlyInStock(!onlyInStock);

  return (
    <div className="ProductPage">
      <h1>상품 목록</h1>

      <ProductSearch searchTerm={searchTerm} onSearch={handleSearch} />

      <StockFilter onlyInStock={onlyInStock} onToggle={handleToggleStock} />

      <ProductList products={filteredProducts} />

      <ProductCount count={filteredProducts.length} total={products.length} />
    </div>
  );
}
export default ProductPage;
