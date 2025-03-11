import * as Uccello from "./uccello/Uccello.js";

const ROOT = document.getElementById("root") as HTMLElement;
let n = "red";
const VirtualDom = Uccello.createElement(
  "div",
  {
    style: {
      color: n,
      backgroundColor: "#eee",
      margin: "auto",
      display: "flex",
      width: "fit-content",
      padding: "5px 10px",
    },
    on: {
      click: () => console.log("HI"),
    },
  },
  ["HELLO"]
);

Uccello.mountDOM(VirtualDom, ROOT);

