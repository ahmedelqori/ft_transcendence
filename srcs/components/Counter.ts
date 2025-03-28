import { IComponent } from "./../uccello/Uccello.js";
import {
  createElement,
  createFragment,
  defineComponent,
} from "../uccello/Uccello.js";

interface COUNTER_STATE {
  count: number;
}

const Counter = defineComponent<COUNTER_STATE>({
  state: () => ({ count: 0 }),
  render(this: IComponent<COUNTER_STATE>) {
    return createFragment([
      createElement("p", {}, [`Count: ${this.state.count}`]),
      createElement(
        "button",
        {
          on: {
            click: () => {
              this.updateState({ count: this.state.count + 1 });
            },
          },
        },
        ["Increment"]
      ),
    ]);
  },
});

export { Counter };
