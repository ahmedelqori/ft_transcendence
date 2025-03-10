type ELEMENT_HTML = HTMLElement | Text | undefined;
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
  el?: ELEMENT_HTML;
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

export function setStyle(el: HTMLElement, name: string, value: string) {
  el.style[name as any] = value;
}

export function removeStyle(el: HTMLElement, name: any) {
  delete el.style[name];
}

export function setAttribute(
  el: HTMLElement,
  name: string,
  value: string | null
) {
  if (value == null) {
    removeAttribute(el, name);
  } else if (name.startsWith("data-") || name in el) {
    el.setAttribute(name, value);
  } else {
    (el as any)[name] = value;
  }
}

export function removeAttribute(el: HTMLElement, name: string) {
  if (name in el) {
    (el as any)[name] = "";
  }
  el.removeAttribute(name);
}

export function destroyDOM(vdom: ELEMENT_INTER) {
  const { type } = vdom;

  switch (type) {
    case DOM_TYPES.TEXT: {
      removeTextNode(vdom);
      break;
    }

    case DOM_TYPES.ELEMENT: {
      removeElementNode(vdom);
      break;
    }

    case DOM_TYPES.FRAGMENT: {
      removeFragmentNodes(vdom);
      break;
    }

    default: {
      throw new Error(`Can't destroy DOM of type: ${type}`);
    }
  }

  delete vdom.el;
}

function removeTextNode(vdom: ELEMENT_INTER) {
  const el = vdom.el;
  el?.remove();
}
function removeElementNode(vdom: ELEMENT_INTER) {
  const { el, children, listeners } = vdom;

  el?.remove();
  children?.forEach(destroyDOM);

  if (listeners) {
    removeEventListeners(listeners, el);
    delete vdom.listeners;
  }
}
export function removeEventListeners(
  listeners: LISTENERS_INTER = {},
  el: ELEMENT_HTML
) {
  Object.entries(listeners).forEach(([eventName, handler]) => {
    el?.removeEventListener(eventName, handler);
  });
}
function removeFragmentNodes(vdom: ELEMENT_INTER) {
  const { children } = vdom;
  children?.forEach(destroyDOM);
}
