import Chat from "../pages/Chat.js";
import Game from "../pages/Game.js";
import Login from "../pages/Login.js";
import Profile from "../pages/Profile.js";
import Welcome from "../pages/Welcome.js";
import Settings from "../pages/Settings.js";
import NotFound from "../pages/NotFound.js";
import Dashboard from "../pages/Dashboard.js";
import Tournament from "../pages/Tournament.js";
import LeaderBoard from "../pages/LeaderBoard.js";
import { HashRouter } from "../uccello/Uccello.js";

const routes: any[] = [
  {
    path: "/",
    component: Welcome,
    // redirect: "/dashboard",
    beforeEnter: () => {
      if (isAuth()) return "/dashboard";
    },
  },
  {
    path: "/login",
    component: Login,
    beforeEnter: () => {
      if (isAuth()) return "/dashboard";
    },
  },
  {
    path: "/dashboard",
    component: Dashboard,
    beforeEnter: () => {
      if (!isAuth()) return "/login";
    },
  },
  {
    path: "/profile",
    component: Profile,
    beforeEnter: () => {
      if (!isAuth()) return "/login";
    },
  },
  {
    path: "/settings",
    component: Settings,
    beforeEnter: () => {
      if (!isAuth()) return "/login";
    },
  },
  {
    path: "/leaderboard",
    component: LeaderBoard,
    beforeEnter: () => {
      if (!isAuth()) return "/login";
    },
  },
  {
    path: "/chat",
    component: Chat,
    beforeEnter: () => {
      if (!isAuth()) return "/login";
    },
  },
  {
    path: "/tournament",
    component: Tournament,
    beforeEnter: () => {
      if (!isAuth()) return "/login";
    },
  },
  {
    path: "/game",
    component: Game,
    beforeEnter: () => {
      if (!isAuth()) return "/login";
    },
  },
  {
    path: "*",
    component: NotFound,
  },
];

function isAuth() {
  console.log("Hello");
  return localStorage.getItem("user") !== null;
}

export const router = new HashRouter(routes);
