import { useParams, useRouter } from "@/router/RouterProvider"
import type { Tables } from "@/supabase/database.types";
import supabase from "@/supabase/supabase";
import { useEffect, useState } from "react";
import S from './ProductDetail.module.css'


type Product = Tables<'products'>

function ProductDetail() {
  
  const {id} = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [name, setName] = useState('');

  const {setHistoryRoute} = useRouter();

  useEffect(()=>{
    if(!product) return;
    setName(product.name)
  },[product]);

  // 1. useEffect를 사용함 
  useEffect(()=>{
    if(!id) return;
    let ignore = false;
    
    const fetchProduct = async () => {
      setLoading(true);
      // 2. supabase의 메서드를 사용해 id에 맞는 item을 조회하세요.
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id',id) // 3. .eq      = 해당 속성이 일치하는 항목만 조회
        .single()    // 4. .single  = 조회 대상을 객체로 반환 받음. 

        if(ignore) return;
        if(error){
          console.error('상품 조회 실패 : ',error);
          setError('상품을 불러올 수 없습니다.');
        }else{
          setProduct(data);
        }
        setLoading(false);
    }
    fetchProduct()
    return () => {
      ignore = true;
    }
  },[id])


  const handleUpdate = async () => {
    
    const {data, error:updateError} = await supabase
    .from('products')
    .update({name})
    .eq('id',id) // 이걸 안 넣으면 모든 행을 다 바꿈 
    .select()

    if(updateError || !data || data.length === 0){
      alert('상품 수정 실패 :' + (updateError?.message ?? '수정 권한이 없거나 상품이 없습니다.'));
      return false;

    }else{
      alert('상품 수정 완료!');
      return true;
    }
  }

  if(loading) return <p>상품 정보 불러오는 중.....</p>
  if(error || !product) return <p>{error ?? '해당 상품이 존재하지 않습니다.'}</p>

  return (
  <div className={S.container}>
      <img src={product.image_url} alt={product.name} className={S.image} />

      {/* <h2 className={S.name}>{product.name}</h2> */}
      <div>
        <input className={S.nameInput} value={name} onChange={(e)=> setName(e.target.value)} />
      </div>

      <p className={S.description}>{product.description}</p>
      <div className={S.priceBox}>
        <span className={S.price}>{product.price.toLocaleString()}원</span>
        {product.sale ? (
          <>
            <span className={S.sale}>할인율: {product.sale}%</span>
            <span className={S.finalPrice}>
              {(product.price - product.price * product.sale * 0.01).toLocaleString()}원
            </span>
          </>
        ) : (
          <span className={S.finalPrice}>{product.price.toLocaleString()}원</span>
        )}
      </div>
      <div className={S.buttonGroup}>
        <button 
          type="button"
          onClick={()=> {
            handleUpdate()
            .then((ok)=>{
              if(!ok) return;
              history.pushState(null,'','/Product')
              setHistoryRoute('/Product')
            })
            
          }}
        >EDIT</button>
        <button
          type="button"
          onClick={()=>{
          history.pushState(null,'','/Product')
          setHistoryRoute('/Product')
        }}>BACK</button>
      </div>
    </div>
  )
}
export default ProductDetail