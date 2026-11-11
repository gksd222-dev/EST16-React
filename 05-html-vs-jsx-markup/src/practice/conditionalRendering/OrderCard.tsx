import './OrderCard.css';
import type { Order } from './data';

interface Props {
  order: Order;
}

const statusLabels = {
  pending:'결제 대기',
  shipping:'배송 중',
  delivered:'배송 완료',
  canceled:'주문 취소',
} satisfies Record<Order['status'], string>


function OrderCard({order}:Props){
  
  const { id, productName, price, status, isMember, couponCount, requestMessage } = order;


  if(status === 'canceled'){
    return (
      <article className="orderCard canceled">
          <p>주문 A-1004 은(는) 취소되었습니다.</p>
      </article>
    )
  }

  // TODO 2. switch 문으로 status 에 맞는 문구를 statusLabel 에 담으세요.
  //         pending → '결제 대기' / shipping → '배송 중' / delivered → '배송 완료'
  
  // let statusLabel = '';
  // switch (status) {
  //   case 'pending':
  //     statusLabel = '결제 대기'
  //     break;
  //   case 'shipping':
  //     statusLabel = '배송 중'
  //     break;
  //   case 'delivered':
  //     statusLabel = '배송 완료'
  //     break;
  // }
  


  return (
    // TODO 3. className 에 status 를 추가해 상태별 색이 적용되도록 하세요.
    //         예) className="orderCard shipping"  (힌트: 템플릿 리터럴)
    <article className={`orderCard ${status}`}>
      <header>
        <span className="orderId">{id}</span>
        {/* TODO 4. 삼항 연산자: isMember 가 true 면 '회원', false 면 '비회원' 을 출력하세요.
                    회원일 때는 className 도 'badge member' 가 되도록 바꿔 보세요. */}
        <span className={isMember ? 'badge member' : 'badge'}>
          {isMember ? '회원' : '비회원'}
        </span>
      </header>

      {/* 여기는 조건 없이 바인딩만 하면 됩니다. 가격은 toLocaleString() 으로 129,000원 처럼 출력하세요. */}
      <h2>{productName}</h2>
      <p className="price">{price.toLocaleString()}원</p>

      <p className="status">
        {/* TODO 5. && 연산자: 배송 중(shipping)일 때만 스피너를 보여 주세요.
                    <img src="/icons/spinner.svg" alt="" /> */}
        {status === 'shipping' && <img src="/icons/spinner.svg" alt="" />}
        {statusLabels[status]}
      </p>

      {/* TODO 6. 쿠폰을 사용한 주문만 "🎟️ 쿠폰 2장 사용" 을 보여 주세요.
                  먼저 {couponCount && <p className="coupon">...</p>} 로 작성하고 화면을 확인해 보세요.
                  쿠폰이 0장인 카드에 무엇이 보이나요? 왜 그런지 생각해 보고 고쳐 보세요. */}
      {couponCount > 0 && <p className="coupon">🎟️ 쿠폰 {couponCount}장 사용</p>}

      {/* TODO 7. requestMessage 는 있을 수도, 없을 수도 있는 값입니다(data.ts 의 ? 확인).
                  값이 있을 때만 <p className="message">📝 요청사항</p> 을 보여 주세요. */}
      {requestMessage && <p className='message'>{requestMessage}</p> }
      
      {/* TODO 8. 배송 완료(delivered)면 '리뷰 쓰기' 버튼, 그 외에는 '배송 조회' 버튼을 렌더링하세요. */}
      {
        status === 'delivered'? (
          <button type="button">리뷰 쓰기</button>
        ) : (
          <button type="button">배송 조회</button>
        )
      }
      
    </article>
  );
}

export default OrderCard;