import {
  createElement,
  defineComponent,
  IComponent,
} from "../uccello/Uccello.js";
interface StateHero {
  quote: string;
}

const Hero = defineComponent<StateHero>({
  async onMounted(this: IComponent<StateHero> & { generate: () => void }) {
    // this.generate();
    // setInterval(() => {
    //   this.generate();
    // }, 4000);
  },
  state(): StateHero {
    return { quote: "" };
  },
  render(this: IComponent<StateHero> & { generate: () => void }) {
    return createElement(
      "section",
      { class: ["flex", "flex-row", "items-center", "flex-1"] },
      [
        createElement(
          "div",
          { class: ["w-1/2", "flex", "flex-col", "gap-4"] },
          [
            createElement(
              "p",
              {
                class: ["text-8xl", "font-semibold", "leading-[112px]"],
              },
              ["Ping Pong Showdown: The Ultimate Battle for the Net!"]
            ),
            createElement(
              "p",
              {
                style: {
                  color: "var(--light-grey)",
                },
                class: ["font-semibold"],
                on: {
                  click: this.generate,
                },
              },
              [this.state.quote]
            ),
          ]
        ),
        createElement("div", { class: ["w-1/2"] }, [
          createElement("img", {
            src: "../public/assets/paddle.png",
            class: ["w-[676px]"],
          }),
        ]),
      ]
    );
  },
  async generate(this: IComponent<StateHero>) {
    try {
      const res: Response = await fetch("http://localhost:3000/quote");
      const data = await res.json();
      this.updateState({ quote: data.quote });
    } catch (error) {
      console.error("Error fetching quote:", error);
    }
  },
});

export default Hero;
