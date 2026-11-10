// @ts-nocheck

import React, {createElement as h } from 'https://esm.sh/react';
import ReactDOM,{createRoot} from 'https://esm.sh/react-dom/client';


function Avatar({ name, status = "offline", size = 64 }):React.JSX.Element {
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
    case "disturb":
      iconPath = "/icons/status-disturb.svg";
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
        <img src={`/avatar/${name}.png`} alt={name} />
      </div>
      <figcaption>
        <img src={iconPath} alt="" />
      </figcaption>
    </figure>
    </li>
  );
}

function AvatarListPage() {
  // JSX
  return (
    <ul className="avatarList">
      <Avatar name="sinzzang" status="offline"/>
      <Avatar name="zzanga" status="disturb"/>
      <Avatar name="sinpapa" status="online"/>
      <Avatar name="bongmiseon" status="away"/>
    </ul>
  );
}



const container = document.getElementById("app");

if (container) {
  const reactDomRoot = ReactDOM.createRoot(container);
  reactDomRoot.render(<AvatarListPage/>);
}

































