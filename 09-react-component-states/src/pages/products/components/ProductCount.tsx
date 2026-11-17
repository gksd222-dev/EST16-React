interface Props {
  count: number;
  total: number;
}

function ProductCount({ count, total }: Props) {
  return (
    <p className="ProductCount">
      전체 <b>{total}</b>개 중 <b>{count}</b>개 표시
    </p>
  );
}
export default ProductCount;
