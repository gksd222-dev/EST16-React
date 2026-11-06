import { VIRTUAL_ELEMENT_TYPE } from './createElement.js';

/** @type{(node: any) => boolean} */
function isValidElement(node) {

  return (
    typeof node === 'object' &&
    node !== null &&
    node.$$typeof === VIRTUAL_ELEMENT_TYPE
  );
}

export default isValidElement;
