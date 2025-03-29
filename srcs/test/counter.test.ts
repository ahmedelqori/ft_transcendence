import { test, expect, beforeEach, afterEach } from "vitest";
import { createApp } from "../uccello/Uccello.js";
import { Counter } from "../components/Counter.js";

let app: any = null;

beforeEach(() => {
  app = createApp(Counter);
  app.mount(document.body);
});

afterEach(() => {
  app.unmount();
});

test("the counter starts at 0", () => {
  const counter = document.querySelector('[data-qa="counter"]');
  expect(counter?.textContent).toBe("0");
});

test("the counter increments wahen the button is clicked", () => {
  const button: HTMLButtonElement = document.querySelector(
    '[data-qa="increment"]'
  )!;
  const counter: HTMLElement = document.querySelector('[data-qa="counter"]')!;

  button.click();
  button.click();
  expect(counter.textContent).toBe("2");
});
