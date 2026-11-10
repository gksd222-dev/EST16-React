//import React, {createElement as h} from './lib/react.js';
import React, {createElement as h} from '/src/lib/react.js';


// PlanetItem
export function PlanetItem_({id, title}/*props*/){
  
  //const { id, title } = this.props
  //구조 분해 결과이다

  return h(
    'li',
    {className:'item'},
    h('img',{ src:`/planet/image-0${id}.jpg`, alt:title }),
    h('span',{ className:'content', },title),
    h('button', {type:'button',title:'아이템 이동'},
    h('img',{ src:'/icons/handle.svg', alt:'아이템 이동' })
  ),
  )
}


//props(properties의 줄임말)는 부모 컴포넌트가 자식 컴포넌트에 넘겨주는 데이터입니다.















