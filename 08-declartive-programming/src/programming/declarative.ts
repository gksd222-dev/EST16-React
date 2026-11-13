import createState from "../lib/createState";




/* 여기까지는 명령형임 어쩔 수 없음 */
const container = document.getElementById('imperative-programming')!;
const checkbox = container?.querySelector( 'input[type="checkbox"]' ) as HTMLInputElement;
const button = container.querySelector('button') as HTMLButtonElement;



/* 선언형 프로그래밍 */
// 무엇에 WHAT 의해 UI가 제어 될 것인가?

const data = {
  checked : false,
}

/* 
render는 상태를 보고 UI를 그리는 함수입니다.
상태가 같으면 몇번을 그려도 몇년뒤에 호출해도 누가와서 그려도 똑같은 화면 나옵니다.
*/

const render = () => {
  const {checked} = data;

  checkbox.checked = checked;

  if(checked){

    button.disabled = true;
    button.textContent = '비활성 상태'
  }else{

    button.disabled = false;
    button.textContent = '활성 상태'
  }
}

const [state, setState] = createState(data,render);


declare global{
  var update : (value:boolean) => void;
}

const update = (globalThis.update = (value:boolean) : void => {
  setState('checked',value)
}) 


checkbox.addEventListener('change',(e:Event)=>{
  const { checked:nextCheckedValue } = e.target as HTMLInputElement;
  update(nextCheckedValue)
})




// 최초 렌더링
render();


// 전역 공개 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).state = state;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).setState = setState;