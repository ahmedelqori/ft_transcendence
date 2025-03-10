import * as Uccello from "./uccello/Uccello.js";
const ROOT = document.getElementById("root");
const vdom = Uccello.createFragment([
    "Hello",
    Uccello.createElement("div", {
        on: {
            dblclick: () => console.log("1234"),
        },
    }, [
        "Hello",
        Uccello.createElement("div", {
            on: {
                click: () => console.log("hi"),
            },
        }, ["Hello"]),
    ]),
]);
Uccello.mountDOM(vdom, ROOT);
