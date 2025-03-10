interface DOM_TYPES_INTER {
  TEXT: string;
  ELEMENT: string;
  FRAGMENT: string;
}

interface PROPS_INTER {
  class?: string[] | string;
  on?: object;
  style?: string[];
  [key: string]: any;
}

interface LISTENERS_INTER {
  [key: string]: () => void;
}

interface ELEMENT_INTER {
  type: string;
  tag?: string;
  props?: PROPS_INTER;
  value?: string;
  children?: ELEMENT_INTER[];
  listeners?: LISTENERS_INTER;
  el?: HTMLElement | DocumentFragment | Text;
}

const DOM_TYPES: DOM_TYPES_INTER = {
  TEXT: "text",
  ELEMENT: "element",
  FRAGMENT: "fragment",
};

function withoutNulls(
  array: (ELEMENT_INTER | string | undefined | null)[]
): (ELEMENT_INTER | string)[] {
  return array.filter((e) => e != null);
}

function mapTextNodes(children: (ELEMENT_INTER | string)[]): ELEMENT_INTER[] {
  return children.map((child) =>
    typeof child === "string" ? createString(child) : child
  );
}

export function createString(str: string): ELEMENT_INTER {
  return {
    type: DOM_TYPES.TEXT,
    value: str,
  };
}

export function createFragment(
  vNodes: (ELEMENT_INTER | string | undefined | null)[]
): ELEMENT_INTER {
  return {
    type: DOM_TYPES.FRAGMENT,
    children: mapTextNodes(withoutNulls(vNodes)),
  };
}

export function createElement(
  tag: string,
  props: PROPS_INTER = {},
  children: (ELEMENT_INTER | string | undefined | null)[] = []
): ELEMENT_INTER {
  return {
    tag,
    props,
    children: mapTextNodes(withoutNulls(children)),
    type: DOM_TYPES.ELEMENT,
  };
}

export function mountDOM(vdom: ELEMENT_INTER, parentEl: HTMLElement) {
  switch (vdom.type) {
    case DOM_TYPES.TEXT: {
      createTextNode(vdom, parentEl);
      break;
    }

    case DOM_TYPES.ELEMENT: {
      createElementNode(vdom, parentEl);
      break;
    }

    case DOM_TYPES.FRAGMENT: {
      createFragmentNodes(vdom, parentEl);
      break;
    }

    default:
      throw new Error(`Can't mount DOM of type: ${vdom.type}`);
  }
}

function createTextNode(vdom: ELEMENT_INTER, parentEl: HTMLElement) {
  const value: string = vdom.value as string;
  const textNode = document.createTextNode(value);
  vdom.el = textNode;
  parentEl.append(textNode);
}

function createFragmentNodes(vdom: ELEMENT_INTER, parentEl: HTMLElement) {
  const children: ELEMENT_INTER[] = vdom.children as ELEMENT_INTER[];
  vdom.el = parentEl;
  children.forEach((child) => mountDOM(child, parentEl));
}

function createElementNode(vdom: ELEMENT_INTER, parentEl: HTMLElement) {
  const tag: string = vdom.tag as string;
  const props: object = vdom.props as PROPS_INTER;
  const children: ELEMENT_INTER[] = vdom.children as ELEMENT_INTER[];

  const element = document.createElement(tag);
  addProps(element, props, vdom);
  vdom.el = element;
  children.forEach((child) => mountDOM(child, element));
  parentEl.append(element);
}

function addProps(el: HTMLElement, props: PROPS_INTER, vdom: ELEMENT_INTER) {
  const { on: events, ...attrs } = props;

  vdom.listeners = addEventListeners(events, el);
  setAttributes(el, attrs);
}

export function addEventListeners(
  listeners = {},
  el: HTMLElement
): LISTENERS_INTER {
  const addedListeners: LISTENERS_INTER = {};

  Object.entries(listeners).forEach(([eventName, handler]) => {
    const listener = addEventListener(eventName, handler as () => void, el);
    addedListeners[eventName] = listener;
  });
  return addedListeners;
}

function addEventListener(
  eventName: string,
  handler: () => void,
  el: HTMLElement
): () => void {
  el.addEventListener(eventName, handler);
  return handler;
}

export function setAttributes(el: HTMLElement, attrs: PROPS_INTER) {
  const { class: className, style, ...otherAttrs } = attrs;

  if (className) {
    setClass(el, className);
  }

  if (style) {
    Object.entries(style).forEach(([prop, value]) => {
      setStyle(el, prop, value);
    });
  }

  for (const [name, value] of Object.entries(otherAttrs)) {
    setAttribute(el, name, value);
  }
}

function setClass(el: HTMLElement, className: string[] | string) {
  el.className = "";

  if (typeof className === "string") {
    el.className = className;
  }

  if (Array.isArray(className)) {
    el.classList.add(...className);
  }
}
