interface Props {
  name:string;
  status?:string;
  size?:number
}
function Avatar({ name, status = "offline", size = 64 }:Props){
  let iconPath = "";
  let statusMessage = "";

  switch (status) {
    case "offline":
      iconPath = "/icons/status-offline.svg";
      statusMessage = "오프라인";
      break;
    case "online":
      iconPath = "/icons/status-online.svg";
      statusMessage = "온라인";
      break;
    case "dont-disturb":
      iconPath = "/icons/status-dont-disturb.svg";
      statusMessage = "방해금지";
      break;
    case "away":
      iconPath = "/icons/status-away.svg";
      statusMessage = "자리비움";
      break;
  }

  const label = `${name} (${statusMessage})`;

  return (
    <li className="avatar">
      <figure aria-label={label} title={label}>
        <div className="cover">
          <img src={`/avatar/${name}.png`} alt={name} width={size} height={size} />
        </div>
        <figcaption>
          <img src={iconPath} alt="" />
        </figcaption>
      </figure>
    </li>
  );
}

export default Avatar