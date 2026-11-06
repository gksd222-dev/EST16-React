import React, { createElement } from "./lib/react.js";
import { createRoot } from "./lib/react-dom.js";

const listData = {
  items: [
    { id: "1", title: "Life on Earth" },
    { id: "2", title: "Jupiter’s massive storms" },
    { id: "3", title: "Explore Mars now" },
    { id: "4", title: "Moonlight and craters" },
  ],
};

// <button type="button" title="아이템 이동 (위/아래 화살표 키 활용)" >
//  <img src="/icons/handle.svg" alt="아이템 이동 (위/아래 화살표 키 활용)" />

const childImage = React.createElement("img", {
  src: "/icons/handle.svg",
  alt: "아이템 이동",
});
const button = React.createElement(
  "button",
  { type: "button", title: "아이템 이동" },
  childImage
);
const span = React.createElement(
  "span",
  { className: "content" },
  "Life on Earth"
);

const img = React.createElement("img", {
  src: "/planet/image-01.jpg",
  alt: "",
});







const li = React.createElement("li", { className: "item" }, img, span, button);

const children = listData.items.map(({ id, title }) => {
  const li = React.createElement(
    "li",
    { key:id, className: "item" },
    React.createElement("img", {
      src: `/planet/image-0${id}.jpg`,
      alt: "",
    }),
    React.createElement("span", { className: "content" }, title),
    React.createElement(
      "button",
      { type: "button", title: "아이템 이동" },
      React.createElement("img", {
        src: "/icons/handle.svg",
        alt: "아이템 이동",
      })
    )
  );
  return li
});



const ul = React.createElement("ul", {
  className: "planet",
  lang:'en'
},
children);

const container = document.getElementById("app");

const reactDomRoot = createRoot(container);

function render() {
  reactDomRoot.render(ul);
}

function unmount() {
  reactDomRoot.unmount();
}

render();
