import {
  createApp,
  defineComponent,
  createElement,
  IComponent,
} from "../uccello/Uccello.js";

const ROOT: HTMLElement = document.getElementById("root") as HTMLElement;

interface ITodo {
  id: string;
  text: string;
  completed: boolean;
  isEditing: boolean;
}

interface IApp {
  todos: ITodo[];
  newTodoText: string;
}

const App = defineComponent<IApp>({
  state() {
    return {
      todos: [],
      newTodoText: "",
    };
  },

  render(
    this: IComponent<IApp> & {
      addTodo: () => void;
      updateNewTodoText: (text: string) => void;
      toggleTodo: (id: string) => void;
      deleteTodo: (id: string) => void;
      startEditing: (id: string) => void;
      updateTodoText: (id: string, text: string) => void;
      handleKeyPress: (event: KeyboardEvent, id?: string) => void;
    }
  ) {
    const { todos, newTodoText } = this.state;

    return createElement(
      "div",
      { class: "bg-slate-900 min-h-screen text-white p-8" },
      [
        createElement(
          "div",
          { class: "max-w-xl mx-auto bg-slate-800 rounded-lg shadow-lg p-6" },
          [
            // Title
            createElement(
              "h1",
              { class: "text-3xl font-bold text-center mb-6 text-teal-400" },
              ["Todo List"]
            ),

            // Add Todo Input
            createElement("div", { class: "flex mb-4" }, [
              createElement("input", {
                type: "text",
                placeholder: "Add a new todo...",
                value: newTodoText,
                class:
                  "flex-grow bg-slate-700 text-white p-2 rounded-l-lg border border-slate-600 focus:ring-2 focus:ring-teal-500",
                on: {
                  input: ({ target }) => this.updateNewTodoText(target.value),
                  keydown: (event) => this.handleKeyPress(event),
                },
              }),
              createElement(
                "button",
                {
                  class:
                    "bg-teal-600 text-white px-4 py-2 rounded-r-lg hover:bg-teal-700 transition-colors duration-200",
                  on: { click: this.addTodo },
                },
                ["Add"]
              ),
            ]),

            // Todo List
            createElement(
              "ul",
              { class: "space-y-2 mt-4" },
              todos.map((todo) =>
                createElement(
                  "li",
                  {
                    class:
                      "flex items-center bg-slate-700 p-3 rounded-lg group",
                  },
                  [
                    // Checkbox
                    createElement("input", {
                      type: "checkbox",
                      checked: todo.completed,
                      class:
                        "mr-3 bg-slate-600 border-slate-500 rounded text-teal-500 focus:ring-teal-500",
                      on: { change: () => this.toggleTodo(todo.id) },
                    }),

                    // Todo Text
                    todo.isEditing
                      ? createElement("input", {
                          type: "text",
                          value: todo.text,
                          class:
                            "flex-grow bg-slate-600 text-white p-1 rounded mr-2",
                          on: {
                            keydown: (event) =>
                              this.handleKeyPress(event, todo.id),
                            input: ({ target }) =>
                              this.updateTodoText(todo.id, target.value),
                          },
                          props: {
                            autoFocus: true,
                          },
                        })
                      : createElement(
                          "span",
                          {
                            class: `flex-grow ${
                              todo.completed
                                ? "line-through text-slate-500"
                                : ""
                            }`,
                            on: {
                              dblclick: () => this.startEditing(todo.id),
                            },
                          },
                          [todo.text]
                        ),

                    // Delete Button
                    createElement(
                      "button",
                      {
                        class:
                          "ml-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200",
                        on: { click: () => this.deleteTodo(todo.id) },
                      },
                      ["✕"]
                    ),
                  ]
                )
              )
            ),

            // Todo Count
            // todos.length > 0 &&
            createElement("div", { class: "mt-4 text-center text-slate-400" }, [
              `${todos.filter((todo) => todo.completed).length} of ${
                todos.length
              } todos completed`,
            ]),
          ]
        ),
      ]
    );
  },

  updateNewTodoText(this: IComponent<IApp>, text: string) {
    this.updateState({ newTodoText: text });
  },

  addTodo(this: IComponent<IApp>) {
    const { newTodoText, todos } = this.state;
    if (newTodoText.trim()) {
      const newTodo: ITodo = {
        id: crypto.randomUUID(),
        text: newTodoText.trim(),
        completed: false,
        isEditing: false,
      };

      this.updateState({
        todos: [...todos, newTodo],
        newTodoText: "",
      });
    }
  },

  toggleTodo(this: IComponent<IApp>, id: string) {
    const updatedTodos = this.state.todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    this.updateState({ todos: updatedTodos });
  },

  deleteTodo(this: IComponent<IApp>, id: string) {
    const updatedTodos = this.state.todos.filter((todo) => todo.id !== id);
    this.updateState({ todos: updatedTodos });
  },

  startEditing(this: IComponent<IApp>, id: string) {
    const updatedTodos = this.state.todos.map((todo) =>
      todo.id === id ? { ...todo, isEditing: true } : todo
    );
    this.updateState({ todos: updatedTodos });
  },

  updateTodoText(this: IComponent<IApp>, id: string, text: string) {
    const updatedTodos = this.state.todos.map((todo) =>
      todo.id === id ? { ...todo, text } : todo
    );
    this.updateState({ todos: updatedTodos });
  },

  handleKeyPress(
    this: IComponent<IApp> & { addTodo: () => void },
    event: KeyboardEvent,
    id?: string
  ) {
    // For adding new todo
    if (!id && event.key === "Enter") {
      this.addTodo();
      return;
    }

    // For editing existing todo
    if (id) {
      if (event.key === "Enter") {
        const updatedTodos = this.state.todos.map((todo) =>
          todo.id === id ? { ...todo, isEditing: false } : todo
        );
        this.updateState({ todos: updatedTodos });
      } else if (event.key === "Escape") {
        // Revert to original text and exit edit mode
        const originalTodo = this.state.todos.find((todo) => todo.id === id);
        const updatedTodos = this.state.todos.map((todo) =>
          todo.id === id
            ? { ...todo, isEditing: false, text: originalTodo!.text }
            : todo
        );
        this.updateState({ todos: updatedTodos });
      }
    }
  },
});

createApp(App).mount(ROOT);
