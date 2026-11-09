import React, {createElement as h} from '../../lib/react.js';


/* 

type AvatarProps = {
  name: string;
  status: 'online' | 'offline' | 'away' | 'disturb';
  size?:number; (옵셔널 처리 이다.)
}

*/

                                  /* props */
export function Avatar({name, status, size = 64}){
  
  let iconPath = '';
  let statusMessage = '';
  
  switch (status) {
    case 'offline':
      iconPath = '/icons/status-offline.svg';
      statusMessage = '오프라인';
      break;
    case 'online':
      iconPath = '/icons/status-online.svg';
      statusMessage = '온라인'
      break;
    case 'disturb':
      iconPath = '/icons/status-disturb.svg';
      statusMessage = '방해금지'
      break;
    case 'away':
      iconPath = '/icons/status-away.svg';
      statusMessage = '자리비움'
      break;
  }
  
  const label = `${name} (${statusMessage})`
  // sinzzang (자리비움)


  return h(
    'li',
    {className: 'avatar'},
    h(
      'figure',
      {'aria-label':label, title: label},
      h('div',{className:'cover'},
        h('img',{
          src:`/avatar/${name}.png`,
          alt:'',
        })
      ),
      h('figcaption',null,
        h('img',{
          src:iconPath,
          alt:''
        })
      ),
    )
  )
}
