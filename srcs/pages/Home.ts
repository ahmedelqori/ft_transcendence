import { createElement, createString } from "../uccello/Uccello.js";

const Home = ({ state, emit }: any) => {
  return createElement(
    "div",
    {
      class: ["flex", "flex-col", "items-center", "p-6"],
    },
    [
      createElement(
        "form",
        {
          class: ["flex", "gap-2", "mb-4"],
          on: {
            submit: (event: Event) => {
              event.preventDefault();
              emit("add-todo", state.item);
              emit("clear-input");
            },
          },
        },
        [
          createElement("input", {
            type: "text",
            placeholder: "Enter item",
            value: state.item,
            on: {
              input: (e: any) => {
                console.log("change is running"),
                  emit("input-change", e?.target?.value);
              },
            },
            class: [
              "border",
              "border-gray-300",
              "rounded-lg",
              "px-4",
              "py-2",
              "focus:outline-none",
              "focus:ring-2",
              "focus:ring-blue-500",
            ],
          }),
          createElement(
            "button",
            {
              type: "submit",
              class: [
                "bg-blue-500",
                "text-white",
                "px-4",
                "py-2",
                "rounded-lg",
                "hover:bg-blue-600",
                "transition",
              ],
            },
            [createString("Add")]
          ),
        ]
      ),
      createElement("div", { class: ["w-full", "max-w-md"] }, [
        createElement(
          "ul",
          {
            class: ["bg-white", "shadow-md", "rounded-lg", "p-4", "space-y-2"],
          },
          state.list.map((element: string) =>
            createElement(
              "li",
              {
                class: [
                  "border-b",
                  "last:border-none",
                  "py-2",
                  "text-gray-800",
                ],
              },
              [element]
            )
          )
        ),
      ]),
    ]
  );
};

export default Home;
