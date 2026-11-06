// React API 유사
// React.createElement(type, props, ...children)

export const VIRTUAL_ELEMENT_TYPE = Symbol('virtual.element');

function createElement(type, props, ...children) {

  const { key = null, children: propsChildren = [], ...restProps } = props ?? {};

  // Creating a Virtual Element
  return {
    $$typeof: VIRTUAL_ELEMENT_TYPE,
    type,
    key,
    props: {
      ...restProps,
      children: [...[].concat(propsChildren), ...children].filter(
        (child) => child !== null && child !== undefined && child !== false
      ),
    },
  };
}

export default createElement;
