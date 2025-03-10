import * as Uccello from "./uccello/Uccello.js";

console.log(
  Uccello.createFragment(["Hello", Uccello.createElement("div", {}, ["Hello"])])
);
