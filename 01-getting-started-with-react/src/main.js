import React, {createElement} from './lib/react.js';
import ReactDOM, {createRoot} from './lib/react-dom.js';




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

const ul = React.createElement(
  'ul',
  {className:'planet'},
  li
)

const app = document.getElementById('app');

const reactDomRoot = createRoot(app);

//reactDomRoot.render(ul);
reactDomRoot.unmount(ul);
















