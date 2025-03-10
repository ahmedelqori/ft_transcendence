import * as Uccello from "./uccello/Uccello.js";

const ROOT = document.getElementById("root") as HTMLElement;

const vdom = Uccello.createFragment([
  "Hello",
  Uccello.createElement(
    "div",
    {
      on: {
        dblclick: () => console.log("1234"),
      },
    },
    [
      "Hello",
      Uccello.createElement(
        "div",
        {
          on: {
            click: () => Uccello.destroyDOM(vdom),
          },
        },
        ["Hello"]
      ),
    ]
  ),
]);
