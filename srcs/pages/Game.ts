import {
  createElement,
  defineComponent,
  IComponent,
} from "../uccello/Uccello.js";

const Game = defineComponent<void>({
  onMounted(this: IComponent<void>) {
    document.title = "Game";
    const el = this.getHtmlElement;
    const ctx = el.getContext("2d");
    ctx.beginPath();
    ctx.arc(400, 200, 50, 0, Math.PI * 2);
    ctx.fillStyle = "#fcd34d";
    ctx.fill();
    ctx.stroke();
  },
  state() {},
  render(this: IComponent<void>) {
    return createElement("canvas", {
      // width: 800,
      // height: 400,
      class: [
        "flex",
        "z-10",
        "gap-4",
        "h-full",
        "w-[90%]",
        "relative",
        "border-2",
        "py-[30px]",
        "px-[25px]",
        "rounded-[30px]",
        "border-[#878787]",
        "border-opacity-[30%]",
      ],
    });
  },
});

export default Game;
