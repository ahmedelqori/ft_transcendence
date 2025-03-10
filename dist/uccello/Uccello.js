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
export function setStyle(el, name, value) {
    el.style[name] = value;
}
export function removeStyle(el, name) {
    delete el.style[name];
}
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
export function removeAttribute(el, name) {
    if (name in el) {
        el[name] = "";
    }
    el.removeAttribute(name);
}
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
function removeTextNode(vdom) {
    const el = vdom.el;
    el?.remove();
}
function removeElementNode(vdom) {
    const { el, children, listeners } = vdom;
    el?.remove();
    children?.forEach(destroyDOM);
    if (listeners) {
        removeEventListeners(listeners, el);
        delete vdom.listeners;
    }
}
export function removeEventListeners(listeners = {}, el) {
    Object.entries(listeners).forEach(([eventName, handler]) => {
        el?.removeEventListener(eventName, handler);
    });
}
function removeFragmentNodes(vdom) {
    const { children } = vdom;
    children?.forEach(destroyDOM);
}
