import React, {createElement as h} from './lib/react.js';
import ReactDOM, {createRoot} from './lib/react-dom.js';
import { AvatarPage } from './pages/AvatarPage.js';




/* react class component */
// 배달의 민족에서는 고집하는 방식이다


// PlanetItem

// h(PlanetItem,{id,title})

// PlanetPage


// const container = document.getElementById('app');

// if(container){
//   const reactDomRoot = ReactDOM.createRoot(container);

//   reactDomRoot.render( h(PlanetPage_) );

// }

// {title:'hello',lang:'en'}은 this.props에 전달이 된다.
// 함수를 파일별로 나눈 것이고, 익숙해져야한다.
// 나뉜 것이 표준이고 기준이 되기 때문이다
// 리액트에서는 함수의 앞에 대문자를 사용하는 것이 규칙이다

//함수로 만들던 클래스로 만들던 크게 상관없다.


// 이제 함수로 바꿔서
// this로 props를 받는게 아니라
// params로 받는거군요



const container = document.getElementById('app');

if(container){
  const reactDomRoot = ReactDOM.createRoot(container);

  reactDomRoot.render( h(AvatarPage) );

}























