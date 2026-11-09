
import React, {createElement} from './lib/react.js';
import ReactDOM, {createRoot} from './lib/react-dom.js';




// 반응성 데이터


const listData = {
  items: [],
}


const reactiveListData = new Proxy(listData,{
  get(target, prop){
    //console.log(target, prop);

    return target[prop]
  },
  set(target, prop, newValue){
    const oldValue = target[prop];

    //console.log(`${oldValue} → ${newValue}`)

    //const result = Reflect.set(target,prop,newValue);

    target[prop] = newValue;

    render(); // re-render !!!
    return true;
  }
});


//console.log( reactiveListData.items = 'hello' )
// 값을 바꿔주었더니, set이 호출되었다.
//console.log( reactiveListData.items = 'bye' )


const container = document.getElementById('app');
const reactDomRoot = ReactDOM.createRoot(container);


function render(){

  const children = reactiveListData.items.map(({id,title})=>{
    const reactElement = createElement(
        'li',
        {key:id, className:'item'},
        createElement('img',{
          src:`/planet/image-0${id}.jpg`,
          alt:title
        }),
        createElement('span',{
          className:'content',
        },title),
        createElement('button',
          {type:'button',title:'아이템 이동'},
          createElement('img',{
            src:'/icons/handle.svg',
            alt:'아이템 이동'
          })
        ),
      )
      return reactElement;
    })

    const list = createElement(
      'ul',
      {className:'planet',lang:'en'},
      children
    )
    reactDomRoot.render(list);
}


// 최초 마운트 시 실행 (랜더링)
render();

//선언형 프로그래밍
setTimeout(() => {
  reactiveListData.items = [
    ...reactiveListData.items,
    {
      id:1,
      title:'Life of Earth'
    }
  ]
}, 1000);



setTimeout(() => {
  reactiveListData.items = [
    ...reactiveListData.items,
    {
      id:2,
      title:'화성 가자!'
    }
  ]
}, 2000);



setTimeout(() => {
  reactiveListData.items = [
    ...reactiveListData.items,
    {
      id:3,
      title:'Jupiter'
    }
  ]
}, 3000);



setTimeout(() => {
  reactiveListData.items = [
    ...reactiveListData.items,
    {
      id:4,
      title:'고요한 바다'
    }
  ]
}, 4000);


setTimeout(() => {
  unmount();
}, 5000);

function unmount(){
  reactDomRoot.unmount();
}


// react가 원래 다해주기때문에 각각 설계를 해줄 필요는 없다
// 설명을 위해 하는 것일 뿐이다








