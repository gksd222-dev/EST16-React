import React, {createElement as h} from '/src/lib/react.js';


// PlanetList
export class PlanetList extends React.Component{
  
  render(){
    const { lang, children } = this.props
    return h(
      'ul',
      {className:'planet',lang},
      children
      //children은 배열이다
    )
  }
}

