



interface Props {
  onClick: (e: React.MouseEvent<HTMLDivElement>)=>void;
  style: React.CSSProperties & { [key:string] : string | number};
  title?:string;
  name?:string;
  children?:React.ReactNode;
}



function LayoutBox({onClick, children, ...restProps}:Props) {
  
  
  return (
    // onClick 우리가 부모로부터 전달한 이벤트 핸들 함수
    // {onClick} 리액트에서 정한 이벤트 호출 방식

    <div className="box" onClick={onClick} {...restProps}> 
      {children}
    </div>
  )
}
export default LayoutBox












