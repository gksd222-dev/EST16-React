import { useEffect, useRef, useState } from 'react';
import S from './Product.module.css'
import supabase from '@/supabase/supabase'
import type { Tables } from '@/supabase/database.types';

function Product() {

  supabase.from('products').select('*').then(console.log);


  const UL = useRef<HTMLUListElement>(null);
 
  const [products, setProducts] = useState<Tables<'products'>[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) { console.error(error); return; }
      setProducts(data);
    };
    fetchProducts();
  }, []);

  return (
    <div className={S.container}>
      <ul ref={UL}>
        {products.map((p) => (
          <li key={p.id}>
            <a href="/">
              <figure><img src={p.image_url} alt={p.name} /></figure>
              <span className={S.brand}>{p.name}</span>
              <span className={S.description}>{p.description}</span>
              <span className={S.price}>{p.price.toLocaleString()}</span>
              <div>
                <span className={S.discount}>{p.sale}%</span>
                <span className={S.realPrice}>
                  {(p.price * (1-p.sale/100)).toLocaleString()}
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
export default Product