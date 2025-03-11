const DOM_TYPES = {
    TEXT: "text",
    ELEMENT: "element",
    FRAGMENT: "fragment",
};
/**
 * Filters out `null` and `undefined` values from an array.
 *
 * @param array An array of virtual DOM elements (`ELEMENT_INTER`), strings, or `null`/`undefined` values.
 * @returns A new array containing only valid elements (i.e., excluding `null` and `undefined`).
 */
function withoutNulls(array) {
    return array.filter((e) => e != null);
}
/**
 * Converts all string elements in an array into virtual DOM text nodes.
 *
 * @param children An array of virtual DOM elements or strings.
 * @returns A new array where all string elements are converted to virtual DOM text nodes, and other elements remain unchanged.
 */
function mapTextNodes(children) {
    return children.map((child) => typeof child === "string" ? createString(child) : child);
}
/**
 * Creates a virtual DOM text node from a string.
 *
 * @param str The string value to be used as the text content of the text node.
 * @returns A virtual DOM text node object containing the string value.
 */
export function createString(str) {
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
export function createFragment(vNodes) {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes)),
    };
}
/**
 * Creates a virtual DOM element with the specified tag, properties, and children.
 *
 * @param tag The tag name of the element (e.g., "div", "span").
 * @param props An optional object containing properties (attributes) to be applied to the element.
 *              Defaults to an empty object if not provided.
 * @param children An optional array of child elements, text nodes, or null/undefined values.
 *                 The function filters out null/undefined values and processes text nodes.
 * @returns A virtual DOM element object that represents the specified element.
 */
export function createElement(tag, props = {}, children = []) {
    return {
        tag,
        props,
        children: mapTextNodes(withoutNulls(children)),
        type: DOM_TYPES.ELEMENT,
    };
}
/**
 * Mounts a virtual DOM element to a specified parent HTML element.
 * The function will handle different types of virtual DOM elements:
 * text nodes, regular DOM elements, and fragments.
 *
 * @param vdom The virtual DOM element to mount, which can be of type TEXT, ELEMENT, or FRAGMENT.
 * @param parentEl The HTML element to which the virtual DOM element will be appended.
 * @returns void
 * @throws Error if the virtual DOM type is unsupported.
 */
export function mountDOM(vdom, parentEl) {
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
/**
 * Creates a text node from a virtual DOM text element and appends it to a parent HTML element.
 *
 * @param vdom The virtual DOM element representing a text node. It must have a `value` property that is a string.
 * @param parentEl The HTML element to which the text node will be appended.
 * @returns void
 */
function createTextNode(vdom, parentEl) {
    const value = vdom.value;
    const textNode = document.createTextNode(value);
    vdom.el = textNode;
    parentEl.append(textNode);
}
/**
 * Creates a Fragment node from a virtual DOM text element and appends it to a parent HTML element.
 *
 * @param vdom The virtual DOM element representing a Fragment node. It must have a children property that is a ELEMENT_INTER.
 * @param parentEl The HTML element to which the text node will be appended.
 * @returns void
 */
function createFragmentNodes(vdom, parentEl) {
    const children = vdom.children;
    vdom.el = parentEl;
    children.forEach((child) => mountDOM(child, parentEl));
}
/**
 * Creates a ELement node from a virtual DOM text element and appends it to a parent HTML element.
 *
 * @param vdom The virtual DOM element representing a Element node. It must have a tag, props, and children property that is a ELEMENT_INTER.
 * @param parentEl The HTML element to which the text node will be appended.
 * @returns void
 */
function createElementNode(vdom, parentEl) {
    const tag = vdom.tag;
    const props = vdom.props;
    const children = vdom.children;
    const element = document.createElement(tag);
    addProps(element, props, vdom);
    vdom.el = element;
    children.forEach((child) => mountDOM(child, element));
    parentEl.append(element);
}
/**
 * Adds properties (attributes and event listeners) to an HTML element.
 *
 * @param el The HTML element to which properties will be added.
 * @param props An object containing attributes and event listeners for the element.
 *              The `on` property contains event listeners, while the rest are treated as attributes.
 * @param vdom The virtual DOM element associated with the HTML element. The event listeners will be stored in this object.
 * @returns void
 */
function addProps(el, props, vdom) {
    const { on: events, ...attrs } = props;
    vdom.listeners = addEventListeners(events, el);
    setAttributes(el, attrs);
}
/**
 * Attaches event listeners to an HTML element and returns a reference to the added listeners.
 *
 * @param listeners An object where the keys are event names (e.g., 'click', 'mouseover') and the values are corresponding event handler functions.
 *                  Defaults to an empty object if no listeners are provided.
 * @param el The HTML element to which the event listeners will be attached.
 * @returns An object containing references to the added event listeners, keyed by event name.
 */
export function addEventListeners(listeners = {}, el) {
    const addedListeners = {};
    Object.entries(listeners).forEach(([eventName, handler]) => {
        const listener = addEventListener(eventName, handler, el);
        addedListeners[eventName] = listener;
    });
    return addedListeners;
}
/**
 * Adds an event listener to an HTML element and returns the handler function.
 *
 * @param eventName The name of the event (e.g., 'click', 'mouseover').
 * @param handler The event handler function to be called when the event is triggered.
 * @param el The HTML element to which the event listener will be attached.
 * @returns The event handler function that was added as the event listener.
 */
function addEventListener(eventName, handler, el) {
    el.addEventListener(eventName, handler);
    return handler;
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
export function setAttributes(el, attrs) {
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
function setClass(el, className) {
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
export function setStyle(el, name, value) {
    el.style[name] = value;
}
/**
 * Removes a CSS style property from an HTML element.
 *
 * @param el The HTML element from which the style will be removed.
 * @param name The name of the CSS property to remove (e.g., 'color', 'font-size').
 * @returns void
 */
export function removeStyle(el, name) {
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
export function setAttribute(el, name, value) {
    if (value == null) {
        removeAttribute(el, name);
    }
    else if (name.startsWith("data-") || name in el) {
        el.setAttribute(name, value);
    }
    else {
        el[name] = value;
    }
}
/**
 * Removes an attribute or property from an HTML element.
 *
 * @param el The HTML element from which the attribute will be removed.
 * @param name The name of the attribute or property to remove (e.g., 'id', 'class', 'data-custom').
 * @returns void
 */
export function removeAttribute(el, name) {
    if (name in el) {
        el[name] = "";
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
export function destroyDOM(vdom) {
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
/**
 * Removes a text node from the DOM.
 *
 * @param vdom The virtual DOM element representing a text node. The function will remove the real DOM node associated with it.
 * @returns void
 */
function removeTextNode(vdom) {
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
function removeElementNode(vdom) {
    const { el, children, listeners } = vdom;
    el?.remove();
    children?.forEach(destroyDOM);
    if (listeners) {
        removeEventListeners(listeners, el);
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
export function removeEventListeners(listeners = {}, el) {
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
function removeFragmentNodes(vdom) {
    const { children } = vdom;
    children?.forEach(destroyDOM);
}
