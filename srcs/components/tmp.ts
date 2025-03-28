import {
  defineComponent,
  createFragment,
  createElement,
  IComponent,
} from "../uccello/Uccello.js";

interface TmpState {
  count: number;
  name: string;
}

const Counter = defineComponent<TmpState>({
  state(): TmpState {
    return { count: 0, name: "Meedivo" };
  },
  render(this: IComponent<TmpState>) {
    return createFragment([
      createElement("p", {}, [`Count: ${this.state.count}`]),
      createElement("p", {}, [`Name: ${this.state.name} + ${this.state.count}`]),
      createElement(
        "button",
        {
          on: {
            click: () => {
              this.updateState({
                count: this.state.count + 1,
              });
            },
          },
        },
        [this.state.name]
      ),
    ]);
  },
});

export { Counter };
