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
