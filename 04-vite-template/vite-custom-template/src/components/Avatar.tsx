import type { JSX } from "react/jsx-runtime";


type AvatarProps = {
  name: string;
  status: 'online' | 'offline' | 'away' | 'disturb',
  size?: number;
}




export function Avatar({name, status, size = 64}:AvatarProps): JSX.Element{

  console.log(size);

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


  return (
    <li className="avatar">
      <figure aria-label={label} title={label}>
        <div className="cover">
          <img src={`/avatar/${name}.png`} alt={name}/>
        </div>
        <figcaption>
          <img src={iconPath} alt=""/>
        </figcaption>
      </figure>
    </li>
  )

}