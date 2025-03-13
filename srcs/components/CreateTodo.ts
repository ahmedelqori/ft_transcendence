import { createElement } from "../uccello/Uccello.js";

const CreateTodo = (state: any, emit: any) => {
  return createElement(
    "div",
    { class: ["flex", "flex-col", "gap-2", "w-full", "max-w-md"] },
    [
      createElement(
        "label",
        {
          for: "todo-input",
          class: ["text-lg", "font-medium", "text-gray-700"],
        },
        ["New TODO"]
      ),
      createElement("input", {
        type: "text",
        id: "todo-input",
        class: [
          "border",
          "border-gray-300",
          "rounded-md",
          "p-2",
          "focus:outline-none",
          "focus:ring-2",
          "focus:ring-blue-500",
          "transition",
        ],
        value: state.currentTodo,
        on: {
          input: (el: any) => emit("update-current-todo", el?.target?.value),
          keydown: (el: any) => {
            if (el?.key === "Enter" && state.currentTodo.length >= 3) {
              emit("add-todo");
            }
          },
        },
      }),
      createElement(
        "button",
        {
          class: [
            "px-4",
            "py-2",
            "rounded-md",
            "text-white",
            "font-semibold",
            state.currentTodo.length >= 3 ? "bg-blue-500" : "bg-gray-400",
            state.currentTodo.length >= 3
              ? "hover:bg-blue-600"
              : "cursor-not-allowed",
            "transition",
          ],

          on: {
            click: () => {
              if (state.currentTodo.length >= 3)
                emit("add-todo");
            },
          },
        },
        ["Add"]
      ),
    ]
  );
};

export default CreateTodo;
