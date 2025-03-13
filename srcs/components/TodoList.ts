import { createElement } from "../uccello/Uccello.js";
import TodoItem from "./TodoItem.js";

const TodoList = ({ todos, edit }: any, emit: any) => {
  return createElement(
    "ul",
    { class: ["w-full", "max-w-md", "mt-4", "space-y-2"] },
    todos.map((todo: any, i: any) => TodoItem({ todo, i, edit }, emit))
  );
};

export default TodoList;
