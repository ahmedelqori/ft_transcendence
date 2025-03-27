import {
  createApp,
  defineComponent,
  createElement,
  createString,
  createFragment,
  IComponent,
} from "../uccello/Uccello.js";

interface IView {
  count: number;
}

const View = defineComponent<IView>({
  state() {
    return { count: 0 };
  },

  render(this: IComponent<IView>) {
    const { count } = this.state;

    return createFragment([
      createElement(
        "button",
        {
          class: ["bg-red-500", "text-white", "px-4", "py-2", "rounded"],
          on: { click: () => this.updateState({ count: count - 1 }) },
        },
        ["-"]
      ),
      createElement(
        "span",
        {
          class: [
            "mx-4",
            "text-xl",
            count < 0 ? "text-red-600" : "text-green-600",
          ],
        },
        [createString(count.toString())]
      ),
      createElement(
        "button",
        {
          class: ["bg-blue-500", "text-white", "px-4", "py-2", "rounded"],
          on: { click: () => this.updateState({ count: count + 1 }) },
        },
        ["+"]
      ),
    ]);
  },
});

createApp(View, {}).mount(document.body);
