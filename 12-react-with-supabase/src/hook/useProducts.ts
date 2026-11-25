import type { Database } from "@/supabase/database.types";
import supabase from "@/supabase/supabase";
import { useEffect, useState } from "react";

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductItem = Pick<ProductRow, 'id' | 'name' | 'price' | 'image_url' | 'sale' | 'description'>

// 조회 
// type ProductType = Tables<'products'>;

// 생성
// type ProductType = TablesInsert<'products'>;

// 수정
// type ProductType = TablesUpdate<'products'>;

function useProducts(){

  const [products, setProducts] = useState<ProductItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    // ignore 플래그: 컴포넌트가 사라지거나 effect가 다시 실행되면 clean up 함수가 정리한다 -> 요청이 늦게 도착해도 return이 걸림 
    let ignore = false;

    const fetchProducts = async () => {

      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, sale, image_url, description')

      if(ignore) return;
        
      if(data){
        // 상태 업데이트
        setProducts(data);
      }

      setLoading(false)

      if(error){
        console.warn('상품 정보 불러오기 실패',error);
        return null;
        
      }
    }

    fetchProducts();
    return () => {
      ignore = true;
    }

  },[])
  
  return {products, loading}

}


export default useProducts;