/**
 * @type {boolean}
 * @description Indicates whether the slot has been created.
 */

let createSlotCalled: boolean = false;

/**
 * Represents an HTML element or a text node.
 */
type ELEMENT_HTML = HTMLElement | Text;

/**
 * Represents a CSS class, which can be a single string or an array of strings.
 */
type CLASS_TYPE = string[] | string;

/**
 * Enum-like object defining different types of array operations.
 */
const ARRAY_DIFF_OP = {
  ADD: "add",
  REMOVE: "remove",
  MOVE: "move",
  NOOP: "noop",
} as const;

/**
 * Represents an item in a sequence comparison operation.
 */
interface SEQUEN_INTER {
  op: string;
  index: number;
  item: ELEMENT_INTER;
  originalIndex?: number;
  from?: number;
}

/**
 * Defines possible DOM node types.
 */
interface DOM_TYPES_INTER {
  SLOT: string;
  TEXT: string;
  ELEMENT: string;
  FRAGMENT: string;
  COMPONENT: string;
}

/**
 * Defines a style object where each key corresponds to a CSS property.
 */

interface STYLE_INTER {
  [key: string]: string;
}

/**
 * Defines properties that can be assigned to an element.
 */

interface PROPS_INTER {
  class?: CLASS_TYPE;
  on?: LISTENERS_INTER;
  style?: STYLE_INTER;
  key?: any;
  [key: string]: any;
}

/**
 * Defines event listeners for an element.
 */

interface LISTENERS_INTER {
  [key: string]: (event: any) => void;
}

/**
 * Represents an element structure used to create virtual DOM-like components.
 */

export interface ELEMENT_INTER {
  type: string;
  tag?: string | any;
  props?: PROPS_INTER;
  value?: string;
  children?: ELEMENT_INTER[];
  listeners?: LISTENERS_INTER;
  el?: ELEMENT_HTML;
  component?: any;
}

/**
 * Represents the differences between two objects.
 */

interface OBJECT_DIFF_INTER {
  added: string[];
  removed: string[];
  updated: string[];
}

/**
 * Represents the differences between two arrays.
 */
interface ARRAY_DIFF_INTER {
  added: (string | null)[];
  removed: (string | null)[];
}

/**
 * Constants representing different types of DOM nodes.
 */

const DOM_TYPES: DOM_TYPES_INTER = {
  SLOT: "slot",
  TEXT: "text",
  ELEMENT: "element",
  FRAGMENT: "fragment",
  COMPONENT: "component",
};

/**
 * Filters out `null` and `undefined` values from an array.
 *
 * @param array An array of virtual DOM elements (`ELEMENT_INTER`), strings, or `null`/`undefined` values.
 * @returns A new array containing only valid elements (i.e., excluding `null` and `undefined`).
 */

function withoutNulls(
  array: (ELEMENT_INTER | string | undefined | null)[]
): (ELEMENT_INTER | string)[] {
  return array.filter((e) => e != null);
}

/**
 * Converts all string elements in an array into virtual DOM text nodes.
 *
 * @param children An array of virtual DOM elements or strings.
 * @returns A new array where all string elements are converted to virtual DOM text nodes, and other elements remain unchanged.
 */

function mapTextNodes(children: (ELEMENT_INTER | string)[]): ELEMENT_INTER[] {
  return children.map((child) =>
    typeof child === "string" ||
    typeof child === "number" ||
    typeof child === "boolean" ||
    typeof child === "bigint" ||
    typeof child === "symbol"
      ? createString(child)
      : child
  );
}

/**
 * Creates a virtual DOM text node from a string.
 *
 * @param str The string value to be used as the text content of the text node.
 * @returns A virtual DOM text node object containing the string value.
 */

export function createString(str: string): ELEMENT_INTER {
  return {
    type: DOM_TYPES.TEXT,
    value: str,
  };
}

/**
 * Creates a virtual DOM fragment that can contain multiple child nodes, including text nodes and other virtual DOM elements.
 *
 * @param vNodes An array of virtual DOM nodes, strings, or undefined/null values. The function filters out the undefined and null values and processes text nodes.
 * @returns A virtual DOM fragment object containing the processed child nodes.
 */

export function createFragment(
  vNodes: (ELEMENT_INTER | string | undefined | null)[]
): ELEMENT_INTER {
  return {
    type: DOM_TYPES.FRAGMENT,
    children: mapTextNodes(withoutNulls(vNodes)),
  };
}

/**
 * Creates a virtual DOM element with the specified tag, properties, and children.
 *
 * @param tag The tag name of the element (e.g., "div", "span") or Component.
 * @param props An optional object containing properties (attributes) to be applied to the element.
 *              Defaults to an empty object if not provided.
 * @param children An optional array of child elements, text nodes, or null/undefined values.
 *                 The function filters out null/undefined values and processes text nodes.
 * @returns A virtual DOM element object that represents the specified element.
 */

export function createElement(
  tag: string | any,
  props: PROPS_INTER = {},
  children: (ELEMENT_INTER | string | undefined | null)[] = []
): ELEMENT_INTER {
  const type =
    typeof tag === "string" ? DOM_TYPES.ELEMENT : DOM_TYPES.COMPONENT;
  return {
    tag,
    props,
    children: mapTextNodes(withoutNulls(children)),
    type,
  };
}

/**
 * Creates a slot element with the given children.
 *
 * @param {Array<ELEMENT_INTER | string | undefined | null>} [children=[]] - The children elements of the slot.
 * @returns {ELEMENT_INTER} The created slot element.
 */

export function createSlot(
  children: (ELEMENT_INTER | string | undefined | null)[] = []
): ELEMENT_INTER {
  createSlotCalled = true;
  return {
    type: DOM_TYPES.SLOT,
    children: mapTextNodes(withoutNulls(children)),
  };
}

/**
 * Mounts a virtual DOM element to a specified parent HTML element.
 * This function supports mounting text nodes, regular DOM elements, and fragments.
 *
 * @param {ELEMENT_INTER} vdom - The virtual DOM element to mount, which can be of type TEXT, ELEMENT, or FRAGMENT.
 * @param {HTMLElement} parentEl - The parent HTML element where the virtual DOM will be appended.
 * @param {number | null | undefined} [index] - The optional index position where the element will be inserted. If not provided, the element will be appended to the end.
 * @param {any} [hostComponent=null] - The optional host component for handling the mounting context. Default is null.
 * @throws {Error} Throws an error if the virtual DOM type is unsupported.
 */

export function mountDOM(
  vdom: ELEMENT_INTER,
  parentEl: HTMLElement,
  index?: number | null,
  hostComponent: any = null
): void {
  switch (vdom.type) {
    case DOM_TYPES.TEXT:
      createTextNode(vdom, parentEl, index);
      break;

    case DOM_TYPES.ELEMENT:
      createElementNode(vdom, parentEl, index, hostComponent);
      break;

    case DOM_TYPES.FRAGMENT:
      createFragmentNodes(vdom, parentEl, index, hostComponent);
      break;

    case DOM_TYPES.COMPONENT: {
      createComponentNode(vdom, parentEl, index, hostComponent);
      enqueueJob(() => vdom.component.onMounted());
      break;
    }
    default:
      throw new Error(`Unsupported virtual DOM type: ${vdom.type}`);
  }
}

/**
 * Creates a text node from a virtual DOM text element and appends it to a parent HTML element.
 *
 * @param {ELEMENT_INTER} vdom - The virtual DOM element representing a text node. It must have a `value` property that is a string.
 * @param {HTMLElement} parentEl - The HTML element to which the text node will be appended.
 * @param {number | null | undefined} index - The optional index position where the text node should be inserted.
 * @returns {void}
 */

function createTextNode(
  vdom: ELEMENT_INTER,
  parentEl: HTMLElement,
  index: number | null | undefined
): void {
  const value: string = vdom.value as string;
  const textNode: Text = document.createTextNode(value);
  vdom.el = textNode;
  insert(textNode, parentEl, index);
}

/**
 * Creates a Fragment node from a virtual DOM element and appends its children to a parent HTML element.
 *
 * @param {ELEMENT_INTER} vdom - The virtual DOM element representing a Fragment node. It must have a `children` property that is an array of `ELEMENT_INTER` nodes.
 * @param {HTMLElement} parentEl - The HTML element to which the Fragment's children will be appended.
 * @param {number | null | undefined} index - The optional index position where the first child should be inserted. If not provided, children will be appended sequentially.
 * @param {any} hostComponent - The host component context that may be needed for mounting child elements.
 * @returns {void} This function does not return a value. It appends the Fragment's children to the parent element.
 */

function createFragmentNodes(
  vdom: ELEMENT_INTER,
  parentEl: HTMLElement,
  index: number | null | undefined,
  hostComponent: any
): void {
  const children: ELEMENT_INTER[] = vdom.children as ELEMENT_INTER[];
  vdom.el = parentEl;
  children.forEach((child, i) =>
    mountDOM(child, parentEl, index ? index + i : null, hostComponent)
  );
}

/**
 * Creates an Element node from a virtual DOM element and appends it to a parent HTML element.
 *
 * @param {ELEMENT_INTER} vdom - The virtual DOM element representing an Element node. It must have a `tag`, `props`, and `children` properties.
 * @param {HTMLElement} parentEl - The HTML element to which the created Element node will be appended.
 * @param {number | null | undefined} index - The optional index position where the Element node should be inserted. If not provided, the element will be appended at the end.
 * @param {any} [hostComponent=null] - The optional host component context that may be required for handling properties and lifecycle hooks.
 * @returns {void} This function does not return a value. It appends the created Element node to the parent element.
 */

function createElementNode(
  vdom: ELEMENT_INTER,
  parentEl: HTMLElement,
  index: number | null | undefined,
  hostComponent: any = null
): void {
  const tag: string = vdom.tag as string;
  // const props: object = vdom.props as PROPS_INTER;
  const children: ELEMENT_INTER[] = vdom.children as ELEMENT_INTER[];

  const element: HTMLElement = document.createElement(tag);
  addProps(element, vdom, hostComponent);
  vdom.el = element;
  children.forEach((child) => mountDOM(child, element, null, hostComponent));
  insert(element, parentEl, index);
}

/**
 * Creates and mounts a component node based on the virtual DOM element.
 *
 * @param {ELEMENT_INTER} vdom - The virtual DOM element representing the component.
 * @param {HTMLElement} parentEl - The parent HTML element where the component should be mounted.
 * @param {number | null | undefined} index - The index position where the component should be inserted.
 * @param {any} [hostComponent=null] - The host component that owns this component instance.
 */

function createComponentNode(
  vdom: ELEMENT_INTER,
  parentEl: HTMLElement,
  index: number | null | undefined,
  hostComponent: any = null
) {
  const Component = vdom.tag!;
  const children = vdom.children;
  const { props, events } = extractPropsAndEvents(vdom);
  const component = new Component(props, events, hostComponent);
  component.setExternalContent(children);
  component.setAppContext(hostComponent?.appContext ?? {});
  component.mount(parentEl, index);
  vdom.component = component;
  vdom.el = component.firstElement;
}

/**
 * Adds properties (attributes and event listeners) to an HTML element.
 *
 * @param {HTMLElement} el - The HTML element to which properties will be added.
 * @param {PROPS_INTER} props - An object containing attributes and event listeners for the element.
 *                The `on` property contains event listeners, while the rest are treated as attributes.
 * @param {ELEMENT_INTER} vdom - The virtual DOM element associated with the HTML element. The event listeners will be stored in this object.
 * @param {any} hostComponent - The host component context that may be needed for handling event listeners.
 * @returns {void} This function does not return a value. It adds attributes and event listeners to the HTML element.
 */

function addProps(
  el: HTMLElement,
  vdom: ELEMENT_INTER,
  hostComponent: any
): void {
  const { props: attrs, events } = extractPropsAndEvents(vdom);

  vdom.listeners = addEventListeners(events, el, hostComponent);
  setAttributes(el, attrs);
}

/**
 * Extracts props and event handlers from a virtual DOM element.
 *
 * @param {ELEMENT_INTER} vdom - The virtual DOM element containing properties and events.
 * @returns {{ props: object, events: object }} An object containing separated props and event handlers.
 */

export function extractPropsAndEvents(vdom: ELEMENT_INTER) {
  const { on: events = {}, ...props } = vdom.props!;
  delete props.key;
  return { props, events };
}

/**
 * Attaches event listeners to an HTML element and returns a reference to the added listeners.
 *
 * @param {Object} [listeners={}] - An object where the keys are event names (e.g., 'click', 'mouseover') and the values are corresponding event handler functions. Defaults to an empty object if no listeners are provided.
 * @param {HTMLElement} el - The HTML element to which the event listeners will be attached.
 * @param {any} [hostComponent=null] - The optional host component context that may be needed for handling event listeners.
 * @returns {LISTENERS_INTER} An object containing references to the added event listeners, keyed by event name.
 */

function addEventListeners(
  listeners = {},
  el: HTMLElement,
  hostComponent: any = null
): LISTENERS_INTER {
  const addedListeners: LISTENERS_INTER = {};

  Object.entries(listeners).forEach(([eventName, handler]) => {
    const listener = addEventListener(
      eventName,
      handler as () => void,
      el,
      hostComponent
    );
    addedListeners[eventName] = listener;
  });
  return addedListeners;
}

/**
 * Adds an event listener to an HTML element and returns the bound handler function.
 *
 * @param {string} eventName - The name of the event (e.g., 'click', 'mouseover').
 * @param {(event: Event) => void} handler - The event handler function to be called when the event is triggered.
 * @param {HTMLElement} el - The HTML element to which the event listener will be attached.
 * @param {any} [hostComponent=null] - The optional host component context that may be needed for handling the event in the context of the component.
 * @returns {Function} The event handler function that was added as the event listener, with the context of `hostComponent` if provided.
 */

function addEventListener(
  eventName: string,
  handler: (...args: any[]) => void,
  el: HTMLElement,
  hostComponent: any = null
): (...args: any[]) => void {
  function boundHandler(...args: any[]) {
    hostComponent ? handler.apply(hostComponent, args) : handler(...args);
  }

  el.addEventListener(eventName, boundHandler as EventListener);
  return boundHandler;
}

/**
 * Sets attributes, class, and style on an HTML element.
 *
 * @param el The HTML element to which the attributes will be applied.
 * @param attrs An object containing attributes, class, and style properties.
 *              - `class`: The class name(s) to be added to the element.
 *              - `style`: An object where keys are CSS property names and values are the corresponding CSS values.
 *              - Other properties in the object are treated as standard HTML attributes and will be set using `setAttribute`.
 * @returns void
 */

function setAttributes(el: HTMLElement, attrs: PROPS_INTER) {
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

/**
 * Sets the class name(s) on an HTML element.
 *
 * @param el The HTML element to which the class name(s) will be applied.
 * @param className A string or an array of strings representing the class name(s) to be added to the element.
 *                  If it's a string, it will set the `className` of the element.
 *                  If it's an array, all classes in the array will be added using `classList.add`.
 * @returns void
 */

function setClass(el: HTMLElement, className: string[] | string) {
  el.className = "";

  if (typeof className === "string") {
    el.className = className;
  }

  if (Array.isArray(className)) {
    el.classList.add(...className);
  }
}

/**
 * Sets a CSS style property on an HTML element.
 *
 * @param el The HTML element to which the style will be applied.
 * @param name The name of the CSS property to set (e.g., 'color', 'font-size').
 * @param value The value to assign to the CSS property (e.g., 'red', '16px').
 * @returns void
 */

function setStyle(el: HTMLElement, name: string, value: string) {
  el.style[name as any] = value;
}

/**
 * Removes a CSS style property from an HTML element.
 *
 * @param el The HTML element from which the style will be removed.
 * @param name The name of the CSS property to remove (e.g., 'color', 'font-size').
 * @returns void
 */

function removeStyle(el: HTMLElement, name: any) {
  delete el.style[name];
}

/**
 * Sets an attribute or property on an HTML element. If the value is `null`, it removes the attribute.
 *
 * @param el The HTML element on which to set the attribute.
 * @param name The name of the attribute or property (e.g., 'id', 'class', 'data-custom').
 * @param value The value to set for the attribute. If `null`, the attribute will be removed.
 *              If the attribute is a standard attribute or a data attribute (starts with 'data-'), it will be set using `setAttribute`.
 *              Otherwise, it will be set as a property on the element.
 * @returns void
 */

function setAttribute(el: HTMLElement, name: string, value: string | null) {
  if (value == null) {
    removeAttribute(el, name);
  } else if (name.startsWith("data-")) {
    el.setAttribute(name, value);
  } else {
    (el as any)[name] = value;
  }
}

/**
 * Removes an attribute or property from an HTML element.
 *
 * @param el The HTML element from which the attribute will be removed.
 * @param name The name of the attribute or property to remove (e.g., 'id', 'class', 'data-custom').
 * @returns void
 */

function removeAttribute(el: HTMLElement, name: string) {
  if (name in el) {
    (el as any)[name] = "";
  }
  el.removeAttribute(name);
}

/**
 * Destroys (removes) a virtual DOM element and its associated real DOM node.
 *
 * @param vdom The virtual DOM element to be destroyed. The function will check the type of the virtual DOM element
 *             (TEXT, ELEMENT, or FRAGMENT) and call the corresponding removal function for each type.
 * @returns void
 * @throws Error if the virtual DOM element's type is unsupported.
 */

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

    case DOM_TYPES.COMPONENT: {
      vdom.component.unmount();
      enqueueJob(() => vdom.component.onUnmounted());
      break;
    }

    default: {
      throw new Error(`Can't destroy DOM of type: ${type}`);
    }
  }

  delete vdom.el;
}

/**
 * Removes a text node from the DOM.
 *
 * @param vdom The virtual DOM element representing a text node. The function will remove the real DOM node associated with it.
 * @returns void
 */

function removeTextNode(vdom: ELEMENT_INTER) {
  const el = vdom.el;
  el?.remove();
}

/**
 * Removes an element node, its associated children, and event listeners from the DOM.
 *
 * @param vdom The virtual DOM element representing an HTML element. The function will:
 *             - Remove the real DOM node associated with `vdom.el`.
 *             - Recursively destroy and remove all child nodes (if any).
 *             - Remove event listeners associated with the element.
 * @returns void
 */

function removeElementNode(vdom: ELEMENT_INTER) {
  const { el, children, listeners } = vdom;

  el?.remove();
  children?.forEach(destroyDOM);

  if (listeners) {
    removeEventListeners(listeners, el as ELEMENT_HTML);
    delete vdom.listeners;
  }
}

/**
 * Removes event listeners from an HTML element.
 *
 * @param listeners An object where the keys are event names (e.g., 'click', 'mouseover') and the values are the event handler functions.
 *                  The default is an empty object if no listeners are provided.
 * @param el The HTML element from which the event listeners will be removed.
 * @returns void
 */

function removeEventListeners(
  listeners: LISTENERS_INTER = {},
  el: ELEMENT_HTML
) {
  Object.entries(listeners).forEach(([eventName, handler]) => {
    el?.removeEventListener(eventName, handler);
  });
}

/**
 * Removes all child nodes of a fragment node from the DOM.
 *
 * @param vdom The virtual DOM fragment element. The function will recursively destroy and remove all its child nodes.
 * @returns void
 */

function removeFragmentNodes(vdom: ELEMENT_INTER) {
  const { children } = vdom;
  children?.forEach(destroyDOM);
}

/**
 * A lightweight event dispatcher that allows subscribing to and dispatching commands with handlers.
 * Supports multiple handlers per command and global handlers that run after every command execution.
 */
export class Dispatcher {
  private subs = new Map<string, ((payload: any) => void)[]>();
  private afterHandlers: (() => void)[] = [];

  /**
   * Subscribes a handler to a specific command.
   *
   * @param {string} commandName - The name of the command to listen for.
   * @param {(payload: any) => void} handler - The function to execute when the command is dispatched.
   * @returns {() => void} A function to unsubscribe the handler from the command.
   */

  subscribe(commandName: string, handler: (payload: any) => void): () => void {
    if (!this.subs.has(commandName)) {
      this.subs.set(commandName, []);
    }

    const handlers = this.subs.get(commandName);
    if (handlers?.includes(handler)) {
      return () => {};
    }
    handlers?.push(handler);
    return () => {
      const idx = handlers?.indexOf(handler);
      if (idx == -1) {
        console.error("Subscribe function");
        return () => {};
      }
      handlers?.splice(idx as number, 1);
    };
  }

  /**
   * Registers a handler to be executed after every dispatched command.
   *
   * @param {() => void} handler - The function to execute after each command dispatch.
   * @returns {() => void} A function to unsubscribe the handler.
   */

  afterEveryCommand(handler: () => void): () => void {
    this.afterHandlers.push(handler);
    return () => {
      const idx = this.afterHandlers.indexOf(handler);
      this.afterHandlers.splice(idx, 1);
    };
  }

  /**
   * Dispatches a command, executing all subscribed handlers for that command.
   *
   * @param {string} commandName - The name of the command to dispatch.
   * @param {any} payload - The data to pass to the handlers.
   */

  dispatch(commandName: string, payload: any): void {
    if (this.subs.has(commandName)) {
      this.subs.get(commandName)?.forEach((handler) => handler(payload));
    } else {
      console.warn(`No handlers for command: ${commandName}`);
    }
    this.afterHandlers.forEach((handler) => handler());
  }
}
interface Reducers {
  [key: string]: (state: any, payload: any) => any;
}

interface AppInstance {
  mount: (parentEl: HTMLElement) => void;
  unmount: () => void;
}

/**
 * Creates an application instance with state management and view rendering.
 *
 * @param {Object} options - The application options.
 * @param {any} options.state - The initial state of the application.
 * @param {Function} options.view - A function that returns the virtual DOM representation of the UI.
 * @param {Reducers} [options.reducers={}] - An object containing reducer functions for state updates.
 * @returns {AppInstance} - The application instance with `mount` and `unmount` methods.
 */

export function createApp(
  RootComponent: any,
  props: any = {},
  options: any = {}
): AppInstance {
  let parentEl: HTMLElement | null = null;
  let vdom: ELEMENT_INTER | null = null;
  let isMounted: boolean = false;

  const context = {
    router: options.router || new NoopRouter(),
  };

  function reset() {
    parentEl = null;
    isMounted = false;
    vdom = null;
  }
  return {
    mount(_parentEl) {
      if (isMounted) {
        throw new Error("The application is already mounted");
      }

      parentEl = _parentEl;
      vdom = createElement(RootComponent, props);
      mountDOM(vdom, parentEl, null, { appContext: context });
      context.router.init();
      isMounted = true;
    },

    unmount() {
      if (!isMounted) {
        throw new Error("The application is not mounted");
      }

      destroyDOM(vdom!);
      context.router.destroy();
      reset();
    },
  };
}

/**
 * Compares two objects and returns the differences between them.
 *
 * This function determines which properties were added, removed, or updated
 * by comparing the keys and values of the old and new objects.
 *
 * @param {PROPS_INTER} oldObj - The original object.
 * @param {PROPS_INTER} newObj - The updated object to compare against the original.
 * @returns {OBJECT_DIFF_INTER} An object containing arrays of added, removed, and updated keys.
 */

function objectsDiff(
  oldObj: PROPS_INTER,
  newObj: PROPS_INTER
): OBJECT_DIFF_INTER {
  const added: string[] = [];
  const removed: string[] = [];
  const updated: string[] = [];

  for (const key in oldObj) {
    if (!(key in newObj)) {
      removed.push(key);
    } else if (oldObj[key] !== newObj[key]) {
      updated.push(key);
    }
  }
  for (const key in newObj) {
    if (!(key in oldObj)) {
      added.push(key);
    }
  }
  return {
    added,
    removed,
    updated,
  };
}

/**
 * Compares two arrays and returns the differences between them.
 *
 * This function identifies which elements have been added or removed between the two arrays.
 * It compares the values of `oldArray` and `newArray` and returns the differences in terms of
 * added and removed elements. The function assumes that null values are treated as distinct
 * elements for comparison.
 *
 * @param {Array<string | null>} oldArray - The original array to compare against.
 * @param {Array<string | null>} newArray - The updated array to compare with the original.
 * @returns {ARRAY_DIFF_INTER} An object containing:
 * - `added`: An array of elements that exist in `newArray` but not in `oldArray`.
 * - `removed`: An array of elements that exist in `oldArray` but not in `newArray`.
 */

function arraysDiff(
  oldArray: (string | null)[],
  newArray: (string | null)[]
): ARRAY_DIFF_INTER {
  return {
    added: newArray.filter((newItem) => !oldArray.includes(newItem)) ?? [],
    removed: oldArray.filter((oldItem) => !newArray.includes(oldItem)) ?? [],
  };
}

/**
 * Computes the differences between two arrays (`oldArray` and `newArray`) by determining
 * the sequence of operations required to transform the `oldArray` into the `newArray`.
 * The function accounts for item additions, removals, moves, and no-op operations.
 *
 * The operations are returned as a sequence of actions (insert, remove, move, etc.) in the form
 * of `SEQUEN_INTER` objects. This allows the changes to be applied to the arrays in the correct order.
 *
 * @param {ELEMENT_INTER[]} oldArray - The original array to compare against.
 * @param {ELEMENT_INTER[]} newArray - The updated array to compare with the original.
 * @param {function} equalsFn - A function used to compare elements for equality (used for detecting moves or unchanged items).
 * @returns {SEQUEN_INTER[]} An array of `SEQUEN_INTER` objects representing the operations required to transform `oldArray` into `newArray`.
 *
 * @example
 * const sequence = arraysDiffSequence(oldArray, newArray, equalsFn);
 * // sequence contains the sequence of operations to apply to oldArray to match newArray.
 */

function arraysDiffSequence(
  oldArray: ELEMENT_INTER[],
  newArray: ELEMENT_INTER[],
  equalsFn: any
): SEQUEN_INTER[] {
  const sequence: SEQUEN_INTER[] = [];
  const array = new ArrayWithOriginalIndices(oldArray, equalsFn);
  for (let index = 0; index < newArray.length; index++) {
    if (array.isRemoval(index, newArray)) {
      sequence.push(array.removeItem(index));
      index--;
      continue;
    }
    if (array.isNoop(index, newArray)) {
      sequence.push(array.noopItem(index));
      continue;
    }
    const item = newArray[index];
    if (array.isAddition(item, index)) {
      sequence.push(array.addItem(item, index));
      continue;
    }
    sequence.push(array.moveItem(item, index));
  }
  sequence.push(...array.removeItemsAfter(newArray.length));
  return sequence;
}

/**
 * A helper class that tracks the original indices of elements in an array
 * and provides methods for determining and performing changes (additions, removals, moves, etc.)
 * in a diffing operation between two arrays.
 *
 * This class is used to compute the sequence of operations required to transform one array into another,
 * taking into account element additions, removals, moves, and no-op (no operation) changes.
 * It also maintains the original indices of elements to support these operations.
 *
 * @class
 * @param {ELEMENT_INTER[]} array - The original array of elements to track.
 * @param {function} equalsFn - A function used to compare elements for equality.
 */

class ArrayWithOriginalIndices {
  private array: ELEMENT_INTER[] = [];
  private originalIndices: number[] = [];
  private equalsFn;

  /**
   * Constructs an instance of the ArrayWithOriginalIndices class.
   *
   * @param {ELEMENT_INTER[]} array - The array of elements to track.
   * @param {function} equalsFn - A function used to compare elements for equality.
   */

  constructor(array: ELEMENT_INTER[], equalsFn: any) {
    this.array = [...array];
    this.originalIndices = array.map((e: any, i: number) => i);
    this.equalsFn = equalsFn;
  }

  /**
   * Returns the length of the array.
   *
   * @returns {number} The length of the array.
   */

  get length(): number {
    return this.array.length;
  }

  /**
   * Determines if an item at a given index should be removed in the diffing operation.
   *
   * @param {number} index - The index to check for removal.
   * @param {ELEMENT_INTER[]} newArray - The new array to compare against.
   * @returns {boolean} `true` if the item is to be removed, otherwise `false`.
   */

  isRemoval(index: number, newArray: ELEMENT_INTER[]): boolean {
    if (index >= this.length) {
      return false;
    }
    const item = this.array[index];
    const indexInNewArray = newArray.findIndex((newItem) =>
      this.equalsFn(item, newItem)
    );
    return indexInNewArray === -1;
  }

  /**
   * Removes an item from the array at a given index and returns the operation object.
   *
   * @param {number} index - The index of the item to remove.
   * @returns {SEQUEN_INTER} The operation object representing the removal.
   */

  removeItem(index: number): SEQUEN_INTER {
    const operation = {
      op: ARRAY_DIFF_OP.REMOVE,
      index,
      item: this.array[index],
    };
    this.array.splice(index, 1);
    this.originalIndices.splice(index, 1);
    return operation;
  }

  /**
   * Determines if an item at a given index is a no-op (no operation) in the diffing operation.
   *
   * @param {number} index - The index to check for no-op.
   * @param {any} newArray - The new array to compare against.
   * @returns {boolean} `true` if the item is a no-op, otherwise `false`.
   */

  isNoop(index: number, newArray: any): boolean {
    if (index >= this.length) {
      return false;
    }
    const item = this.array[index];
    const newItem = newArray[index];
    return this.equalsFn(item, newItem);
  }

  /**
   * Gets the original index of the element at the given index.
   *
   * @param {number} index - The index of the element.
   * @returns {number} The original index of the element.
   */

  originalIndexAt(index: number): number {
    return this.originalIndices[index];
  }

  /**
   * Returns the no-op operation for an item at a given index.
   *
   * @param {number} index - The index of the element.
   * @returns {SEQUEN_INTER} The no-op operation object.
   */

  noopItem(index: number): SEQUEN_INTER {
    return {
      op: ARRAY_DIFF_OP.NOOP,
      originalIndex: this.originalIndexAt(index),
      index,
      item: this.array[index],
    };
  }

  /**
   * Determines if an item is an addition in the diffing operation.
   *
   * @param {ELEMENT_INTER} item - The item to check for addition.
   * @param {number} fromIdx - The index from which to start the search.
   * @returns {boolean} `true` if the item is an addition, otherwise `false`.
   */

  isAddition(item: ELEMENT_INTER, fromIdx: number): boolean {
    return this.findIndexFrom(item, fromIdx) === -1;
  }

  /**
   * Finds the index of an item starting from a given index.
   *
   * @param {ELEMENT_INTER} item - The item to search for.
   * @param {number} fromIndex - The index from which to start the search.
   * @returns {number} The index of the item, or -1 if not found.
   */

  findIndexFrom(item: ELEMENT_INTER, fromIndex: number): number {
    for (let i = fromIndex; i < this.length; i++) {
      if (this.equalsFn(item, this.array[i])) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Adds an item at a given index and returns the operation object.
   *
   * @param {ELEMENT_INTER} item - The item to add.
   * @param {number} index - The index at which to add the item.
   * @returns {SEQUEN_INTER} The operation object representing the addition.
   */

  addItem(item: ELEMENT_INTER, index: number): SEQUEN_INTER {
    const operation = {
      op: ARRAY_DIFF_OP.ADD,
      index,
      item,
    };
    this.array.splice(index, 0, item);
    this.originalIndices.splice(index, 0, -1);
    return operation;
  }

  /**
   * Moves an item from its current index to a new index and returns the operation object.
   *
   * @param {ELEMENT_INTER} item - The item to move.
   * @param {number} toIndex - The new index to move the item to.
   * @returns {SEQUEN_INTER} The operation object representing the move.
   */

  moveItem(item: ELEMENT_INTER, toIndex: number): SEQUEN_INTER {
    const fromIndex = this.findIndexFrom(item, toIndex);
    const operation = {
      op: ARRAY_DIFF_OP.MOVE,
      originalIndex: this.originalIndexAt(fromIndex),
      from: fromIndex,
      index: toIndex,
      item: this.array[fromIndex],
    };
    const [_item] = this.array.splice(fromIndex, 1);
    this.array.splice(toIndex, 0, _item);
    const [originalIndex] = this.originalIndices.splice(fromIndex, 1);
    this.originalIndices.splice(toIndex, 0, originalIndex);
    return operation;
  }

  /**
   * Removes all items after a specified index and returns the operations for the removals.
   *
   * @param {number} index - The index after which to remove items.
   * @returns {SEQUEN_INTER[]} The sequence of removal operations.
   */

  removeItemsAfter(index: number): SEQUEN_INTER[] {
    const operations = [];
    while (this.length > index) {
      operations.push(this.removeItem(index));
    }
    return operations;
  }
}

/**
 * Inserts an element (either `HTMLElement` or `Text`) into a parent element at a specified index.
 * If the index is `null` or `undefined`, the element will be appended to the parent element.
 * If the index is invalid (negative), an error will be thrown.
 *
 * @param {HTMLElement | Text} el - The element or text node to insert.
 * @param {HTMLElement} parentEl - The parent element where the element will be inserted.
 * @param {number | undefined | null} index - The index at which to insert the element. If `null` or `undefined`, the element is appended to the parent element.
 *                                            If the index is invalid (negative), an error will be thrown.
 * @throws {Error} Throws an error if the index is a negative number.
 * @returns {void} This function does not return anything; it modifies the DOM directly.
 */

function insert(
  el: HTMLElement | Text,
  parentEl: HTMLElement,
  index: number | undefined | null
): void {
  if (index == null) {
    parentEl.append(el);
    return;
  }
  if (index < 0) {
    throw new Error(`Index must be a positive integer, got ${index}`);
  }
  const children = parentEl.childNodes;
  if (index >= children.length) {
    parentEl.append(el);
  } else {
    parentEl.insertBefore(el, children[index]);
  }
}

/**
 * Compares two virtual DOM elements to check if they are equal based on their type and tag (for element nodes).
 * For text nodes, equality is determined solely by their type.
 * For element nodes, equality is determined by their tag name.
 *
 * @param {ELEMENT_INTER} nodeOne - The first virtual DOM element to compare.
 * @param {ELEMENT_INTER} nodeTwo - The second virtual DOM element to compare.
 * @returns {boolean} Returns `true` if the two virtual DOM elements are equal, otherwise `false`.
 */

function areNodesEqual(
  nodeOne: ELEMENT_INTER,
  nodeTwo: ELEMENT_INTER
): boolean {
  if (nodeOne.type !== nodeTwo.type) {
    return false;
  }
  if (nodeOne.type === DOM_TYPES.ELEMENT) {
    const { tag: tagOne } = nodeOne;
    const { tag: tagTwo } = nodeTwo;

    const keyOne: string = nodeOne?.props?.key;
    const keyTwo: string = nodeTwo?.props?.key;

    return tagOne === tagTwo && keyOne === keyTwo;
  }
  if (nodeOne.type === DOM_TYPES.COMPONENT) {
    const keyOne: string = nodeOne?.props?.key;
    const keyTwo: string = nodeTwo?.props?.key;

    const { tag: componentOne } = nodeOne;
    const { tag: componentTwo } = nodeTwo;
    return componentOne === componentTwo && keyOne === keyTwo;
  }
  return true;
}

/**
 * Finds the index of an element in its parent node's child nodes.
 *
 * @param {HTMLElement} parentEl - The parent HTML element whose child nodes are being checked.
 * @param {HTMLElement} el - The HTML element whose index is to be found within the parent element.
 * @returns {number | null} Returns the index of the element if found, otherwise returns `null`.
 */

function findIndexInParent(
  parentEl: HTMLElement,
  el: HTMLElement
): number | null {
  const index = Array.from(parentEl.childNodes).indexOf(el);
  if (index < 0) {
    return null;
  }
  return index;
}

/**
 * Checks if a given string is not empty.
 *
 * @param {string} str - The string to be checked.
 * @returns {boolean} Returns `true` if the string is not empty, otherwise `false`.
 */

function isNotEmptyString(str: string): boolean {
  return str !== "";
}

/**
 * Checks if a given string is not blank (not empty and does not only contain whitespace).
 *
 * @param {string} str - The string to be checked.
 * @returns {boolean} Returns `true` if the string is not blank, otherwise `false`.
 */

function isNotBlankOrEmptyString(str: string): boolean {
  return isNotEmptyString(str.trim());
}

/**
 * Patches the text content of an existing virtual DOM node if the text has changed.
 *
 * @param {ELEMENT_INTER} oldVdom - The previous virtual DOM element containing the old text value.
 * @param {ELEMENT_INTER} newVdom - The new virtual DOM element containing the new text value.
 * @returns {void} This function does not return anything, it modifies the existing DOM element directly.
 */

function patchText(oldVdom: ELEMENT_INTER, newVdom: ELEMENT_INTER): void {
  const el = oldVdom?.el as Text;
  const { value: oldText } = oldVdom;
  const { value: newText } = newVdom;
  if (oldText !== newText) {
    el.nodeValue = newText ?? "";
  }
}

/**
 * Patches an element in the DOM by updating its attributes, classes, styles, and event listeners based on the differences
 * between the old and new virtual DOM elements.
 *
 * @param {ELEMENT_INTER} oldVdom - The previous virtual DOM element containing the old properties, classes, and event listeners.
 * @param {ELEMENT_INTER} newVdom - The new virtual DOM element containing the new properties, classes, and event listeners.
 * @param {any} hostComponent - The host component context that may be required for handling component-specific changes.
 * @returns {void} This function does not return anything. It modifies the existing DOM element directly by applying changes.
 */

function patchElement(
  oldVdom: ELEMENT_INTER,
  newVdom: ELEMENT_INTER,
  hostComponent: any
): void {
  const el = oldVdom.el;
  const {
    class: oldClass,
    style: oldStyle,
    on: oldEvents,
    ...oldAttrs
  } = oldVdom?.props as PROPS_INTER;
  const {
    class: newClass,
    style: newStyle,
    on: newEvents,
    ...newAttrs
  } = newVdom.props as PROPS_INTER;

  const { listeners: oldListeners } = oldVdom;
  patchAttrs(el as HTMLElement, oldAttrs, newAttrs);
  patchClasses(
    el as HTMLElement,
    oldClass as CLASS_TYPE,
    newClass as CLASS_TYPE
  );
  patchStyles(el as HTMLElement, oldStyle, newStyle);
  newVdom.listeners = patchEvents(
    el as HTMLElement,
    oldListeners,
    oldEvents,
    newEvents,
    hostComponent
  );
}

/**
 * Patches the attributes of an HTML element by comparing the old and new virtual DOM attributes
 * and updating the element accordingly. It removes attributes that no longer exist, and adds or updates
 * attributes that have changed.
 *
 * @param {HTMLElement} el - The HTML element whose attributes are being patched.
 * @param {PROPS_INTER} oldAttrs - The old set of attributes from the previous virtual DOM.
 * @param {PROPS_INTER} newAttrs - The new set of attributes from the updated virtual DOM.
 * @returns {void} This function does not return anything; it directly modifies the attributes of the element.
 */

function patchAttrs(
  el: HTMLElement,
  oldAttrs: PROPS_INTER,
  newAttrs: PROPS_INTER
): void {
  const { added, removed, updated } = objectsDiff(oldAttrs, newAttrs);
  for (const attr of removed) {
    removeAttribute(el, attr);
  }
  for (const attr of added.concat(updated)) {
    setAttribute(el, attr, newAttrs[attr]);
  }
}

/**
 * Patches the classes of an HTML element by comparing the old and new class values.
 * It removes classes that are no longer present and adds new classes.
 *
 * @param {HTMLElement} el - The HTML element whose classes are being patched.
 * @param {CLASS_TYPE} oldClass - The old set of classes from the previous virtual DOM.
 * @param {CLASS_TYPE} newClass - The new set of classes from the updated virtual DOM.
 * @returns {void} This function does not return anything; it directly modifies the element's class list.
 */

function patchClasses(
  el: HTMLElement,
  oldClass: CLASS_TYPE,
  newClass: CLASS_TYPE
): void {
  const oldClasses = toClassList(oldClass);
  const newClasses = toClassList(newClass);
  const diff = arraysDiff(oldClasses, newClasses);
  const added: string[] = diff.added as string[];
  const removed: string[] = diff.removed as string[];

  if (removed.length > 0) {
    el.classList.remove(...removed);
  }
  if (added.length > 0) {
    el.classList.add(...added);
  }
}

/**
 * Converts a class value (either a string or an array) into an array of class names,
 * filtering out any blank or empty strings.
 *
 * @param {CLASS_TYPE} classes - The class value, which could be a string or an array.
 * @returns {string[]} An array of class names, excluding any blank or empty strings.
 */

function toClassList(classes: CLASS_TYPE): string[] {
  if (classes == null) return [];
  return Array.isArray(classes)
    ? classes.filter(isNotBlankOrEmptyString)
    : classes.split(/(\s+)/).filter(isNotBlankOrEmptyString);
}

/**
 * Patches the styles of an HTML element by comparing the old and new style values.
 * It removes styles that are no longer present and updates or adds new styles.
 *
 * @param {HTMLElement} el - The HTML element whose styles are being patched.
 * @param {STYLE_INTER} [oldStyle={}] - The old set of styles from the previous virtual DOM. Defaults to an empty object.
 * @param {STYLE_INTER} [newStyle={}] - The new set of styles from the updated virtual DOM. Defaults to an empty object.
 * @returns {void} This function does not return anything; it directly modifies the element's inline style.
 */

function patchStyles(
  el: HTMLElement,
  oldStyle: STYLE_INTER = {},
  newStyle: STYLE_INTER = {}
): void {
  const { added, removed, updated } = objectsDiff(oldStyle, newStyle);
  for (const style of removed) {
    removeStyle(el, style);
  }
  for (const style of added.concat(updated)) {
    setStyle(el, style, newStyle[style]);
  }
}

/**
 * Patches the event listeners of an HTML element by comparing the old and new event listener sets.
 * It removes event listeners that are no longer needed and adds or updates event listeners based on the new virtual DOM.
 *
 * @param {HTMLElement} el - The HTML element whose event listeners are being patched.
 * @param {LISTENERS_INTER} [oldListeners={}] - The old set of event listeners associated with the element. Defaults to an empty object.
 * @param {LISTENERS_INTER} [oldEvents={}] - The old set of event types and handlers from the previous virtual DOM. Defaults to an empty object.
 * @param {LISTENERS_INTER} [newEvents={}] - The new set of event types and handlers from the updated virtual DOM. Defaults to an empty object.
 * @param {any} hostComponent - The host component context that may be needed for managing event listener updates.
 * @returns {LISTENERS_INTER} A new object containing the added or updated event listeners, keyed by event name.
 */

function patchEvents(
  el: HTMLElement,
  oldListeners: LISTENERS_INTER = {},
  oldEvents: LISTENERS_INTER = {},
  newEvents: LISTENERS_INTER = {},
  hostComponent: any
): LISTENERS_INTER {
  const { removed, added, updated } = objectsDiff(oldEvents, newEvents);

  for (const eventName of removed.concat(updated)) {
    el.removeEventListener(eventName, oldListeners[eventName]);
  }

  const addedListeners: LISTENERS_INTER = {};
  for (const eventName of added.concat(updated)) {
    const listener = addEventListener(
      eventName,
      newEvents[eventName],
      el,
      hostComponent
    );
    addedListeners[eventName] = listener;
  }

  return addedListeners;
}

/**
 * Extracts the children elements from a virtual DOM node, including recursively extracting children from fragments.
 *
 * @param {ELEMENT_INTER} vdom - The virtual DOM node from which to extract the children.
 * @returns {ELEMENT_INTER[]} - An array of the child elements, with fragments flattened.
 */

function extractChildren(vdom: ELEMENT_INTER): ELEMENT_INTER[] {
  if (vdom.children == null) {
    return [];
  }
  const children: ELEMENT_INTER[] = [];
  for (const child of vdom.children) {
    if (child.type === DOM_TYPES.FRAGMENT) {
      children.push(...extractChildren(child));
    } else {
      children.push(child);
    }
  }
  return children;
}

/**
 * Patches the children of a virtual DOM node by applying the necessary operations (add, remove, move, or noop).
 * It compares the old and new virtual DOM children, determines the differences, and applies the changes to the actual DOM.
 *
 * @param {ELEMENT_INTER} oldVdom - The old virtual DOM node to compare against.
 * @param {ELEMENT_INTER} newVdom - The new virtual DOM node to patch.
 * @param {any} hostComponent - The host component context that may be needed for managing child element updates.
 * @returns {void} This function does not return anything. It modifies the DOM directly by applying the required operations.
 */

function patchChildren(
  oldVdom: ELEMENT_INTER,
  newVdom: ELEMENT_INTER,
  hostComponent: any
): void {
  const oldChildren = extractChildren(oldVdom);
  const newChildren = extractChildren(newVdom);
  const parentEl = oldVdom.el as HTMLElement;
  const diffSeq: SEQUEN_INTER[] = arraysDiffSequence(
    oldChildren,
    newChildren,
    areNodesEqual
  );

  for (const operation of diffSeq) {
    const { originalIndex, index, item } = operation;
    const offset = hostComponent?.offset ?? 0;

    switch (operation.op) {
      case ARRAY_DIFF_OP.ADD: {
        mountDOM(item, parentEl, index + offset, hostComponent);
        break;
      }
      case ARRAY_DIFF_OP.REMOVE: {
        destroyDOM(item);
        break;
      }
      case ARRAY_DIFF_OP.MOVE: {
        const oldChild = oldChildren[originalIndex!];
        const newChild = newChildren[index];
        const el = oldChild.el;
        const elAtTargetIndex = parentEl.childNodes[index + offset];

        parentEl.insertBefore(el as HTMLElement, elAtTargetIndex);
        patchDOM(oldChild, newChild, parentEl, hostComponent);
        break;
      }
      case ARRAY_DIFF_OP.NOOP: {
        patchDOM(
          oldChildren[originalIndex!],
          newChildren[index],
          parentEl,
          hostComponent
        );
        break;
      }
    }
  }
}

/**
 * Updates an existing component with new virtual DOM properties.
 *
 * @param {ELEMENT_INTER} oldVdom - The previous virtual DOM element containing the existing component instance.
 * @param {ELEMENT_INTER} newVdom - The new virtual DOM element with updated properties.
 */

function patchComponent(oldVdom: ELEMENT_INTER, newVdom: ELEMENT_INTER) {
  const { component } = oldVdom;
  const { children } = newVdom;
  const { props } = extractPropsAndEvents(newVdom);

  component.setExternalContent(children);
  component.updateProps(props);
  newVdom.component = component;
  newVdom.el = component.firstElement;
}

/**
 * Patches a DOM node by comparing the old and new virtual DOM nodes.
 * If the nodes are different, it destroys the old node and mounts the new one.
 * If they are the same, it updates the properties, attributes, and children of the existing node.
 *
 * @param {ELEMENT_INTER} oldVdom - The old virtual DOM node to compare against.
 * @param {ELEMENT_INTER} newVdom - The new virtual DOM node to patch.
 * @param {HTMLElement} parentEl - The parent element in which the patching will occur.
 * @param {any} [hostComponent=null] - The optional host component context for handling specific component logic during the patching process.
 * @returns {ELEMENT_INTER} The new virtual DOM node after patching.
 */

function patchDOM(
  oldVdom: ELEMENT_INTER,
  newVdom: ELEMENT_INTER,
  parentEl: HTMLElement,
  hostComponent: any = null
): ELEMENT_INTER {
  if (!areNodesEqual(oldVdom, newVdom)) {
    const index = findIndexInParent(parentEl, oldVdom?.el as HTMLElement);
    destroyDOM(oldVdom);
    mountDOM(newVdom, parentEl, index, hostComponent);
    return newVdom;
  }

  newVdom.el = oldVdom.el;
  switch (newVdom.type) {
    case DOM_TYPES.TEXT: {
      patchText(oldVdom, newVdom);
      return newVdom;
    }
    case DOM_TYPES.ELEMENT: {
      patchElement(oldVdom, newVdom, hostComponent);
      break;
    }
    case DOM_TYPES.COMPONENT: {
      patchComponent(oldVdom, newVdom);
      break;
    }
  }
  patchChildren(oldVdom, newVdom, hostComponent);
  return newVdom;
}

/**
 * Checks if an object has a property as its own property (not inherited).
 *
 * @param {any} obj - The object to check.
 * @param {string} prop - The property name to check.
 * @returns {boolean} True if the object has the property as its own property, false otherwise.
 */
function hasOwnProperty(obj: any, prop: string) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * Interface defining a component with state, props, render, and lifecycle methods.
 *
 * @template State - The type of the state object.
 * @template Props - The type of the props object.
 */
export interface IComponent<State = {}, Props = {}> {
  state: State;
  props: Props;

  /**
   * Unmounts the component, cleaning up resources.
   */
  unmount(): void;

  /**
   * Renders the component and returns the virtual DOM element.
   *
   * @returns {ELEMENT_INTER} The rendered virtual DOM element.
   */
  render(): ELEMENT_INTER;

  /**
   * Updates the state of the component with a partial state.
   *
   * @param {Partial<State>} state - The partial state to update the component with.
   */
  updateState(state: Partial<State>): void;

  /**
   * Updates the State with Props of the component with a partial state.
   *
   * @param {Props} props - The Props to update the component with.
   */
  updateProps(props: Props): void;

  /**
   * Emits an event with the specified name and payload.
   *
   * @param {string} eventName - The name of the event to emit.
   * @param {any} payload - The data to send with the event.
   */
  emit(eventName: string, payload: any): void;

  /**
   * Mounts the component to a specified host element at an optional index position.
   *
   * @param {HTMLElement} hostEl - The HTML element to mount the component to.
   * @param {number | null} index - The optional index position where the component should be mounted.
   */
  mount(hostEl: HTMLElement, index: number | null): void;

  /**
   * Gets all the elements rendered by the component.
   *
   * @returns {(ELEMENT_HTML | undefined)[]} An array of elements rendered by the component.
   */
  get elements(): (ELEMENT_HTML | undefined)[];

  /**
   * Gets the first element rendered by the component.
   *
   * @returns {ELEMENT_HTML | undefined} The first element rendered by the component.
   */
  get firstElement(): ELEMENT_HTML | undefined;

  /**
   * Gets the offset of the first element in the host element.
   *
   * @returns {number} The offset of the first element within the host element.
   */
  get offset(): number;
  get getAppContext(): any;
  get getHtmlElement(): any;
}

/**
 * Define Empty Function
 */
const emptyFn = () => {};

/**
 * Defines a component with state and methods, implementing lifecycle methods.
 *
 * @template State - The type of the state object.
 * @template Props - The type of the props object.
 *
 * @param {Object} methods - The methods to add to the component class.
 * @param {() => ELEMENT_INTER} render - The render function for the component that returns the virtual DOM.
 * @param {State} [state] - A function to derive the initial state from the props.
 * @returns {typeof Component} The defined component class.
 */
export function defineComponent<State = {}, Props = {}>({
  render,
  state,
  onMounted = emptyFn,
  onUnmounted = emptyFn,
  ...methods
}: {
  render: () => ELEMENT_INTER;
  state?: (props: Props) => State;
} & Record<string, (...args: any[]) => any>) {
  /**
   * A class representing a component with lifecycle methods like mount, unmount, and state updates.
   */
  class Component implements IComponent<State, Props> {
    private isMounted: boolean = false;
    private vdom: ELEMENT_INTER | null = null;
    private hostEl: HTMLElement | null = null;

    private eventHandlers: any = null;
    private parentComponent: any = null;

    private dispatcher: any = new Dispatcher();
    private subscriptions: any[] = [];
    private children: (ELEMENT_INTER | string | undefined | null)[] = [];
    private appContext: any = null;

    public state: State;
    public props: Props;

    /**
     * Constructor to initialize the component with props.
     *
     * @param {Props} props - The props to initialize the component with.
     */
    constructor(props: Props, eventHandlers = {}, parentComponent = null) {
      this.props = props;
      this.state = state ? state(props) : ({} as State);
      this.eventHandlers = eventHandlers;
      this.parentComponent = parentComponent;
    }

    /**
     * Renders the component and returns the virtual DOM.
     *
     * @returns {ELEMENT_INTER} The rendered virtual DOM element.
     */
    render(): ELEMENT_INTER {
      const vdom = render.call(this);
      if (didCreateSlot()) {
        fillSlots(vdom, this.children);
        resetDidCreateSlot();
      }
      return vdom;
    }

    /**
     * Sets the external content for this element.
     *
     * @param {Array<ELEMENT_INTER | string | undefined | null>} children - The new children elements.
     */

    setExternalContent(
      children: (ELEMENT_INTER | string | undefined | null)[]
    ) {
      this.children = children;
    }

    /**
     * Mounts the component to the given host element.
     *
     * @param {HTMLElement} hostEl - The HTML element to mount the component to.
     * @param {number | null} index - The optional index position where the component should be mounted.
     */
    mount(hostEl: HTMLElement, index: number | null = null): void {
      if (this.isMounted) {
        throw new Error("Component is already mounted");
      }
      this.vdom = this.render();
      mountDOM(this.vdom, hostEl, index, this);
      this.wireEventHandlers();
      this.hostEl = hostEl;
      this.isMounted = true;
    }

    /**
     * Unmounts the component and cleans up resources.
     */
    unmount(): void {
      if (!this.isMounted) {
        throw new Error("Component is not mounted");
      }
      destroyDOM(this.vdom!);
      this.subscriptions.forEach((unsubscribe) => unsubscribe());
      this.vdom = null;
      this.hostEl = null;
      this.isMounted = false;
      this.subscriptions = [];
    }

    /**
     * Gets all the elements rendered by the component.
     *
     * @returns {(ELEMENT_HTML | undefined)[]} An array of elements rendered by the component.
     */
    get elements(): (ELEMENT_HTML | undefined)[] {
      if (this.vdom == null) {
        return [];
      }
      if (this.vdom.type === DOM_TYPES.FRAGMENT) {
        return extractChildren(this.vdom).flatMap((child) => {
          if (child.type === DOM_TYPES.COMPONENT) {
            return child.component.elements;
          }
          return [child.el];
        });
      }
      return [this.vdom.el];
    }

    /**
     * Gets the first element rendered by the component.
     *
     * @returns {ELEMENT_HTML | undefined} The first element rendered by the component.
     */
    get firstElement(): ELEMENT_HTML | undefined {
      return this.elements[0];
    }

    /**
     * Gets the offset of the first element in the host element.
     *
     * @returns {number} The offset of the first element within the host element.
     */
    get offset(): number {
      if (this.vdom?.type === DOM_TYPES.FRAGMENT) {
        if (this.firstElement == undefined) return -1;
        return Array.from(this.hostEl!.children).indexOf(
          this.firstElement as HTMLElement
        );
      }
      return 0;
    }

    /**
     * Updates the component's props with the given partial properties and triggers a patch.
     * @param {Partial<Props>} props - The partial properties to update.
     */
    updateProps(props: Partial<Props>) {
      this.props = { ...this.props, ...props };
      this.patch();
    }

    /**
     * Updates the state with a partial state and re-renders the component.
     *
     * @param {Partial<State>} state - The partial state to update the component with.
     */
    updateState(state: Partial<State>): void {
      this.state = { ...this.state, ...state };
      this.patch();
    }

    /**
     * Emits an event by dispatching it with the specified payload.
     * @param {string} eventName - The name of the event to emit.
     * @param {any} payload - The data to send with the event.
     */
    emit(eventName: string, payload: any) {
      this.dispatcher.dispatch(eventName, payload);
    }

    /**
     * Patches the component by re-rendering it with the updated state.
     */
    private patch(): void {
      if (!this.isMounted) {
        throw new Error("Component is not mounted");
      }
      const vdom = this.render();
      this.vdom = patchDOM(this.vdom!, vdom, this.hostEl!, this);
    }

    /**
     * Wires all event handlers by subscribing them to their respective events.
     * @private
     */
    private wireEventHandlers() {
      this.subscriptions = Object.entries(this.eventHandlers).map(
        ([eventName, handler]) => this.wireEventHandler(eventName, handler)
      );
    }

    /**
     * Wires a single event handler by subscribing it to the specified event.
     * @private
     * @param {string} eventName - The name of the event to subscribe to.
     * @param {any} handler - The function to handle the event.
     * @returns {any} A subscription reference from the dispatcher.
     */
    private wireEventHandler(eventName: string, handler: any): any {
      return this.dispatcher.subscribe(eventName, (payload: any) => {
        if (this.parentComponent) {
          handler.call(this.parentComponent, payload);
        } else {
          handler(payload);
        }
      });
    }

    /**
     * Lifecycle hook that runs when the component is mounted.
     * @returns {Promise<void>} A promise that resolves when the mounted hook is executed.
     */
    onMounted(): Promise<void> {
      return Promise.resolve(onMounted.call(this));
    }

    /**
     * Lifecycle hook that runs when the component is unmounted.
     * @returns {Promise<void>} A promise that resolves when the unmounted hook is executed.
     */
    onUnmounted(): Promise<void> {
      return Promise.resolve(onUnmounted.call(this));
    }

    /**
     * Sets the application context for the current instance.
     *
     * @param appContext - The application context to be set.
     */
    setAppContext(appContext: any) {
      this.appContext = appContext;
    }

    /**
     * Gets the current application context.
     *
     * @returns The application context associated with the current instance.
     */
    get getAppContext() {
      return this.appContext;
    }

    get getHtmlElement() {
      return this.vdom?.el!;
    }
  }

  for (const methodName in methods) {
    if (hasOwnProperty(Component, methodName)) {
      throw new Error(
        `Method "${methodName}()" already exists in the component.`
      );
    }
    (Component.prototype as any)[methodName] = methods[methodName];
  }

  return Component;
}

let isScheduled = false;
const jobs: any[] = [];

/**
 * Enqueues a job to be processed in the next microtask.
 * @param {any} job - The job function to enqueue.
 */
export function enqueueJob(job: any) {
  jobs.push(job);
  scheduleUpdate();
}

/**
 * Schedules the job processing if it is not already scheduled.
 * Ensures that job execution happens in the next microtask.
 * @private
 */
function scheduleUpdate() {
  if (isScheduled) return;
  isScheduled = true;
  queueMicrotask(processJobs);
}

/**
 * Processes the queued jobs in order. Each job is executed and its result
 * is handled as a resolved or rejected promise.
 * @private
 */
function processJobs() {
  while (jobs.length > 0) {
    const job = jobs.shift();
    const result = job();
    Promise.resolve(result).then(
      () => {},
      (error) => {
        console.error(`[scheduler]: ${error}`);
      }
    );
  }
  isScheduled = false;
}

/**
 * Schedules an update and then flushes any pending promises.
 * This function allows for executing tasks in the next event loop cycle after the update.
 *
 * @returns {Promise} A promise that resolves once all pending promises are flushed.
 */
export function nextTick() {
  scheduleUpdate();
  return flushPromises();
}

/**
 * Flushes any pending promises by resolving them after a delay.
 * This ensures that any tasks scheduled in the event loop are executed.
 *
 * @returns {Promise} A promise that resolves after the next event loop cycle.
 */
function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve));
}

/**
 * Performs a depth-first traversal on the virtual DOM.
 *
 * @param {ELEMENT_INTER | null} vdom - The virtual DOM node to traverse.
 * @param {Function} processNode - The function to process each node.
 * @param {Function} [shouldSkipBranch=() => false] - A function to determine if a branch should be skipped.
 * @param {ELEMENT_INTER | null} [parentNode=null] - The parent node.
 * @param {number | null} [index=null] - The index of the current node in its parent's children array.
 */

function traverseDFS(
  vdom: ELEMENT_INTER | null,
  processNode: any,
  shouldSkipBranch: any = () => false,
  parentNode: ELEMENT_INTER | null = null,
  index: number | null = null
) {
  if (shouldSkipBranch(vdom)) return;

  processNode(vdom, parentNode, index);

  if (vdom?.children) {
    vdom.children.forEach((child, i) =>
      traverseDFS(child, processNode, shouldSkipBranch, vdom, i)
    );
  }
}

/**
 * Fills slots in the virtual DOM with external content.
 *
 * @param {ELEMENT_INTER | null} vdom - The virtual DOM node.
 * @param {any[]} [externalContent=[]] - The external content to insert into slots.
 */

function fillSlots(vdom: ELEMENT_INTER | null, externalContent: any = []) {
  function processNode(node: any, parent: any, index: any) {
    insertViewInSlot(node, parent, index, externalContent);
  }

  traverseDFS(vdom, processNode, shouldSkipBranch);
}

/**
 * Inserts external content into a slot node in the virtual DOM.
 *
 * @param {any} node - The current node being processed.
 * @param {any} parent - The parent node of the slot.
 * @param {any} index - The index of the slot in the parent's children.
 * @param {any} externalContent - The external content to insert.
 */

function insertViewInSlot(
  node: any,
  parent: any,
  index: any,
  externalContent: any
) {
  if (node.type !== DOM_TYPES.SLOT) return;

  const defaultContent = node.children;
  const views = externalContent.length > 0 ? externalContent : defaultContent;

  const hasContent = views.length > 0;
  if (hasContent) {
    parent.children.splice(index, 1, createFragment(views));
  } else {
    parent.children.splice(index, 1);
  }
}

/**
 * Determines if a branch should be skipped during traversal.
 *
 * @param {ELEMENT_INTER} node - The node to check.
 * @returns {boolean} True if the branch should be skipped, otherwise false.
 */

function shouldSkipBranch(node: ELEMENT_INTER): boolean {
  return node.type === DOM_TYPES.COMPONENT;
}

/**
 * Checks if a slot was created.
 *
 * @returns {boolean} True if a slot was created, otherwise false.
 */
function didCreateSlot(): boolean {
  return createSlotCalled;
}

/**
 * Resets the slot creation flag.
 */

function resetDidCreateSlot() {
  createSlotCalled = false;
}

const CATCH_ALL_ROUTE = "*";

/**
 * Creates a route matcher function based on whether the given route contains parameters.
 *
 * @param route - The route pattern, which can be a string or object representing a path.
 * @returns A matcher function that can be used to check if a path matches the given route,
 *          with or without parameters.
 */

export function makeRouteMatcher(route: any) {
  return routeHasParams(route)
    ? makeMatcherWithParams(route)
    : makeMatcherWithoutParams(route);
}

/**
 * Checks if the given route path contains parameters.
 *
 * @param param0 - An object containing the route path as a string.
 * @param param0.path - The route path to inspect.
 * @returns `true` if the path includes a parameter (denoted by ':'), otherwise `false`.
 */

function routeHasParams({ path }: { path: string }) {
  return path.includes(":");
}

/**
 * Creates a route matcher for routes that contain dynamic parameters.
 *
 * @param route - The route object which includes a path with parameters and optionally a redirect.
 * @returns An object containing:
 *  - `route`: The original route object.
 *  - `isRedirect`: A boolean indicating if the route has a redirect.
 *  - `checkMatch`: A function that tests if a given path matches the route's regex.
 *  - `extractParams`: A function that extracts dynamic parameters from the path.
 *  - `extractQuery`: A function to extract query parameters from the path.
 */

export function makeMatcherWithParams(route: any) {
  const regex = makeRouteWithParamsRegex(route);
  const isRedirect = typeof route.redirect === "string";

  return {
    route,
    isRedirect,
    checkMatch(path: string) {
      return regex.test(path);
    },
    extractParams(path: string) {
      const { groups } = regex.exec(path)!;
      return groups;
    },
    extractQuery,
  };
}

/**
 * Converts a route path with parameters into a regular expression with named capture groups.
 *
 * @param param0 - An object containing the route path as a string.
 * @param param0.path - The route path that may include parameters prefixed with ':'.
 * @returns A `RegExp` that matches the path and captures parameter values in named groups.
 */

function makeRouteWithParamsRegex({ path }: { path: string }) {
  const regex = path.replace(
    /:([^/]+)/g,
    (_, paramName) => `(?<${paramName}>[^/]+)`
  );

  return new RegExp(`^${regex}$`);
}

/**
 * Creates a route matcher for static routes that do not contain dynamic parameters.
 *
 * @param route - The route object which includes a static path and optionally a redirect.
 * @returns An object containing:
 *  - `route`: The original route object.
 *  - `isRedirect`: A boolean indicating if the route has a redirect.
 *  - `checkMatch`: A function that tests if a given path matches the static route.
 *  - `extractParams`: A function that returns an empty object, as there are no parameters to extract.
 *  - `extractQuery`: A function to extract query parameters from the path.
 */

export function makeMatcherWithoutParams(route: any) {
  const regex = makeRouteWithoutParamsRegex(route);
  const isRedirect = typeof route.redirect === "string";

  return {
    route,
    isRedirect,
    checkMatch(path: string) {
      return regex.test(path);
    },
    extractParams() {
      return {};
    },
    extractQuery,
  };
}

/**
 * Converts a static route path into a regular expression.
 * If the route path is a catch-all route, it returns a regular expression that matches any path.
 *
 * @param param0 - An object containing the route path as a string.
 * @param param0.path - The static route path to convert into a regular expression.
 * @returns A `RegExp` that matches the static path, or a catch-all regular expression if the path is a wildcard.
 */

function makeRouteWithoutParamsRegex({ path }: { path: string }) {
  if (path === CATCH_ALL_ROUTE) {
    return new RegExp("^.*$");
  }

  return new RegExp(`^${path}$`);
}

/**
 * Extracts query parameters from a URL path.
 *
 * @param path - The URL path which may include query parameters after a '?' character.
 * @returns An object where the keys are query parameter names and the values are their corresponding values.
 *          If no query parameters are found, an empty object is returned.
 */

function extractQuery(path: string) {
  const queryIndex = path.indexOf("?");

  if (queryIndex === -1) {
    return {};
  }

  const search = new URLSearchParams(path.slice(queryIndex + 1));

  return Object.fromEntries(search.entries());
}
/**
 * A class that implements a hash-based router for navigating between routes in a web application.
 * It supports route matching, subscribing to route changes, and handling query parameters.
 */
const ROUTER_EVENT = "router-event";

/**
 * HashRouter class for managing routes based on the URL hash.
 * Provides functionality for subscribing to route changes, navigating to different routes,
 * and handling route parameters and query strings.
 */
export class HashRouter {
  private matchers: any[] = [];
  private isInitialized: boolean = false;
  private onPopState: any = () => this.matchCurrentRoute();

  private matchedRoute: any = null;

  private params: object = {};
  private query: object = {};

  private dispatcher = new Dispatcher();
  private subscriptions = new WeakMap();
  private subscriberFns = new Set();

  /**
   * Subscribes a handler function to router events.
   *
   * @param handler - The function to handle route change events.
   */
  subscribe(handler: any) {
    const unsubscribe = this.dispatcher.subscribe(ROUTER_EVENT, handler);
    this.subscriptions.set(handler, unsubscribe);
    this.subscriberFns.add(handler);
  }

  /**
   * Unsubscribes a handler function from router events.
   *
   * @param handler - The handler function to unsubscribe.
   */
  unsubscribe(handler: any) {
    const unsubscribe = this.subscriptions.get(handler);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(handler);
      this.subscriberFns.delete(handler);
    }
  }

  /**
   * Getter for the currently matched route.
   *
   * @returns The currently matched route.
   */
  get getMatchedRoute() {
    return this.matchedRoute;
  }

  /**
   * Getter for the route parameters extracted from the current path.
   *
   * @returns An object containing the route parameters.
   */
  get getParams() {
    return this.params;
  }

  /**
   * Getter for the query parameters extracted from the current path.
   *
   * @returns An object containing the query parameters.
   */
  get getQuery() {
    return this.query;
  }

  /**
   * Constructor that initializes the router with a list of routes.
   *
   * @param routes - An array of route objects used to create route matchers.
   */
  constructor(routes: any[] = []) {
    this.matchers = routes.map(makeRouteMatcher);
  }

  /**
   * Initializes the router by setting up event listeners and ensuring the current route is matched.
   */
  async init() {
    if (this.isInitialized) {
      return;
    }
    if (document.location.hash === "") {
      window.history.replaceState({}, "", "#/");
    }

    window.addEventListener("popstate", this.onPopState);
    await this.matchCurrentRoute();
    this.isInitialized = true;
  }

  /**
   * Destroys the router instance by removing event listeners and cleaning up subscriptions.
   */
  destroy() {
    if (!this.isInitialized) {
      return;
    }
    window.removeEventListener("popstate", this.onPopState);
    Array.from(this.subscriberFns).forEach(this.unsubscribe, this);
    this.isInitialized = false;
  }

  /**
   * Navigates to a specific path and matches the appropriate route.
   *
   * @param path - The path to navigate to.
   * @returns A promise that resolves when the route has been matched.
   */
  async navigateTo(path: string): Promise<any> {
    const matcher = this.matchers.find((matcher) => matcher.checkMatch(path));

    if (matcher == null) {
      console.warn(`[Router] No route matches path "${path}"`);
      this.matchedRoute = null;
      this.params = {};
      this.query = {};
      return;
    }
    if (matcher.isRedirect) {
      return this.navigateTo(matcher.route.redirect);
    }
    const from = this.matchedRoute;
    const to = matcher.route;
    const {
      shouldNavigate,
      shouldRedirect,
      redirectPath,
    }: {
      shouldNavigate: boolean;
      shouldRedirect: boolean;
      redirectPath: string | null;
    } = await this.canChangeRoute(from, to);

    if (shouldRedirect) {
      return this.navigateTo(redirectPath!);
    }
    if (shouldNavigate) {
      this.matchedRoute = matcher.route;
      this.params = matcher.extractParams(path);
      this.query = matcher.extractQuery(path);
      this.pushState(path);
      this.dispatcher.dispatch(ROUTER_EVENT, { from, to, router: this });
    }
  }

  /**
   * Navigates the browser history back.
   */
  back() {
    window.history.back();
  }

  /**
   * Navigates the browser history forward.
   */
  forward() {
    window.history.forward();
  }

  /**
   * Gets the current route hash from the URL, excluding the '#' character.
   *
   * @returns The current route hash.
   */
  private get currentRouteHash() {
    const hash = document.location.hash;

    if (hash === "") {
      return "/";
    }

    return hash.slice(1);
  }

  /**
   * Matches the current route based on the current hash in the URL.
   *
   * @returns A promise that resolves when the route has been matched.
   */
  private async matchCurrentRoute() {
    return this.navigateTo(this.currentRouteHash);
  }

  /**
   * Pushes a new state to the browser history with the given path.
   *
   * @param path - The path to push to the history.
   */
  private pushState(path: string) {
    window.history.pushState({}, "", `#${path}`);
  }

  /**
   * Checks if the route can change from one route to another, based on any guards defined in the route.
   *
   * @param from - The route the user is navigating from.
   * @param to - The route the user is navigating to.
   * @returns An object indicating whether navigation should proceed, whether a redirect should occur,
   *          and the path to redirect to (if applicable).
   */
  async canChangeRoute(from: any, to: any) {
    const guard = to.beforeEnter;

    if (typeof guard !== "function") {
      return {
        shouldRedirect: false,
        shouldNavigate: true,
        redirectPath: null,
      };
    }

    const result = await guard(from?.path, to?.path);
    if (result === false) {
      return {
        shouldRedirect: false,
        shouldNavigate: false,
        redirectPath: null,
      };
    }

    if (typeof result === "string") {
      return {
        shouldRedirect: true,
        shouldNavigate: false,
        redirectPath: result,
      };
    }

    return {
      shouldRedirect: false,
      shouldNavigate: true,
      redirectPath: null,
    };
  }
}
/**
 * A no-operation router class that provides empty implementations for router methods.
 * Can be used as a fallback or mock implementation for routing functionality.
 */
export class NoopRouter {
  /**
   * Initializes the NoopRouter. Does nothing in this implementation.
   */
  init() {}

  /**
   * Destroys the NoopRouter. Does nothing in this implementation.
   */
  destroy() {}

  /**
   * Navigates to a specified path. Does nothing in this implementation.
   */
  navigateTo() {}

  /**
   * Navigates back in the browser history. Does nothing in this implementation.
   */
  back() {}

  /**
   * Navigates forward in the browser history. Does nothing in this implementation.
   */
  forward() {}

  /**
   * Subscribes to router events. Does nothing in this implementation.
   */
  subscribe() {}

  /**
   * Unsubscribes from router events. Does nothing in this implementation.
   */
  unsubscribe() {}
}

/**
 * Props for the RouterLink component.
 * Defines a `to` property to specify the target route to navigate to.
 */
interface RouterLinkProps {
  /**
   * The target path or route to navigate to when the link is clicked.
   */
  to: string;
}

/**
 * RouterLink component that renders an anchor (`<a>`) element.
 * When clicked, it prevents the default anchor behavior and navigates to the specified `to` path.
 */
export const RouterLink = defineComponent<void, RouterLinkProps>({
  /**
   * Renders the RouterLink component as an anchor (`<a>`) element.
   * Prevents the default click behavior and triggers navigation using the router.
   */
  render(this: IComponent<void, RouterLinkProps>) {
    const { to } = this.props!;

    return createElement(
      "a",
      {
        href: to,
        on: {
          /**
           * Handles the click event by preventing the default anchor behavior
           * and triggering navigation using the router.
           *
           * @param e - The click event object.
           */
          click: (e: any) => {
            e.preventDefault();
            this.getAppContext.router.navigateTo(to);
          },
        },
      },
      [createSlot()]
    );
  },
});

/**
 * State for the RouterOutlet component.
 * Holds the matched route and the subscription to router events.
 */
interface RouterOutletState {
  /**
   * The currently matched route object.
   */
  matchedRoute: any;

  /**
   * The subscription object to listen for route changes.
   */
  subscription: any;
}

/**
 * RouterOutlet component that renders the component for the currently matched route.
 * Subscribes to router events and updates the displayed component when the route changes.
 */
export const RouterOutlet = defineComponent<RouterOutletState>({
  /**
   * Initializes the state of the RouterOutlet component.
   */
  state() {
    return {
      matchedRoute: null,
      subscription: null,
    };
  },

  /**
   * Subscribes to route changes when the component is mounted.
   * Updates the component's state with the matched route.
   */
  onMounted(
    this: IComponent<RouterOutletState> & {
      handleRouteChange: (any: any) => void;
    }
  ) {
    const subscription = this.getAppContext?.router?.subscribe(
      ({ to }: { to: any }) => {
        this.handleRouteChange(to);
      }
    );

    this.updateState({ subscription });
  },

  /**
   * Unsubscribes from route changes when the component is unmounted.
   */
  onUnmounted(this: IComponent<RouterOutletState>) {
    const { subscription } = this.state;
    this.getAppContext.router.unsubscribe(subscription);
  },

  /**
   * Updates the component's state with the matched route.
   *
   * @param matchedRoute - The route object that is matched.
   */
  handleRouteChange(matchedRoute) {
    this.updateState({ matchedRoute });
  },

  /**
   * Renders the component based on the current matched route.
   * If a matched route exists, its component is rendered inside the router outlet.
   */
  render(this: IComponent<RouterOutletState>) {
    const { matchedRoute } = this.state;

    return createElement("div", { id: "router-outlet" }, [
      matchedRoute ? createElement(matchedRoute.component) : null,
    ]);
  },
});

class EventBus {
  private events: any;

  constructor() {
    this.events = {};
  }

  on(event: any, callback: any) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    // Return an unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(
        (cb: any) => cb !== callback
      );
    };
  }

  emit(event?: any, data?: any) {
    if (this.events[event]) {
      this.events[event].forEach((callback: any) => callback(data));
    }
  }
}

export const eventBus = new EventBus();
