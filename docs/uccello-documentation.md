# Uccello Library Documentation

Uccello is a lightweight virtual DOM library for building interactive web applications. It provides a set of tools for creating, updating, and manipulating the DOM using a virtual representation, similar to popular frameworks like React and Vue, but with a smaller footprint.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Virtual DOM](#virtual-dom)
3. [Component System](#component-system)
4. [Router](#router)
5. [Event Handling](#event-handling)
6. [State Management](#state-management)
7. [API Reference](#api-reference)

## Core Concepts

Uccello is built around several key concepts that work together to provide a complete solution for building web applications:

- **Virtual DOM**: An in-memory representation of the actual DOM that allows for efficient updates
- **Components**: Reusable, encapsulated pieces of UI with their own state and lifecycle
- **Event System**: A system for handling user interactions and component communication
- **Router**: Navigation and routing capabilities for single-page applications
- **State Management**: Tools for managing application state

## Virtual DOM

### Creating Elements

Uccello provides several functions for creating virtual DOM elements:

```typescript
// Create a regular HTML element
const div = createElement("div", { class: "container" }, [
  createElement("h1", {}, ["Hello World"]),
]);

// Create a text node
const text = createString("This is a text node");

// Create a fragment (group of elements without a wrapper)
const fragment = createFragment([
  createElement("h1", {}, ["Title"]),
  createElement("p", {}, ["Paragraph"]),
]);
```

### Element Types

Uccello supports several types of DOM elements:

- `ELEMENT`: Regular HTML elements (div, span, etc.)
- `TEXT`: Text nodes
- `FRAGMENT`: Document fragments (groups of elements)
- `COMPONENT`: Custom components
- `SLOT`: Placeholders for content projection

### Mounting and Updating

The virtual DOM is rendered to the actual DOM using the `mountDOM` function:

```typescript
// Mount to DOM
const app = createElement("div", { id: "app" }, [
  createElement("h1", {}, ["Hello, Uccello!"]),
]);
mountDOM(app, document.getElementById("root"));
```

When the state changes, the DOM is updated efficiently using the `patchDOM` function, which calculates the minimal set of changes needed.

## Component System

### Defining Components

Components are defined using the `defineComponent` function:

```typescript
const Counter = defineComponent({
  // Initial state factory
  state() {
    return { count: 0 };
  },

  // Lifecycle hooks
  onMounted() {
    console.log("Counter mounted");
  },

  onUnmounted() {
    console.log("Counter unmounted");
  },

  // Custom methods
  increment() {
    this.updateState({ count: this.state.count + 1 });
  },

  // Render function
  render() {
    return createElement("div", {}, [
      createElement("p", {}, [`Count: ${this.state.count}`]),
      createElement(
        "button",
        {
          on: { click: this.increment },
        },
        ["Increment"]
      ),
    ]);
  },
});
```

### Component Lifecycle

Components have the following lifecycle hooks:

1. Constructor: Component is initialized with props
2. Mount: Component is rendered to the DOM
3. Update: Component's state or props change
4. Unmount: Component is removed from the DOM

### Props and State

Components receive data through props and manage their own internal state:

```typescript
// Pass props when creating a component instance
createElement(UserProfile, { userId: "123", name: "John" });

// Update component state
this.updateState({ count: this.state.count + 1 });
```

### Content Projection with Slots

Components can accept and render children using slots:

```typescript
const Card = defineComponent({
  render() {
    return createElement("div", { class: "card" }, [
      createElement("div", { class: "card-header" }, [
        createElement("h3", {}, [this.props.title]),
      ]),
      createElement("div", { class: "card-body" }, [
        createSlot(), // Children will be rendered here
      ]),
    ]);
  },
});

// Usage
createElement(Card, { title: "My Card" }, [
  createElement("p", {}, ["Card content goes here"]),
]);
```

## Router

Uccello includes a hash-based router for handling navigation in single-page applications.

### Setting Up Routes

```typescript
import { HashRouter, createApp, RouterOutlet, RouterLink } from "uccello";

const routes = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  { path: "/users/:id", component: UserDetail },
  { path: "*", redirect: "/" },
];

const router = new HashRouter(routes);

const app = createApp(App, {}, { router });
app.mount(document.getElementById("app"));
```

### Route Components

```typescript
// Router outlet renders the current route's component
createElement(RouterOutlet);

// Router link for navigation
createElement(RouterLink, { to: "/about" }, [createString("About")]);
```

### Route Guards

Routes can have guards to control navigation:

```typescript
const routes = [
  {
    path: "/admin",
    component: Admin,
    beforeEnter: (from, to) => {
      if (!isUserAdmin()) {
        return "/login"; // Redirect to login
      }
      return true; // Allow navigation
    },
  },
];
```

### Accessing Route Information

Components can access route information through the app context:

```typescript
// Inside a component
const { router } = this.getAppContext;
const params = router.getParams;
const query = router.getQuery;

// Navigate programmatically
router.navigateTo("/users/123?tab=profile");
```

## Event Handling

### DOM Events

DOM events are handled using the `on` property:

```typescript
createElement(
  "button",
  {
    on: {
      click: (event) => {
        console.log("Button clicked!");
      },
    },
  },
  ["Click me"]
);
```

### Component Events

Components can emit and listen for custom events:

```typescript
// Inside a component, emit an event
this.emit("itemSelected", { id: 123 });

// Listen for the event when using the component
createElement(TodoItem, {
  on: {
    itemSelected: (payload) => {
      console.log("Item selected:", payload.id);
    },
  },
});
```

## State Management

### Component State

Each component manages its own internal state:

```typescript
const Counter = defineComponent({
  state() {
    return { count: 0 };
  },

  increment() {
    this.updateState({ count: this.state.count + 1 });
  },

  render() {
    return createElement("div", {}, [
      createString(`Count: ${this.state.count}`),
    ]);
  },
});
```

### Shared State with Context

Application-level state can be shared using the app context:

```typescript
// Create app with context
const app = createApp(RootComponent, props, {
  store: createStore({
    count: 0,
  }),
});

// Inside a component
const { store } = this.getAppContext;
store.dispatch("increment");
```

## API Reference

### Core Functions

- `createElement(tag, props, children)`: Create a virtual DOM element
- `createString(value)`: Create a text node
- `createFragment(children)`: Create a document fragment
- `createSlot(children)`: Create a slot for content projection
- `mountDOM(vdom, parentEl, index)`: Mount a virtual DOM to the real DOM
- `destroyDOM(vdom)`: Remove a virtual DOM element from the DOM
- `patchDOM(oldVdom, newVdom, parentEl)`: Update the DOM by comparing virtual DOM trees

### Component API

- `defineComponent(options)`: Define a new component
- `createApp(RootComponent, props, options)`: Create an application instance

#### Component Instance Methods

- `updateState(partialState)`: Update component state
- `updateProps(props)`: Update component props
- `emit(eventName, payload)`: Emit a custom event
- `mount(hostEl, index)`: Mount the component
- `unmount()`: Unmount the component

### Router API

- `HashRouter(routes)`: Create a router instance
- `RouterLink`: Component for navigation links
- `RouterOutlet`: Component that renders the current route

#### Router Instance Methods

- `navigateTo(path)`: Navigate to a specific path
- `back()`: Go back in history
- `forward()`: Go forward in history
- `subscribe(handler)`: Listen for route changes
- `unsubscribe(handler)`: Stop listening for route changes

### Utilities

- `Dispatcher`: Event bus for custom events
- `enqueueJob(job)`: Schedule a job to run after the current task
- `nextTick()`: Execute code after the next DOM update cycle

## Examples

### Simple Counter App

```typescript
import { createElement, defineComponent, createApp } from "uccello";

const Counter = defineComponent({
  state() {
    return { count: 0 };
  },

  increment() {
    this.updateState({ count: this.state.count + 1 });
  },

  decrement() {
    this.updateState({ count: Math.max(0, this.state.count - 1) });
  },

  render() {
    const { count } = this.state;

    return createElement("div", { class: "counter" }, [
      createElement("h2", {}, [`Current count: ${count}`]),
      createElement("div", { class: "buttons" }, [
        createElement(
          "button",
          {
            on: { click: this.decrement },
          },
          ["−"]
        ),
        createElement(
          "button",
          {
            on: { click: this.increment },
          },
          ["+"]
        ),
      ]),
    ]);
  },
});

const app = createApp(Counter);
app.mount(document.getElementById("app"));
```

### To-Do List App

```typescript
import {
  createElement,
  defineComponent,
  createApp,
  createString,
} from "uccello";

const TodoApp = defineComponent({
  state() {
    return {
      todos: [],
      newTodo: "",
    };
  },

  updateInput(e) {
    this.updateState({ newTodo: e.target.value });
  },

  addTodo(e) {
    e.preventDefault();
    if (!this.state.newTodo.trim()) return;

    this.updateState({
      todos: [
        ...this.state.todos,
        {
          id: Date.now(),
          text: this.state.newTodo,
          completed: false,
        },
      ],
      newTodo: "",
    });
  },

  toggleTodo(id) {
    this.updateState({
      todos: this.state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    });
  },

  render() {
    const { todos, newTodo } = this.state;

    return createElement("div", { class: "todo-app" }, [
      createElement("h1", {}, [createString("To-Do List")]),
      createElement("form", { on: { submit: this.addTodo } }, [
        createElement("input", {
          value: newTodo,
          on: { input: this.updateInput },
          placeholder: "Add a new todo",
        }),
        createElement("button", { type: "submit" }, [createString("Add")]),
      ]),
      createElement(
        "ul",
        { class: "todo-list" },
        todos.map((todo) =>
          createElement(
            "li",
            {
              key: todo.id,
              class: todo.completed ? "completed" : "",
              on: { click: () => this.toggleTodo(todo.id) },
            },
            [createString(todo.text)]
          )
        )
      ),
    ]);
  },
});

const app = createApp(TodoApp);
app.mount(document.getElementById("app"));
```

## Conclusion

Uccello provides a lightweight yet powerful foundation for building web applications. Its virtual DOM approach, component system, and routing capabilities make it suitable for a wide range of projects, from simple interactive elements to complete single-page applications.

While Uccello doesn't have all the features of larger frameworks, its simplicity and focused API make it easy to learn and use. The library's modular design also allows developers to adopt only the parts they need for their specific use cases.
