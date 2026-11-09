
import React, {createElement} from './lib/react.js';
import ReactDOM, {createRoot} from './lib/react-dom.js';

// 리스트 랜더링

const listData = {
  items:[
    { id:"1", title:'Life on Earth'},
    { id:"2", title:'Jupiter`s massive storm'},
    { id:"3", title:'Explore Mars now'},
    { id:"4", title:'Moonlight and craters'},
  ]
}

const childImage = React.createElement(
  'img',
  { src: '/icons/handle.svg', alt: '아이템 이동' },
)
const button = React.createElement(
  'button',
  { type: 'button', title: '아이템 이동 가능'},
  childImage
)
const span = React.createElement(
  'span',
  {className:'content'},
  'Climatology'
)
const img = React.createElement(
  'img',
  {src:'/planet/image-01.jpg', alt:"기후학"}
)

const li = React.createElement(
  'li',
  {className:'item'},
  img, span, button
)


// listData를 반복 순환해서 children을 만들어주세요.
//  - map을 사용해 새로운 배열을 반환
//  - 반환된 배열을 ul의 children으로 전달
//리스트 랜더링은 배열을 만들어서 내보내야함

const children = listData.items.map(({id,title})=>{
  
  const li = createElement(
    'li',
    {key:id, className:'item'},
    createElement('img',{
      src:`/planet/image-0${id}.jpg`,
      alt:title
    }),
    createElement('span',{
      className:'content',
    },title),
    // 타입('span'), 프롭('content'), chilren 자식(title)
    createElement('button',
      {type:'button',title:'아이템 이동'},
      createElement('img',{
        src:'/icons/handle.svg',
        alt:'아이템 이동'
      })
    ),
  )
  return li;
})

// react에서는 가상돔과 현실돔이 일치하는지 서로 비교하게 된다. reconciliation
// 리스트 랜더링을 할때  key를 입력해 줘야함


const ul = React.createElement(
  'ul',
  { className:'planet', },
  children
)


const app = document.getElementById('app');

const reactDomRoot = createRoot(app);

reactDomRoot.render(ul);
// reactDomRoot.unmount()




