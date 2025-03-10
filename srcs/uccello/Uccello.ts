interface DOM_TYPES_INTER {
  TEXT: string;
  ELEMENT: string;
  FRAGMENT: string;
}

interface ELEMENT_INTER {
  type: string;
  tag?: string;
  props?: object;
  value?: string;
  children?: ELEMENT_INTER[];
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
  props: object = {},
  children: (ELEMENT_INTER | string | undefined | null)[] = []
): ELEMENT_INTER {
  return {
    tag,
    props,
    children: mapTextNodes(withoutNulls(children)),
    type: DOM_TYPES.ELEMENT,
  };
}
