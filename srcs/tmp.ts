// import { state } from "./../state";
// /**
//  * Represents an HTML element or a text node.
//  */
// type ELEMENT_HTML = HTMLElement | Text;

// /**
//  * Represents a CSS class, which can be a single string or an array of strings.
//  */
// type CLASS_TYPE = string[] | string;

// /**
//  * Enum-like object defining different types of array operations.
//  */
// const ARRAY_DIFF_OP = {
//   ADD: "add",
//   REMOVE: "remove",
//   MOVE: "move",
//   NOOP: "noop",
// } as const;

// /**
//  * Represents an item in a sequence comparison operation.
//  */
// interface SEQUEN_INTER {
//   op: string;
//   index: number;
//   item: ELEMENT_INTER;
//   originalIndex?: number;
//   from?: number;
// }

// /**
//  * Defines possible DOM node types.
//  */
// interface DOM_TYPES_INTER {
//   TEXT: string;
//   ELEMENT: string;
//   FRAGMENT: string;
// }

// /**
//  * Defines a style object where each key corresponds to a CSS property.
//  */

// interface STYLE_INTER {
//   [key: string]: string;
// }

// /**
//  * Defines properties that can be assigned to an element.
//  */

// interface PROPS_INTER {
//   class?: CLASS_TYPE;
//   on?: LISTENERS_INTER;
//   style?: STYLE_INTER;
//   [key: string]: any;
// }

// /**
//  * Defines event listeners for an element.
//  */

// interface LISTENERS_INTER {
//   [key: string]: (event: Event) => void;
// }

// /**
//  * Represents an element structure used to create virtual DOM-like components.
//  */

// interface ELEMENT_INTER {
//   type: string;
//   tag?: string;
//   props?: PROPS_INTER;
//   value?: string;
//   children?: ELEMENT_INTER[];
//   listeners?: LISTENERS_INTER;
//   el?: ELEMENT_HTML;
// }

// /**
//  * Represents the differences between two objects.
//  */

// interface OBJECT_DIFF_INTER {
//   added: string[];
//   removed: string[];
//   updated: string[];
// }

// /**
//  * Represents the differences between two arrays.
//  */
// interface ARRAY_DIFF_INTER {
//   added: (string | null)[];
//   removed: (string | null)[];
// }

// /**
//  * Constants representing different types of DOM nodes.
//  */

// const DOM_TYPES: DOM_TYPES_INTER = {
//   TEXT: "text",
//   ELEMENT: "element",
//   FRAGMENT: "fragment",
// };

// /**
//  * Filters out `null` and `undefined` values from an array.
//  *
//  * @param array An array of virtual DOM elements (`ELEMENT_INTER`), strings, or `null`/`undefined` values.
//  * @returns A new array containing only valid elements (i.e., excluding `null` and `undefined`).
//  */

// function withoutNulls(
//   array: (ELEMENT_INTER | string | undefined | null)[]
// ): (ELEMENT_INTER | string)[] {
//   return array.filter((e) => e != null);
// }

// /**
//  * Converts all string elements in an array into virtual DOM text nodes.
//  *
//  * @param children An array of virtual DOM elements or strings.
//  * @returns A new array where all string elements are converted to virtual DOM text nodes, and other elements remain unchanged.
//  */

// function mapTextNodes(children: (ELEMENT_INTER | string)[]): ELEMENT_INTER[] {
//   return children.map((child) =>
//     typeof child === "string" ? createString(child) : child
//   );
// }

// /**
//  * Creates a virtual DOM text node from a string.
//  *
//  * @param str The string value to be used as the text content of the text node.
//  * @returns A virtual DOM text node object containing the string value.
//  */

// export function createString(str: string): ELEMENT_INTER {
//   return {
//     type: DOM_TYPES.TEXT,
//     value: str,
//   };
// }

// /**
//  * Creates a virtual DOM fragment that can contain multiple child nodes, including text nodes and other virtual DOM elements.
//  *
//  * @param vNodes An array of virtual DOM nodes, strings, or undefined/null values. The function filters out the undefined and null values and processes text nodes.
//  * @returns A virtual DOM fragment object containing the processed child nodes.
//  */

// export function createFragment(
//   vNodes: (ELEMENT_INTER | string | undefined | null)[]
// ): ELEMENT_INTER {
//   return {
//     type: DOM_TYPES.FRAGMENT,
//     children: mapTextNodes(withoutNulls(vNodes)),
//   };
// }

// /**
//  * Creates a virtual DOM element with the specified tag, properties, and children.
//  *
//  * @param tag The tag name of the element (e.g., "div", "span").
//  * @param props An optional object containing properties (attributes) to be applied to the element.
//  *              Defaults to an empty object if not provided.
//  * @param children An optional array of child elements, text nodes, or null/undefined values.
//  *                 The function filters out null/undefined values and processes text nodes.
//  * @returns A virtual DOM element object that represents the specified element.
//  */

// export function createElement(
//   tag: string,
//   props: PROPS_INTER = {},
//   children: (ELEMENT_INTER | string | undefined | null)[] = []
// ): ELEMENT_INTER {
//   return {
//     tag,
//     props,
//     children: mapTextNodes(withoutNulls(children)),
//     type: DOM_TYPES.ELEMENT,
//   };
// }

// /**
//  * Mounts a virtual DOM element to a specified parent HTML element.
//  * This function supports text nodes, regular DOM elements, and fragments.
//  *
//  * @param {ELEMENT_INTER} vdom - The virtual DOM element to mount.
//  * @param {HTMLElement} parentEl - The parent HTML element where the virtual DOM will be appended.
//  * @param {number | null | undefined} [index] - The optional index position for inserting the element.
//  * @throws {Error} If the virtual DOM type is unsupported.
//  */

// export function mountDOM(
//   vdom: ELEMENT_INTER,
//   parentEl: HTMLElement,
//   index?: number | null
// ): void {
//   switch (vdom.type) {
//     case DOM_TYPES.TEXT:
//       createTextNode(vdom, parentEl, index);
//       break;

//     case DOM_TYPES.ELEMENT:
//       createElementNode(vdom, parentEl, index);
//       break;

//     case DOM_TYPES.FRAGMENT:
//       createFragmentNodes(vdom, parentEl, index);
//       break;

//     default:
//       throw new Error(`Unsupported virtual DOM type: ${vdom.type}`);
//   }
// }

// /**
//  * Creates a text node from a virtual DOM text element and appends it to a parent HTML element.
//  *
//  * @param {ELEMENT_INTER} vdom - The virtual DOM element representing a text node. It must have a `value` property that is a string.
//  * @param {HTMLElement} parentEl - The HTML element to which the text node will be appended.
//  * @param {number | null | undefined} index - The optional index position where the text node should be inserted.
//  * @returns {void}
//  */

// function createTextNode(
//   vdom: ELEMENT_INTER,
//   parentEl: HTMLElement,
//   index: number | null | undefined
// ): void {
//   const value: string = vdom.value as string;
//   const textNode: Text = document.createTextNode(value);
//   vdom.el = textNode;
//   insert(textNode, parentEl, index);
// }

// /**
//  * Creates a Fragment node from a virtual DOM element and appends its children to a parent HTML element.
//  *
//  * @param {ELEMENT_INTER} vdom - The virtual DOM element representing a Fragment node. It must have a `children` property that is an array of `ELEMENT_INTER`.
//  * @param {HTMLElement} parentEl - The HTML element to which the Fragment's children will be appended.
//  * @param {number | null | undefined} index - The optional index position where the first child should be inserted.
//  * @returns {void}
//  */

// function createFragmentNodes(
//   vdom: ELEMENT_INTER,
//   parentEl: HTMLElement,
//   index: number | null | undefined
// ): void {
//   const children: ELEMENT_INTER[] = vdom.children as ELEMENT_INTER[];
//   vdom.el = parentEl;
//   children.forEach((child, i) =>
//     mountDOM(child, parentEl, index ? index + i : null)
//   );
// }

// /**
//  * Creates an Element node from a virtual DOM element and appends it to a parent HTML element.
//  *
//  * @param {ELEMENT_INTER} vdom - The virtual DOM element representing an Element node. It must have a `tag`, `props`, and `children` properties.
//  * @param {HTMLElement} parentEl - The HTML element to which the created Element node will be appended.
//  * @param {number | null | undefined} index - The optional index position where the Element node should be inserted.
//  * @returns {void}
//  */

// function createElementNode(
//   vdom: ELEMENT_INTER,
//   parentEl: HTMLElement,
//   index: number | null | undefined
// ): void {
//   const tag: string = vdom.tag as string;
//   const props: object = vdom.props as PROPS_INTER;
//   const children: ELEMENT_INTER[] = vdom.children as ELEMENT_INTER[];

//   const element: HTMLElement = document.createElement(tag);
//   addProps(element, props, vdom);
//   vdom.el = element;
//   children.forEach((child) => mountDOM(child, element));
//   insert(element, parentEl, index);
// }

// /**
//  * Adds properties (attributes and event listeners) to an HTML element.
//  *
//  * @param el The HTML element to which properties will be added.
//  * @param props An object containing attributes and event listeners for the element.
//  *              The `on` property contains event listeners, while the rest are treated as attributes.
//  * @param vdom The virtual DOM element associated with the HTML element. The event listeners will be stored in this object.
//  * @returns void
//  */

// function addProps(el: HTMLElement, props: PROPS_INTER, vdom: ELEMENT_INTER) {
//   const { on: events, ...attrs } = props;

//   vdom.listeners = addEventListeners(events, el);
//   setAttributes(el, attrs);
// }

// /**
//  * Attaches event listeners to an HTML element and returns a reference to the added listeners.
//  *
//  * @param listeners An object where the keys are event names (e.g., 'click', 'mouseover') and the values are corresponding event handler functions.
//  *                  Defaults to an empty object if no listeners are provided.
//  * @param el The HTML element to which the event listeners will be attached.
//  * @returns An object containing references to the added event listeners, keyed by event name.
//  */

// function addEventListeners(listeners = {}, el: HTMLElement): LISTENERS_INTER {
//   const addedListeners: LISTENERS_INTER = {};

//   Object.entries(listeners).forEach(([eventName, handler]) => {
//     const listener = addEventListener(eventName, handler as () => void, el);
//     addedListeners[eventName] = listener;
//   });
//   return addedListeners;
// }

// /**
//  * Adds an event listener to an HTML element and returns the bound handler function.
//  *
//  * @param {string} eventName - The name of the event (e.g., 'click', 'mouseover').
//  * @param {(event: Event) => void} handler - The event handler function to be called when the event is triggered.
//  * @param {HTMLElement} el - The HTML element to which the event listener will be attached.
//  * @returns {(event: Event) => void} The event handler function that was added as the event listener.
//  */

// function addEventListener(
//   eventName: string,
//   handler: (event: Event) => void,
//   el: HTMLElement
// ): (event: Event) => void {
//   function boundHandler(event: any): void {
//     handler(event);
//   }
//   el.addEventListener(eventName, boundHandler);
//   return boundHandler;
// }

// /**
//  * Sets attributes, class, and style on an HTML element.
//  *
//  * @param el The HTML element to which the attributes will be applied.
//  * @param attrs An object containing attributes, class, and style properties.
//  *              - `class`: The class name(s) to be added to the element.
//  *              - `style`: An object where keys are CSS property names and values are the corresponding CSS values.
//  *              - Other properties in the object are treated as standard HTML attributes and will be set using `setAttribute`.
//  * @returns void
//  */

// function setAttributes(el: HTMLElement, attrs: PROPS_INTER) {
//   const { class: className, style, ...otherAttrs } = attrs;

//   if (className) {
//     setClass(el, className);
//   }

//   if (style) {
//     Object.entries(style).forEach(([prop, value]) => {
//       setStyle(el, prop, value);
//     });
//   }

//   for (const [name, value] of Object.entries(otherAttrs)) {
//     setAttribute(el, name, value);
//   }
// }

// /**
//  * Sets the class name(s) on an HTML element.
//  *
//  * @param el The HTML element to which the class name(s) will be applied.
//  * @param className A string or an array of strings representing the class name(s) to be added to the element.
//  *                  If it's a string, it will set the `className` of the element.
//  *                  If it's an array, all classes in the array will be added using `classList.add`.
//  * @returns void
//  */

// function setClass(el: HTMLElement, className: string[] | string) {
//   el.className = "";

//   if (typeof className === "string") {
//     el.className = className;
//   }

//   if (Array.isArray(className)) {
//     el.classList.add(...className);
//   }
// }

// /**
//  * Sets a CSS style property on an HTML element.
//  *
//  * @param el The HTML element to which the style will be applied.
//  * @param name The name of the CSS property to set (e.g., 'color', 'font-size').
//  * @param value The value to assign to the CSS property (e.g., 'red', '16px').
//  * @returns void
//  */

// function setStyle(el: HTMLElement, name: string, value: string) {
//   el.style[name as any] = value;
// }

// /**
//  * Removes a CSS style property from an HTML element.
//  *
//  * @param el The HTML element from which the style will be removed.
//  * @param name The name of the CSS property to remove (e.g., 'color', 'font-size').
//  * @returns void
//  */

// function removeStyle(el: HTMLElement, name: any) {
//   delete el.style[name];
// }

// /**
//  * Sets an attribute or property on an HTML element. If the value is `null`, it removes the attribute.
//  *
//  * @param el The HTML element on which to set the attribute.
//  * @param name The name of the attribute or property (e.g., 'id', 'class', 'data-custom').
//  * @param value The value to set for the attribute. If `null`, the attribute will be removed.
//  *              If the attribute is a standard attribute or a data attribute (starts with 'data-'), it will be set using `setAttribute`.
//  *              Otherwise, it will be set as a property on the element.
//  * @returns void
//  */

// function setAttribute(el: HTMLElement, name: string, value: string | null) {
//   if (value == null) {
//     removeAttribute(el, name);
//   } else if (name.startsWith("data-")) {
//     el.setAttribute(name, value);
//   } else {
//     (el as any)[name] = value;
//   }
// }

// /**
//  * Removes an attribute or property from an HTML element.
//  *
//  * @param el The HTML element from which the attribute will be removed.
//  * @param name The name of the attribute or property to remove (e.g., 'id', 'class', 'data-custom').
//  * @returns void
//  */

// function removeAttribute(el: HTMLElement, name: string) {
//   if (name in el) {
//     (el as any)[name] = "";
//   }
//   el.removeAttribute(name);
// }

// /**
//  * Destroys (removes) a virtual DOM element and its associated real DOM node.
//  *
//  * @param vdom The virtual DOM element to be destroyed. The function will check the type of the virtual DOM element
//  *             (TEXT, ELEMENT, or FRAGMENT) and call the corresponding removal function for each type.
//  * @returns void
//  * @throws Error if the virtual DOM element's type is unsupported.
//  */

// export function destroyDOM(vdom: ELEMENT_INTER) {
//   const { type } = vdom;

//   switch (type) {
//     case DOM_TYPES.TEXT: {
//       removeTextNode(vdom);
//       break;
//     }

//     case DOM_TYPES.ELEMENT: {
//       removeElementNode(vdom);
//       break;
//     }

//     case DOM_TYPES.FRAGMENT: {
//       removeFragmentNodes(vdom);
//       break;
//     }

//     default: {
//       throw new Error(`Can't destroy DOM of type: ${type}`);
//     }
//   }

//   delete vdom.el;
// }

// /**
//  * Removes a text node from the DOM.
//  *
//  * @param vdom The virtual DOM element representing a text node. The function will remove the real DOM node associated with it.
//  * @returns void
//  */

// function removeTextNode(vdom: ELEMENT_INTER) {
//   const el = vdom.el;
//   el?.remove();
// }

// /**
//  * Removes an element node, its associated children, and event listeners from the DOM.
//  *
//  * @param vdom The virtual DOM element representing an HTML element. The function will:
//  *             - Remove the real DOM node associated with `vdom.el`.
//  *             - Recursively destroy and remove all child nodes (if any).
//  *             - Remove event listeners associated with the element.
//  * @returns void
//  */

// function removeElementNode(vdom: ELEMENT_INTER) {
//   const { el, children, listeners } = vdom;

//   el?.remove();
//   children?.forEach(destroyDOM);

//   if (listeners) {
//     removeEventListeners(listeners, el as ELEMENT_HTML);
//     delete vdom.listeners;
//   }
// }

// /**
//  * Removes event listeners from an HTML element.
//  *
//  * @param listeners An object where the keys are event names (e.g., 'click', 'mouseover') and the values are the event handler functions.
//  *                  The default is an empty object if no listeners are provided.
//  * @param el The HTML element from which the event listeners will be removed.
//  * @returns void
//  */

// function removeEventListeners(
//   listeners: LISTENERS_INTER = {},
//   el: ELEMENT_HTML
// ) {
//   Object.entries(listeners).forEach(([eventName, handler]) => {
//     el?.removeEventListener(eventName, handler);
//   });
// }

// /**
//  * Removes all child nodes of a fragment node from the DOM.
//  *
//  * @param vdom The virtual DOM fragment element. The function will recursively destroy and remove all its child nodes.
//  * @returns void
//  */

// function removeFragmentNodes(vdom: ELEMENT_INTER) {
//   const { children } = vdom;
//   children?.forEach(destroyDOM);
// }

// /**
//  * A lightweight event dispatcher that allows subscribing to and dispatching commands with handlers.
//  * Supports multiple handlers per command and global handlers that run after every command execution.
//  */
// export class Dispatcher {
//   private subs = new Map<string, ((payload: any) => void)[]>();
//   private afterHandlers: (() => void)[] = [];

//   /**
//    * Subscribes a handler to a specific command.
//    *
//    * @param {string} commandName - The name of the command to listen for.
//    * @param {(payload: any) => void} handler - The function to execute when the command is dispatched.
//    * @returns {() => void} A function to unsubscribe the handler from the command.
//    */

//   subscribe(commandName: string, handler: (payload: any) => void): () => void {
//     if (!this.subs.has(commandName)) {
//       this.subs.set(commandName, []);
//     }

//     const handlers = this.subs.get(commandName);
//     if (handlers?.includes(handler)) {
//       return () => {};
//     }
//     handlers?.push(handler);
//     return () => {
//       const idx = handlers?.indexOf(handler);
//       if (idx == -1) {
//         console.error("Subscribe function");
//         return () => {};
//       }
//       handlers?.splice(idx as number, 1);
//     };
//   }

//   /**
//    * Registers a handler to be executed after every dispatched command.
//    *
//    * @param {() => void} handler - The function to execute after each command dispatch.
//    * @returns {() => void} A function to unsubscribe the handler.
//    */

//   afterEveryCommand(handler: () => void): () => void {
//     this.afterHandlers.push(handler);
//     return () => {
//       const idx = this.afterHandlers.indexOf(handler);
//       this.afterHandlers.splice(idx, 1);
//     };
//   }

//   /**
//    * Dispatches a command, executing all subscribed handlers for that command.
//    *
//    * @param {string} commandName - The name of the command to dispatch.
//    * @param {any} payload - The data to pass to the handlers.
//    */

//   dispatch(commandName: string, payload: any): void {
//     if (this.subs.has(commandName)) {
//       this.subs.get(commandName)?.forEach((handler) => handler(payload));
//     } else {
//       console.warn(`No handlers for command: ${commandName}`);
//     }
//     this.afterHandlers.forEach((handler) => handler());
//   }
// }
// interface Reducers {
//   [key: string]: (state: any, payload: any) => any;
// }

// interface AppInstance {
//   mount: (parentEl: HTMLElement) => void;
//   unmount: () => void;
// }

// /**
//  * Creates an application instance with state management and view rendering.
//  *
//  * @param {Object} options - The application options.
//  * @param {any} options.state - The initial state of the application.
//  * @param {Function} options.view - A function that returns the virtual DOM representation of the UI.
//  * @param {Reducers} [options.reducers={}] - An object containing reducer functions for state updates.
//  * @returns {AppInstance} - The application instance with `mount` and `unmount` methods.
//  */

// export function createApp({
//   state,
//   view,
//   reducers = {},
// }: {
//   state: any;
//   view: any;
//   reducers?: Reducers;
// }): AppInstance {
//   let parentEl: HTMLElement | null = null;
//   let vdom: ELEMENT_INTER | null = null;

//   const dispatcher = new Dispatcher();
//   const subscriptions = [dispatcher.afterEveryCommand(renderApp)];

//   /**
//    * Emits an event and dispatches it to the reducer.
//    *
//    * @param {string} eventName - The name of the event.
//    * @param {any} payload - The data to be passed to the reducer.
//    */
//   function emit(eventName: string, payload: any) {
//     dispatcher.dispatch(eventName, payload);
//   }

//   for (const actionName in reducers) {
//     const reducer = reducers[actionName];
//     const subs = dispatcher.subscribe(actionName, (payload: any) => {
//       state = reducer(state, payload);
//     });
//     subscriptions.push(subs);
//   }

//   /**
//    * Renders the application by destroying the previous virtual DOM
//    * and creating a new one from the view function.
//    *
//    * This function generates a new virtual DOM tree using the `view` function,
//    * then updates the existing virtual DOM by applying the necessary changes
//    * using the `patchDOM` function.
//    */

//   function renderApp() {
//     const newVdom = view(state, emit);
//     vdom = patchDOM(
//       vdom as ELEMENT_INTER,
//       newVdom as ELEMENT_INTER,
//       parentEl as HTMLElement
//     );
//   }

//   return {
//     /**
//      * Mounts the application to the given parent element.
//      *
//      * @param {HTMLElement} _parentEl - The parent DOM element to attach the app to.
//      */

//     mount(_parentEl: HTMLElement) {
//       parentEl = _parentEl;
//       vdom = view(state, emit);
//       mountDOM(vdom as ELEMENT_INTER, parentEl);
//     },

//     /**
//      * Unmounts the application, cleaning up the virtual DOM and subscriptions.
//      */

//     unmount() {
//       if (vdom) {
//         destroyDOM(vdom);
//       }
//       vdom = null;
//       subscriptions.forEach((unsubscribe) => unsubscribe());
//     },
//   };
// }

// /**
//  * Compares two objects and returns the differences between them.
//  *
//  * This function determines which properties were added, removed, or updated
//  * by comparing the keys and values of the old and new objects.
//  *
//  * @param {PROPS_INTER} oldObj - The original object.
//  * @param {PROPS_INTER} newObj - The updated object to compare against the original.
//  * @returns {OBJECT_DIFF_INTER} An object containing arrays of added, removed, and updated keys.
//  */

// function objectsDiff(
//   oldObj: PROPS_INTER,
//   newObj: PROPS_INTER
// ): OBJECT_DIFF_INTER {
//   const added: string[] = [];
//   const removed: string[] = [];
//   const updated: string[] = [];

//   for (const key in oldObj) {
//     if (!(key in newObj)) {
//       removed.push(key);
//     } else if (oldObj[key] !== newObj[key]) {
//       updated.push(key);
//     }
//   }
//   for (const key in newObj) {
//     if (!(key in oldObj)) {
//       added.push(key);
//     }
//   }
//   return {
//     added,
//     removed,
//     updated,
//   };
// }

// /**
//  * Compares two arrays and returns the differences between them.
//  *
//  * This function identifies which elements have been added or removed between the two arrays.
//  * It compares the values of `oldArray` and `newArray` and returns the differences in terms of
//  * added and removed elements. The function assumes that null values are treated as distinct
//  * elements for comparison.
//  *
//  * @param {Array<string | null>} oldArray - The original array to compare against.
//  * @param {Array<string | null>} newArray - The updated array to compare with the original.
//  * @returns {ARRAY_DIFF_INTER} An object containing:
//  * - `added`: An array of elements that exist in `newArray` but not in `oldArray`.
//  * - `removed`: An array of elements that exist in `oldArray` but not in `newArray`.
//  */

// function arraysDiff(
//   oldArray: (string | null)[],
//   newArray: (string | null)[]
// ): ARRAY_DIFF_INTER {
//   return {
//     added: newArray.filter((newItem) => !oldArray.includes(newItem)) ?? [],
//     removed: oldArray.filter((oldItem) => !newArray.includes(oldItem)) ?? [],
//   };
// }

// /**
//  * Computes the differences between two arrays (`oldArray` and `newArray`) by determining
//  * the sequence of operations required to transform the `oldArray` into the `newArray`.
//  * The function accounts for item additions, removals, moves, and no-op operations.
//  *
//  * The operations are returned as a sequence of actions (insert, remove, move, etc.) in the form
//  * of `SEQUEN_INTER` objects. This allows the changes to be applied to the arrays in the correct order.
//  *
//  * @param {ELEMENT_INTER[]} oldArray - The original array to compare against.
//  * @param {ELEMENT_INTER[]} newArray - The updated array to compare with the original.
//  * @param {function} equalsFn - A function used to compare elements for equality (used for detecting moves or unchanged items).
//  * @returns {SEQUEN_INTER[]} An array of `SEQUEN_INTER` objects representing the operations required to transform `oldArray` into `newArray`.
//  *
//  * @example
//  * const sequence = arraysDiffSequence(oldArray, newArray, equalsFn);
//  * // sequence contains the sequence of operations to apply to oldArray to match newArray.
//  */

// function arraysDiffSequence(
//   oldArray: ELEMENT_INTER[],
//   newArray: ELEMENT_INTER[],
//   equalsFn: any
// ): SEQUEN_INTER[] {
//   const sequence: SEQUEN_INTER[] = [];
//   const array = new ArrayWithOriginalIndices(oldArray, equalsFn);
//   for (let index = 0; index < newArray.length; index++) {
//     if (array.isRemoval(index, newArray)) {
//       sequence.push(array.removeItem(index));
//       index--;
//       continue;
//     }
//     if (array.isNoop(index, newArray)) {
//       sequence.push(array.noopItem(index));
//       continue;
//     }
//     const item = newArray[index];
//     if (array.isAddition(item, index)) {
//       sequence.push(array.addItem(item, index));
//       continue;
//     }
//     sequence.push(array.moveItem(item, index));
//   }
//   sequence.push(...array.removeItemsAfter(newArray.length));
//   return sequence;
// }

// /**
//  * A helper class that tracks the original indices of elements in an array
//  * and provides methods for determining and performing changes (additions, removals, moves, etc.)
//  * in a diffing operation between two arrays.
//  *
//  * This class is used to compute the sequence of operations required to transform one array into another,
//  * taking into account element additions, removals, moves, and no-op (no operation) changes.
//  * It also maintains the original indices of elements to support these operations.
//  *
//  * @class
//  * @param {ELEMENT_INTER[]} array - The original array of elements to track.
//  * @param {function} equalsFn - A function used to compare elements for equality.
//  */

// class ArrayWithOriginalIndices {
//   private array: ELEMENT_INTER[] = [];
//   private originalIndices: number[] = [];
//   private equalsFn;

//   /**
//    * Constructs an instance of the ArrayWithOriginalIndices class.
//    *
//    * @param {ELEMENT_INTER[]} array - The array of elements to track.
//    * @param {function} equalsFn - A function used to compare elements for equality.
//    */

//   constructor(array: ELEMENT_INTER[], equalsFn: any) {
//     this.array = [...array];
//     this.originalIndices = array.map((e: any, i: number) => i);
//     this.equalsFn = equalsFn;
//   }

//   /**
//    * Returns the length of the array.
//    *
//    * @returns {number} The length of the array.
//    */

//   get length(): number {
//     return this.array.length;
//   }

//   /**
//    * Determines if an item at a given index should be removed in the diffing operation.
//    *
//    * @param {number} index - The index to check for removal.
//    * @param {ELEMENT_INTER[]} newArray - The new array to compare against.
//    * @returns {boolean} `true` if the item is to be removed, otherwise `false`.
//    */

//   isRemoval(index: number, newArray: ELEMENT_INTER[]): boolean {
//     if (index >= this.length) {
//       return false;
//     }
//     const item = this.array[index];
//     const indexInNewArray = newArray.findIndex((newItem) =>
//       this.equalsFn(item, newItem)
//     );
//     return indexInNewArray === -1;
//   }

//   /**
//    * Removes an item from the array at a given index and returns the operation object.
//    *
//    * @param {number} index - The index of the item to remove.
//    * @returns {SEQUEN_INTER} The operation object representing the removal.
//    */

//   removeItem(index: number): SEQUEN_INTER {
//     const operation = {
//       op: ARRAY_DIFF_OP.REMOVE,
//       index,
//       item: this.array[index],
//     };
//     this.array.splice(index, 1);
//     this.originalIndices.splice(index, 1);
//     return operation;
//   }

//   /**
//    * Determines if an item at a given index is a no-op (no operation) in the diffing operation.
//    *
//    * @param {number} index - The index to check for no-op.
//    * @param {any} newArray - The new array to compare against.
//    * @returns {boolean} `true` if the item is a no-op, otherwise `false`.
//    */

//   isNoop(index: number, newArray: any): boolean {
//     if (index >= this.length) {
//       return false;
//     }
//     const item = this.array[index];
//     const newItem = newArray[index];
//     return this.equalsFn(item, newItem);
//   }

//   /**
//    * Gets the original index of the element at the given index.
//    *
//    * @param {number} index - The index of the element.
//    * @returns {number} The original index of the element.
//    */

//   originalIndexAt(index: number): number {
//     return this.originalIndices[index];
//   }

//   /**
//    * Returns the no-op operation for an item at a given index.
//    *
//    * @param {number} index - The index of the element.
//    * @returns {SEQUEN_INTER} The no-op operation object.
//    */

//   noopItem(index: number): SEQUEN_INTER {
//     return {
//       op: ARRAY_DIFF_OP.NOOP,
//       originalIndex: this.originalIndexAt(index),
//       index,
//       item: this.array[index],
//     };
//   }

//   /**
//    * Determines if an item is an addition in the diffing operation.
//    *
//    * @param {ELEMENT_INTER} item - The item to check for addition.
//    * @param {number} fromIdx - The index from which to start the search.
//    * @returns {boolean} `true` if the item is an addition, otherwise `false`.
//    */

//   isAddition(item: ELEMENT_INTER, fromIdx: number): boolean {
//     return this.findIndexFrom(item, fromIdx) === -1;
//   }

//   /**
//    * Finds the index of an item starting from a given index.
//    *
//    * @param {ELEMENT_INTER} item - The item to search for.
//    * @param {number} fromIndex - The index from which to start the search.
//    * @returns {number} The index of the item, or -1 if not found.
//    */

//   findIndexFrom(item: ELEMENT_INTER, fromIndex: number): number {
//     for (let i = fromIndex; i < this.length; i++) {
//       if (this.equalsFn(item, this.array[i])) {
//         return i;
//       }
//     }
//     return -1;
//   }

//   /**
//    * Adds an item at a given index and returns the operation object.
//    *
//    * @param {ELEMENT_INTER} item - The item to add.
//    * @param {number} index - The index at which to add the item.
//    * @returns {SEQUEN_INTER} The operation object representing the addition.
//    */

//   addItem(item: ELEMENT_INTER, index: number): SEQUEN_INTER {
//     const operation = {
//       op: ARRAY_DIFF_OP.ADD,
//       index,
//       item,
//     };
//     this.array.splice(index, 0, item);
//     this.originalIndices.splice(index, 0, -1);
//     return operation;
//   }

//   /**
//    * Moves an item from its current index to a new index and returns the operation object.
//    *
//    * @param {ELEMENT_INTER} item - The item to move.
//    * @param {number} toIndex - The new index to move the item to.
//    * @returns {SEQUEN_INTER} The operation object representing the move.
//    */

//   moveItem(item: ELEMENT_INTER, toIndex: number): SEQUEN_INTER {
//     const fromIndex = this.findIndexFrom(item, toIndex);
//     const operation = {
//       op: ARRAY_DIFF_OP.MOVE,
//       originalIndex: this.originalIndexAt(fromIndex),
//       from: fromIndex,
//       index: toIndex,
//       item: this.array[fromIndex],
//     };
//     const [_item] = this.array.splice(fromIndex, 1);
//     this.array.splice(toIndex, 0, _item);
//     const [originalIndex] = this.originalIndices.splice(fromIndex, 1);
//     this.originalIndices.splice(toIndex, 0, originalIndex);
//     return operation;
//   }

//   /**
//    * Removes all items after a specified index and returns the operations for the removals.
//    *
//    * @param {number} index - The index after which to remove items.
//    * @returns {SEQUEN_INTER[]} The sequence of removal operations.
//    */

//   removeItemsAfter(index: number): SEQUEN_INTER[] {
//     const operations = [];
//     while (this.length > index) {
//       operations.push(this.removeItem(index));
//     }
//     return operations;
//   }
// }

// /**
//  * Inserts an element (either `HTMLElement` or `Text`) into a parent element at a specified index.
//  * If the index is `null` or `undefined`, the element will be appended to the parent element.
//  * If the index is invalid (negative), an error will be thrown.
//  *
//  * @param {HTMLElement | Text} el - The element or text node to insert.
//  * @param {HTMLElement} parentEl - The parent element where the element will be inserted.
//  * @param {number | undefined | null} index - The index at which to insert the element. If `null` or `undefined`, the element is appended to the parent element.
//  *                                            If the index is invalid (negative), an error will be thrown.
//  * @throws {Error} Throws an error if the index is a negative number.
//  * @returns {void} This function does not return anything; it modifies the DOM directly.
//  */

// function insert(
//   el: HTMLElement | Text,
//   parentEl: HTMLElement,
//   index: number | undefined | null
// ): void {
//   if (index == null) {
//     parentEl.append(el);
//     return;
//   }
//   if (index < 0) {
//     throw new Error(`Index must be a positive integer, got ${index}`);
//   }
//   const children = parentEl.childNodes;
//   if (index >= children.length) {
//     parentEl.append(el);
//   } else {
//     parentEl.insertBefore(el, children[index]);
//   }
// }

// /**
//  * Compares two virtual DOM elements to check if they are equal based on their type and tag (for element nodes).
//  * For text nodes, equality is determined solely by their type.
//  * For element nodes, equality is determined by their tag name.
//  *
//  * @param {ELEMENT_INTER} nodeOne - The first virtual DOM element to compare.
//  * @param {ELEMENT_INTER} nodeTwo - The second virtual DOM element to compare.
//  * @returns {boolean} Returns `true` if the two virtual DOM elements are equal, otherwise `false`.
//  */

// function areNodesEqual(
//   nodeOne: ELEMENT_INTER,
//   nodeTwo: ELEMENT_INTER
// ): boolean {
//   if (nodeOne.type !== nodeTwo.type) {
//     return false;
//   }
//   if (nodeOne.type === DOM_TYPES.ELEMENT) {
//     const { tag: tagOne } = nodeOne;
//     const { tag: tagTwo } = nodeTwo;
//     return tagOne === tagTwo;
//   }
//   return true;
// }

// /**
//  * Finds the index of an element in its parent node's child nodes.
//  *
//  * @param {HTMLElement} parentEl - The parent HTML element whose child nodes are being checked.
//  * @param {HTMLElement} el - The HTML element whose index is to be found within the parent element.
//  * @returns {number | null} Returns the index of the element if found, otherwise returns `null`.
//  */

// function findIndexInParent(
//   parentEl: HTMLElement,
//   el: HTMLElement
// ): number | null {
//   const index = Array.from(parentEl.childNodes).indexOf(el);
//   if (index < 0) {
//     return null;
//   }
//   return index;
// }

// /**
//  * Checks if a given string is not empty.
//  *
//  * @param {string} str - The string to be checked.
//  * @returns {boolean} Returns `true` if the string is not empty, otherwise `false`.
//  */

// function isNotEmptyString(str: string): boolean {
//   return str !== "";
// }

// /**
//  * Checks if a given string is not blank (not empty and does not only contain whitespace).
//  *
//  * @param {string} str - The string to be checked.
//  * @returns {boolean} Returns `true` if the string is not blank, otherwise `false`.
//  */

// function isNotBlankOrEmptyString(str: string): boolean {
//   return isNotEmptyString(str.trim());
// }

// /**
//  * Patches the text content of an existing virtual DOM node if the text has changed.
//  *
//  * @param {ELEMENT_INTER} oldVdom - The previous virtual DOM element containing the old text value.
//  * @param {ELEMENT_INTER} newVdom - The new virtual DOM element containing the new text value.
//  * @returns {void} This function does not return anything, it modifies the existing DOM element directly.
//  */

// function patchText(oldVdom: ELEMENT_INTER, newVdom: ELEMENT_INTER): void {
//   const el = oldVdom?.el as Text;
//   const { value: oldText } = oldVdom;
//   const { value: newText } = newVdom;
//   if (oldText !== newText) {
//     el.nodeValue = newText ?? "";
//   }
// }

// /**
//  * Patches an element in the DOM by updating its attributes, classes, styles, and event listeners based on the differences
//  * between the old and new virtual DOM elements.
//  *
//  * @param {ELEMENT_INTER} oldVdom - The previous virtual DOM element containing the old properties and listeners.
//  * @param {ELEMENT_INTER} newVdom - The new virtual DOM element containing the new properties and listeners.
//  * @returns {void} This function does not return anything, it modifies the existing DOM element directly.
//  */

// function patchElement(oldVdom: ELEMENT_INTER, newVdom: ELEMENT_INTER): void {
//   const el = oldVdom.el;
//   const {
//     class: oldClass,
//     style: oldStyle,
//     on: oldEvents,
//     ...oldAttrs
//   } = oldVdom?.props as PROPS_INTER;
//   const {
//     class: newClass,
//     style: newStyle,
//     on: newEvents,
//     ...newAttrs
//   } = newVdom.props as PROPS_INTER;

//   const { listeners: oldListeners } = oldVdom;
//   patchAttrs(el as HTMLElement, oldAttrs, newAttrs);
//   patchClasses(
//     el as HTMLElement,
//     oldClass as CLASS_TYPE,
//     newClass as CLASS_TYPE
//   );
//   patchStyles(el as HTMLElement, oldStyle, newStyle);
//   newVdom.listeners = patchEvents(
//     el as HTMLElement,
//     oldListeners,
//     oldEvents,
//     newEvents
//   );
// }

// /**
//  * Patches the attributes of an HTML element by comparing the old and new virtual DOM attributes
//  * and updating the element accordingly. It removes attributes that no longer exist, and adds or updates
//  * attributes that have changed.
//  *
//  * @param {HTMLElement} el - The HTML element whose attributes are being patched.
//  * @param {PROPS_INTER} oldAttrs - The old set of attributes from the previous virtual DOM.
//  * @param {PROPS_INTER} newAttrs - The new set of attributes from the updated virtual DOM.
//  * @returns {void} This function does not return anything; it directly modifies the attributes of the element.
//  */

// function patchAttrs(
//   el: HTMLElement,
//   oldAttrs: PROPS_INTER,
//   newAttrs: PROPS_INTER
// ): void {
//   const { added, removed, updated } = objectsDiff(oldAttrs, newAttrs);
//   for (const attr of removed) {
//     removeAttribute(el, attr);
//   }
//   for (const attr of added.concat(updated)) {
//     setAttribute(el, attr, newAttrs[attr]);
//   }
// }

// /**
//  * Patches the classes of an HTML element by comparing the old and new class values.
//  * It removes classes that are no longer present and adds new classes.
//  *
//  * @param {HTMLElement} el - The HTML element whose classes are being patched.
//  * @param {CLASS_TYPE} oldClass - The old set of classes from the previous virtual DOM.
//  * @param {CLASS_TYPE} newClass - The new set of classes from the updated virtual DOM.
//  * @returns {void} This function does not return anything; it directly modifies the element's class list.
//  */

// function patchClasses(
//   el: HTMLElement,
//   oldClass: CLASS_TYPE,
//   newClass: CLASS_TYPE
// ): void {
//   const oldClasses = toClassList(oldClass);
//   const newClasses = toClassList(newClass);
//   const diff = arraysDiff(oldClasses, newClasses);
//   const added: string[] = diff.added as string[];
//   const removed: string[] = diff.removed as string[];

//   if (removed.length > 0) {
//     el.classList.remove(...removed);
//   }
//   if (added.length > 0) {
//     el.classList.add(...added);
//   }
// }

// /**
//  * Converts a class value (either a string or an array) into an array of class names,
//  * filtering out any blank or empty strings.
//  *
//  * @param {CLASS_TYPE} classes - The class value, which could be a string or an array.
//  * @returns {string[]} An array of class names, excluding any blank or empty strings.
//  */

// function toClassList(classes: CLASS_TYPE): string[] {
//   return Array.isArray(classes)
//     ? classes.filter(isNotBlankOrEmptyString)
//     : classes.split(/(\s+)/).filter(isNotBlankOrEmptyString);
// }

// /**
//  * Patches the styles of an HTML element by comparing the old and new style values.
//  * It removes styles that are no longer present and updates or adds new styles.
//  *
//  * @param {HTMLElement} el - The HTML element whose styles are being patched.
//  * @param {STYLE_INTER} [oldStyle={}] - The old set of styles from the previous virtual DOM. Defaults to an empty object.
//  * @param {STYLE_INTER} [newStyle={}] - The new set of styles from the updated virtual DOM. Defaults to an empty object.
//  * @returns {void} This function does not return anything; it directly modifies the element's inline style.
//  */

// function patchStyles(
//   el: HTMLElement,
//   oldStyle: STYLE_INTER = {},
//   newStyle: STYLE_INTER = {}
// ): void {
//   const { added, removed, updated } = objectsDiff(oldStyle, newStyle);
//   for (const style of removed) {
//     removeStyle(el, style);
//   }
//   for (const style of added.concat(updated)) {
//     setStyle(el, style, newStyle[style]);
//   }
// }

// /**
//  * Patches the event listeners of an HTML element by comparing the old and new event listener sets.
//  * It removes event listeners that are no longer needed and adds or updates event listeners based on the new virtual DOM.
//  *
//  * @param {HTMLElement} el - The HTML element whose event listeners are being patched.
//  * @param {LISTENERS_INTER} [oldListeners={}] - The old set of event listeners associated with the element. Defaults to an empty object.
//  * @param {LISTENERS_INTER} [oldEvents={}] - The old set of event types and handlers from the previous virtual DOM. Defaults to an empty object.
//  * @param {LISTENERS_INTER} [newEvents={}] - The new set of event types and handlers from the updated virtual DOM. Defaults to an empty object.
//  * @returns {LISTENERS_INTER} - A new object containing the added or updated event listeners.
//  */

// function patchEvents(
//   el: HTMLElement,
//   oldListeners: LISTENERS_INTER = {},
//   oldEvents: LISTENERS_INTER = {},
//   newEvents: LISTENERS_INTER = {}
// ): LISTENERS_INTER {
//   const { removed, added, updated } = objectsDiff(oldEvents, newEvents);

//   for (const eventName of removed.concat(updated)) {
//     el.removeEventListener(eventName, oldListeners[eventName]);
//   }

//   const addedListeners: LISTENERS_INTER = {};
//   for (const eventName of added.concat(updated)) {
//     const listener = addEventListener(eventName, newEvents[eventName], el);
//     addedListeners[eventName] = listener;
//   }

//   return addedListeners;
// }

// /**
//  * Extracts the children elements from a virtual DOM node, including recursively extracting children from fragments.
//  *
//  * @param {ELEMENT_INTER} vdom - The virtual DOM node from which to extract the children.
//  * @returns {ELEMENT_INTER[]} - An array of the child elements, with fragments flattened.
//  */

// function extractChildren(vdom: ELEMENT_INTER): ELEMENT_INTER[] {
//   if (vdom.children == null) {
//     return [];
//   }
//   const children: ELEMENT_INTER[] = [];
//   for (const child of vdom.children) {
//     if (child.type === DOM_TYPES.FRAGMENT) {
//       children.push(...extractChildren(child));
//     } else {
//       children.push(child);
//     }
//   }
//   return children;
// }

// /**
//  * Patches the children of a virtual DOM node by applying the necessary operations (add, remove, move, or noop).
//  * It compares the old and new virtual DOM children, determines the differences, and applies the changes to the actual DOM.
//  *
//  * @param {ELEMENT_INTER} oldVdom - The old virtual DOM node to compare against.
//  * @param {ELEMENT_INTER} newVdom - The new virtual DOM node to patch.
//  */

// function patchChildren(
//   oldVdom: ELEMENT_INTER,
//   newVdom: ELEMENT_INTER,
//   hostComponent
// ) {
//   const oldChildren = extractChildren(oldVdom);
//   const newChildren = extractChildren(newVdom);
//   const parentEl = oldVdom.el as HTMLElement;
//   const diffSeq: SEQUEN_INTER[] = arraysDiffSequence(
//     oldChildren,
//     newChildren,
//     areNodesEqual
//   );

//   for (const operation of diffSeq) {
//     const { originalIndex, index, item } = operation;
//     const offset = hostComponent?.offset ?? 0;

//     switch (operation.op) {
//       case ARRAY_DIFF_OP.ADD: {
//         mountDOM(item, parentEl, index + offset, hostComponent);
//         break;
//       }
//       case ARRAY_DIFF_OP.REMOVE: {
//         destroyDOM(item);
//         break;
//       }
//       case ARRAY_DIFF_OP.MOVE: {
//         const oldChild = oldChildren[originalIndex as number];
//         const newChild = newChildren[index];
//         const el = oldChild.el;
//         const elAtTargetIndex = parentEl.childNodes[index + offset];
//         parentEl.insertBefore(el as HTMLElement, elAtTargetIndex);
//         patchDOM(oldChild, newChild, parentEl, hostComponent);
//         break;
//       }
//       case ARRAY_DIFF_OP.NOOP: {
//         patchDOM(
//           oldChildren[originalIndex as number],
//           newChildren[index],
//           parentEl,
//           hostComponent
//         );
//         break;
//       }
//     }
//   }
// }

// /**
//  * Patches a DOM node by comparing the old and new virtual DOM nodes.
//  * If the nodes are different, it destroys the old node and mounts the new one.
//  * If they are the same, it updates the properties, attributes, and children of the existing node.
//  *
//  * @param {ELEMENT_INTER} oldVdom - The old virtual DOM node to compare against.
//  * @param {ELEMENT_INTER} newVdom - The new virtual DOM node to patch.
//  * @param {HTMLElement} parentEl - The parent element in which the patching will occur.
//  * @returns {ELEMENT_INTER} - The new virtual DOM node after patching.
//  */

// function patchDOM(
//   oldVdom: ELEMENT_INTER,
//   newVdom: ELEMENT_INTER,
//   parentEl: HTMLElement,
//   hostComponent: this = null
// ): ELEMENT_INTER {
//   if (!areNodesEqual(oldVdom, newVdom)) {
//     const index = findIndexInParent(parentEl, oldVdom?.el as HTMLElement);
//     destroyDOM(oldVdom);
//     mountDOM(newVdom, parentEl, index);
//     return newVdom;
//   }

//   newVdom.el = oldVdom.el;
//   switch (newVdom.type) {
//     case DOM_TYPES.TEXT: {
//       patchText(oldVdom, newVdom);
//       return newVdom;
//     }
//     case DOM_TYPES.ELEMENT: {
//       patchElement(oldVdom, newVdom);
//       break;
//     }
//   }
//   patchChildren(oldVdom, newVdom, hostComponent);
//   return newVdom;
// }

// //********************************************************************************/
// //********************************************************************************/
// //********************************************************************************/
// //********************************************************************************/
// //********************************************************************************/

// export interface IComponent<STATE, PROPS = {}> {
//   state: STATE;
//   props: PROPS;

//   updateState(state: Partial<STATE>): void;
//   render(): ELEMENT_INTER;
//   mount(hostEl: HTMLElement, index?: number | null): void;
//   unmount(): void;
// }
// export function hasOwnProperty(obj: any, prop: string) {
//   return Object.prototype.hasOwnProperty.call(obj, prop);
// }

// export function defineComponent<STATE, PROPS = {}>({
//   render,
//   state,
//   ...methods
// }: {
//   render: () => ELEMENT_INTER;
//   state?: (props: PROPS) => STATE;
//   methods: Record<string, Function>;
// }) {
//   class Component implements IComponent<STATE, PROPS> {
//     private vdom: ELEMENT_INTER | null = null;
//     private hostEl: HTMLElement | null = null;
//     private isMounted: boolean = false;
//     state: STATE;
//     props: PROPS;

//     constructor(props: PROPS) {
//       this.props = props;
//       this.state = state ? state(props) : ({} as STATE);
//     }

//     get elements(): (ELEMENT_HTML | undefined)[] {
//       if (this.vdom == null) {
//         return [];
//       }
//       if (this.vdom.type === DOM_TYPES.FRAGMENT) {
//         return extractChildren(this.vdom).map((child) => child.el);
//       }
//       return [this.vdom.el];
//     }

//     get firstElement(): ELEMENT_HTML | undefined {
//       return this.elements[0];
//     }

//     get offset() {
//       if (this?.vdom?.type === DOM_TYPES.FRAGMENT) {
//         return Array.from(this?.hostEl?.children!).indexOf(
//           this.firstElement as HTMLElement
//         ); // possible error
//       }
//       return 0;
//     }

//     updateState(state: STATE) {
//       this.state = { ...this.state, ...state };
//       this.patch();
//     }

//     render(): ELEMENT_INTER {
//       return render.call(this);
//     }

//     mount(hostEl: HTMLElement, index = null) {
//       if (this.isMounted) {
//         throw new Error("Component is already mounted");
//       }
//       this.vdom = this.render();
//       mountDOM(this.vdom, hostEl, index);
//       this.hostEl = hostEl;
//       this.isMounted = true;
//     }

//     unmount() {
//       if (!this.isMounted) {
//         throw new Error("Component is not mounted");
//       }
//       destroyDOM(this.vdom!);
//       this.vdom = null;
//       this.hostEl = null;
//       this.isMounted = false;
//     }

//     private patch() {
//       if (!this.isMounted) {
//         throw new Error("Component is not mounted");
//       }
//       const vdom = this.render();
//       this.vdom = patchDOM(this.vdom!, vdom, this.hostEl!, this);
//     }
//   }
//   for (const methodName in methods) {
//     if (hasOwnProperty(Component.prototype, methodName)) {
//       throw new Error(
//         `Method "${methodName}()" already exists in the component.`
//       );
//     }
//     (Component.prototype as any)[methodName] = methods[methodName];
//   }
//   return Component;
// }
