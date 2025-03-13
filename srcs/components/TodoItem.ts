import { createElement } from "../uccello/Uccello.js";

const TodoItem = ({ todo, i, edit }: any, emit: any) => {
  const isEditing = edit.idx === i;

  return isEditing
    ? createElement(
        "li",
        {
          class: [
            "flex",
            "items-center",
            "gap-2",
            "p-2",
            "border",
            "rounded-md",
            "bg-gray-100",
          ],
        },
        [
          createElement("input", {
            value: edit.edited,
            class: [
              "flex-1",
              "border",
              "rounded-md",
              "p-1",
              "focus:outline-none",
              "focus:ring-2",
              "focus:ring-blue-500",
              "transition",
            ],
            on: {
              input: ({ target }: any) => emit("edit-todo", target.value),
            },
          }),
          createElement(
            "button",
            {
              class: [
                "px-3",
                "py-1",
                "bg-green-500",
                "text-white",
                "rounded-md",
                "hover:bg-green-600",
                "transition",
              ],
              on: { click: () => emit("save-edited-todo") },
            },
            ["Save"]
          ),
          createElement(
            "button",
            {
              class: [
                "px-3",
                "py-1",
                "bg-gray-400",
                "text-white",
                "rounded-md",
                "hover:bg-gray-500",
                "transition",
              ],
              on: { click: () => emit("cancel-editing-todo") },
            },
            ["Cancel"]
          ),
        ]
      )
    : createElement(
        "li",
        {
          class: [
            "flex",
            "items-center",
            "justify-between",
            "p-2",
            "border",
            "rounded-md",
            "bg-white",
          ],
        },
        [
          createElement(
            "span",
            {
              class: ["flex-1", "cursor-pointer", "text-gray-800"],
              on: { dblclick: () => emit("start-editing-todo", i) },
            },
            [todo]
          ),
          createElement(
            "button",
            {
              class: [
                "px-3",
                "py-1",
                "bg-red-500",
                "text-white",
                "rounded-md",
                "hover:bg-red-600",
                "transition",
              ],
              on: { click: () => emit("remove-todo", i) },
            },
            ["Done"]
          ),
        ]
      );
};

export default TodoItem;
