import LayoutBox from "./LayoutBox"





function EventPropagation() {


  // 핸들러를 반환하는 함수   -> 고차 함수 

  // 한줄평: 함수를 전달해야함 -> 인수를 내가 원하는 인수로 전달하고싶다? 
  const returnHandlePrint = (color:string,e:React.MouseEvent) => {
    
    // return (e:React.MouseEvent<HTMLDivElement>) => {
    
    e.stopPropagation();
    console.log(color, e.target);
    // }
  }


  return (
    <details>
      <summary>
        <b>이벤트 전파 & 기본 동작 차단</b>
      </summary>
      <LayoutBox title='layoutBox' name="레이아웃박스" style={styles.cyan} onClick={(e)=> returnHandlePrint('cyan',e)}>
        <LayoutBox style={styles.magenta} onClick={(e)=> returnHandlePrint('magenta',e)}>
          <LayoutBox style={styles.yellow} onClick={(e)=> returnHandlePrint('yellow',e)}>
            <LayoutBox style={styles.purple} onClick={(e)=> returnHandlePrint('purple',e)}></LayoutBox>
          </LayoutBox>
        </LayoutBox>
      </LayoutBox>
    </details>
  )
}
export default EventPropagation


const styles = {
  cyan: {
    "--color": "var(--cyan)",
  },
  magenta: {
    "--color": "var(--magenta)",
  },
  yellow: {
    "--color": "var(--yellow)",
  },
  purple: {
    "--color": "var(--purple, #7423f6)",
  },
};