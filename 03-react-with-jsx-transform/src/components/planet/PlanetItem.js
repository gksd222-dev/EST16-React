//import React, {createElement as h} from './lib/react.js';
import React, {createElement as h} from '/src/lib/react.js';



export class PlanetItem extends React.Component{
  
  render(){
    const { id, title } = this.props
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
}