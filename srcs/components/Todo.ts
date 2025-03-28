import {
  createApp,
  defineComponent,
  createElement,
  createFragment,
  IComponent,
  ELEMENT_INTER,
} from "../uccello/Uccello.js";

interface ITodo {
  id: string;
  text: string;
}

interface IApp {
  todos: ITodo[];
}
const App = defineComponent<IApp>({
  state() {
    return {
      todos: [
        { id: crypto.randomUUID(), text: "Walk the dog" },
        { id: crypto.randomUUID(), text: "Water the plants" },
        { id: crypto.randomUUID(), text: "Sand the chairs" },
      ],
    };
  },

  render(
    this: IComponent<IApp> & {
      addTodo: (text: string) => void;
      removeTodo: (idx: number) => void;
      editTodo: ({ edited, i }: { edited: string; i: number }) => void;
    }
  ) {
    const { todos } = this.state;
    return createFragment([
      createElement("h1", {}, ["My TODOs"]),
      createElement(CreateTodo, {
        on: {
          add: this.addTodo,
        },
      }),
      createElement(TodoList, {
        todos,
        on: {
          remove: this.removeTodo,
          edit: this.editTodo,
        },
      }),
    ]);
  },

  addTodo(this: IComponent<IApp>, text: string) {
    const todo = { id: crypto.randomUUID(), text };
    this.updateState({ todos: [...this.state.todos, todo] });
  },

  removeTodo(this: IComponent<IApp>, idx: number) {
    if (!this.state) return;
    const newTodos = [...this.state.todos];
    newTodos.splice(idx, 1);
    this.updateState({ todos: newTodos });
  },

  editTodo(
    this: IComponent<IApp>,
    { edited, i }: { edited: string; i: number }
  ) {
    const newTodos = [...this.state.todos];
    newTodos[i] = { ...newTodos[i], text: edited };
    this.updateState({ todos: newTodos });
  },
});

interface ICreateTodo {
  text: string;
}

const CreateTodo = defineComponent<ICreateTodo>({
  state() {
    return { text: "" };
  },

  render(this: IComponent<ICreateTodo> & { addTodo: () => void }) {
    const { text } = this.state;

    return createElement("div", {}, [
      createElement("label", { for: "todo-input" }, ["New TODO"]),
      createElement("input", {
        type: "text",
        id: "todo-input",
        value: text,
        on: {
          input: ({ target }) => this.updateState({ text: target.value }),
          keydown: ({ key }) => {
            if (key === "Enter" && text.length >= 3) {
              this.addTodo();
            }
          },
        },
      }),
      createElement(
        "button",
        {
          disabled: text.length < 3,
          on: { click: this.addTodo },
        },
        ["Add"]
      ),
    ]);
  },

  addTodo(this: IComponent<ICreateTodo>) {
    this.emit("add", this.state.text);
    this.updateState({ text: "" });
  },
});

interface ITodoList {
  todos: any;
}

interface PTodoList {
  todos: ITodo[];
}

const TodoList = defineComponent<ITodoList, PTodoList>({
  render(this: IComponent<ITodoList, PTodoList>) {
    const { todos } = this.props;

    return createElement(
      "ul",
      {},
      todos.map((todo, i) =>
        createElement(TodoItem, {
          key: todo.id,
          todo: todo.text,
          i,
          on: {
            remove: (i) => this.emit("remove", i),
            edit: ({ edited, i }) => this.emit("edit", { edited, i }),
          },
        })
      )
    );
  },
});

interface ITodoItem {
  original: string;
  edited: string;
  isEditing: boolean;
}

interface PTodoItem {
  todo: string;
  i: number;
}

const TodoItem = defineComponent<ITodoItem, PTodoItem>({
  state({ todo }: { todo: string }) {
    return {
      original: todo,
      edited: todo,
      isEditing: false,
    };
  },

  render(
    this: IComponent<ITodoItem> & {
      saveEdition: (this: IComponent<ITodoItem>) => void;
      cancelEdition: (this: IComponent<ITodoItem>) => void;
      renderInViewMode: (original: string) => ELEMENT_INTER;
      renderInEditMode: (edited: string) => ELEMENT_INTER;
    }
  ) {
    const { isEditing, original, edited } = this.state;

    return isEditing
      ? this.renderInEditMode(edited)
      : this.renderInViewMode(original);
  },

  renderInEditMode(edited) {
    return createElement("li", {}, [
      createElement("input", {
        value: edited,
        on: {
          input: ({ target }) => this.updateState({ edited: target.value }),
        },
      }),
      createElement(
        "button",
        {
          on: {
            click: this.saveEdition,
          },
        },
        ["Save"]
      ),
      createElement("button", { on: { click: this.cancelEdition } }, [
        "Cancel",
      ]),
    ]);
  },

  saveEdition(this: IComponent<ITodoItem, PTodoItem>) {
    this.updateState({ original: this.state.edited, isEditing: false });
    this.emit("edit", { edited: this.state.edited, i: this.props.i });
  },

  cancelEdition(this: IComponent<ITodoItem>) {
    this.updateState({ edited: this.state.original, isEditing: false });
  },

  renderInViewMode(this: IComponent<ITodoItem, PTodoItem>, original) {
    return createElement("li", {}, [
      createElement(
        "span",
        { on: { dblclick: () => this.updateState({ isEditing: true }) } },
        [original]
      ),
      createElement(
        "button",
        { on: { click: () => this.emit("remove", this.props.i) } },
        ["Done"]
      ),
    ]);
  },
});

createApp(App).mount(document.body);
