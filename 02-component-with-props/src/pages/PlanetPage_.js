import { PlanetItem } from '../components/planet/planetItem.js';
import { PlanetList } from '../components/planet/PlanetList.js';
import { listData } from '../data.js';
import React, {createElement as h} from '/src/lib/react.js';




export function PlanetPage_({ title, lang, children }){

  return /* createElement return */ h(
    PlanetList,
    { 
      lang:'en',
      children: listData.items.map(({id,title})=>h(PlanetItem,{ key:id, id, title }))
    },
  )  
}