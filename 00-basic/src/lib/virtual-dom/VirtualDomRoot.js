class VirtualDomRoot {
  #rootElement;

  constructor(rootElement) {
    this.#rootElement = rootElement;
  }

  #parseVNode(vNode) {

    if (typeof vNode === 'string' || typeof vNode === 'number') return String(vNode);

    const { type, props } = vNode;

    const element = document.createElement(type);

    const { children = [], ...attributes } = props;

    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {

        element.className = value;
      } else {
        element.setAttribute(key, value);
      }
    });

    children.forEach((child) => {
      element.append(this.#parseVNode(child));
    });

    return element;
  }

  render(vNode) {
    const parsedElements = this.#parseVNode(vNode); // 가상 -> 실제 DOM 생성

    this.#rootElement.append(parsedElements);
  }

  unmount() {
    this.#rootElement.replaceChildren();
  }
}

export default VirtualDomRoot;
