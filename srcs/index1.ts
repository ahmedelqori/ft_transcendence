import {
  createApp,
  createElement,
  defineComponent,
  IComponent,
} from "./uccello/Uccello.js";

const ROOT: HTMLElement = document.getElementById("root")!;

interface IApp {
  nameApp: string;
}

interface ISubComp {
  n: boolean;
}

const SubComp = defineComponent<ISubComp>({
  state: () => {
    return { n: true };
  },
  render() {
    return createElement("h1");
  },
});

const App = defineComponent<IApp>({
  state: () => {
    return { nameApp: "Meedivo" };
  },
  render(this: IComponent<IApp>) {
    return createElement(
      "input",
      {
        on: {
          click: () => {
            this.updateState({ nameApp: "Hello Word" });
          },
        },
      },
      [this.state.nameApp,]
    );
  },
});

createApp(App).mount(ROOT);
