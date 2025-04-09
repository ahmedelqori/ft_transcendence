import { HashRouter } from "./uccello/Uccello.js";
import Hero from "./pages/Hero.js";
import Login from "./pages/Login.js";

const routes = [
  {
    path: "/",
    component: Hero,
  },
  {
    path: "/login",
    component: Login,
  },
];

export const router = new HashRouter(routes);
