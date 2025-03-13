export const reducers = {
  "update-current-todo": (state: any, currentTodo: any) => ({
    ...state,
    currentTodo,
  }),
  "add-todo": (state: any) => ({
    ...state,
    currentTodo: "",
    todos: [...state.todos, state.currentTodo],
  }),
  "start-editing-todo": (state: any, idx: any) => ({
    ...state,
    edit: {
      idx,
      original: state.todos[idx],
      edited: state.todos[idx],
    },
  }),
  "edit-todo": (state: any, edited: any) => ({
    ...state,
    edit: { ...state.edit, edited },
  }),
  "save-edited-todo": (state: any) => {
    const todos = [...state.todos];
    todos[state.edit.idx] = state.edit.edited;
    return {
      ...state,
      edit: { idx: null, original: null, edited: null },
      todos,
    };
  },
  "cancel-editing-todo": (state: any) => ({
    ...state,
    edit: { idx: null, original: null, edited: null },
  }),
  "remove-todo": (state: any, idx: any) => ({
    ...state,
    todos: state.todos.filter((_: any, i: any) => i !== idx),
  }),
};
