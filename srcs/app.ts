import CreateTodo from "./components/CreateTodo.js";
import TodoList from "./components/TodoList.js";
import { createElement } from "./uccello/Uccello.js";

const App = (state: any, emit: any) => {
  return createElement(
    "div",
    {
      class: [
        "flex",
        "flex-col",
        "items-center",
        "p-4",
        "min-h-screen",
        "bg-gray-100",
      ],
    },
    [
      createElement(
        "h1",
        { class: ["text-3xl", "font-bold", "text-gray-800", "mb-4"] },
        ["My Todos"]
      ),
      CreateTodo(state, emit),
      TodoList(state, emit),
    ]
  );
};

export default App;
