const DOM_TYPES = {
    TEXT: "text",
    ELEMENT: "element",
    FRAGMENT: "fragment",
};
function withoutNulls(array) {
    return array.filter((e) => e != null);
}
function mapTextNodes(children) {
    return children.map((child) => typeof child === "string" ? createString(child) : child);
}
export function createString(str) {
    return {
        type: DOM_TYPES.TEXT,
        value: str,
    };
}
export function createFragment(vNodes) {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes)),
    };
}
export function createElement(tag, props = {}, children = []) {
    return {
        tag,
        props,
        children: mapTextNodes(withoutNulls(children)),
        type: DOM_TYPES.ELEMENT,
    };
}
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
function createTextNode(vdom, parentEl) {
    const value = vdom.value;
    const textNode = document.createTextNode(value);
    vdom.el = textNode;
    parentEl.append(textNode);
}
function createFragmentNodes(vdom, parentEl) {
    const children = vdom.children;
    vdom.el = parentEl;
    children.forEach((child) => mountDOM(child, parentEl));
}
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
function addProps(el, props, vdom) {
    const { on: events, ...attrs } = props;
    vdom.listeners = addEventListeners(events, el);
    setAttributes(el, attrs);
}
export function addEventListeners(listeners = {}, el) {
    const addedListeners = {};
    Object.entries(listeners).forEach(([eventName, handler]) => {
        const listener = addEventListener(eventName, handler, el);
        addedListeners[eventName] = listener;
    });
    return addedListeners;
}
function addEventListener(eventName, handler, el) {
    el.addEventListener(eventName, handler);
    return handler;
}
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
function setClass(el, className) {
    el.className = "";
    if (typeof className === "string") {
        el.className = className;
    }
    if (Array.isArray(className)) {
        el.classList.add(...className);
    }
}
