import { IComponent } from "../uccello/Uccello.js";
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
      createElement(
        "p",
        { "data-qa": "counter", class: ["text-xl", "font-bold", "mb-4"] },
        [`${this.state.count}`]
      ),
      createElement(
        "button",
        {
          "data-qa": "increment",
          class: [
            "bg-blue-500",
            "hover:bg-blue-600",
            "text-white",
            "font-semibold",
            "py-2",
            "px-4",
            "rounded",
            "transition",
            "duration-300",
          ],
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
