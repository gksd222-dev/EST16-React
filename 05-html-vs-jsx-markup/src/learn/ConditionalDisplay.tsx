


/* 


UI 작업시

조건부 랜더링 vs 조건부 표시

조건부 랜더링
로그인/로그아웃 화면, 장바구니 목록, 에러 메시지, 툴팁

조건부 표시
아코디언, 탭메뉴, 드롭다운 메뉴, 애니메이션 처리 (처음엔 조건부 표시 -> 표시 )


*/




interface Props {
  isShowReactImage:boolean;
}


function ConditionalDisplay({isShowReactImage}:Props) {
  return (
    <>
      <dt>조건부 표시 (conditional display)</dt>
      <dd>
        <p>
          표시(display) 여부에 따라 이미지가 화면에 감춰지거나 표시됩니다.
        </p>
        <picture hidden={isShowReactImage}>
          <source type="image/avif" srcSet="/react/react.avif" />
          <source type="image/webp" srcSet="/react/react.webp" />
          <img src="/react/react.png" alt="react" height={42}/>
        </picture>
      </dd>
    </>
  )
}
export default ConditionalDisplay