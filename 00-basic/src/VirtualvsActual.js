
import { createElement } from "./lib/virtual/index.js";   // 가상 돔 생성기
import { createRoot } from "./lib/virtual-dom/index.js";  // 실제 돔 -> 가상 돔 컨버터

// 리액트가 둘로 나누어진 이유?
// 실제 돔과 가상돔을 사용하는데 실제돔에 생성된 것을
// 가상돔에서 가상 요소를 실제 DOM 요소에 랜더링 하는데 이때에는 헬퍼가 필요하다.
// 실제돔은 만들어지기 까지의 모든 과정이 담겨있어 무겁다는 특징이 있다


/* actual DOM 실제 돔
웹 API를 사용해서 문서 객체(Document Object)를 생성
*/

// 부모 요소 생성
const divElement = document.createElement('div');

// 자식 요소 생성
const buttonElement = document.createElement('button');
buttonElement.textContent = 'hello';
buttonElement.classList.add('btn');
buttonElement.setAttribute('type','button');

// 요소간의 관계 형성 
divElement.append(buttonElement);

// 랜더링 위치 정하기
const actualDomElement = document.getElementById('app');

// 실제 DOM에 마운트(Mount, 착장 === 랜더링)
actualDomElement.append(divElement);





//virtual DOM


// 가상(추상화된, 단순화된) 요소(엘리먼트) 생성


// 자식 가상 요소
const buttonV_Element = createElement('button',{type:'button',class:'btn'},'hola!');


const divV_Element = createElement('div',{class:'cold'},buttonV_Element);



//console.dir( buttonElement );       //모든 역사를 들고있다. 너무 무겁다.
//console.log( buttonV_Element );      
//console.log( divV_Element );      

// 가상 요소를 실제 DOM 요소에 랜더링

const virtualRootElement = document.getElementById('app');

// 가상돔 랜더링 헬퍼
const vRoot = createRoot(virtualRootElement);

vRoot.render(divV_Element);


































