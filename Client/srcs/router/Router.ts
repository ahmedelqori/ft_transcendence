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
import { eventBus, HashRouter } from "../uccello/Uccello.js";

const routes: any[] = [
  {
    path: "/",
    component: Welcome,
    beforeEnter: async () => {
      if (await isAuth()) return "/dashboard";
    },
  },
  {
    path: "/login",
    component: Login,
    beforeEnter: async () => {
      if (await isAuth()) return "/dashboard";
    },
  },
  {
    path: "/dashboard",
    component: Dashboard,
    beforeEnter: async () => {
      if (!(await isAuth())) return "/login";
    },
  },
  {
    path: "/profile",
    component: Profile,
    beforeEnter: async () => {
      if (!(await isAuth())) return "/login";
    },
  },
  {
    path: "/settings",
    component: Settings,
    beforeEnter: async () => {
      if (!(await isAuth())) return "/login";
    },
  },
  {
    path: "/leaderboard",
    component: LeaderBoard,
    beforeEnter: async () => {
      if (!(await isAuth())) return "/login";
    },
  },
  {
    path: "/chat",
    component: Chat,
    beforeEnter: async () => {
      if (!(await isAuth())) return "/login";
    },
  },
  {
    path: "/tournament",
    component: Tournament,
    beforeEnter: async () => {
      if (!(await isAuth())) return "/login";
    },
  },
  {
    path: "/game",
    component: Game,
    beforeEnter: async () => {
      if (!(await isAuth())) return "/login";
    },
  },
  {
    path: "*",
    component: NotFound,
  },
];

async function isAuth() {
  try {
    const response = await fetch("http://localhost:3000/isAuth", {
      mode: "cors",
      credentials: "include",
    });
    const data = await response.json();
    if (data.user !== "none") {
      localStorage.setItem("user", data.user), eventBus.emit("auth:login");
    }

    return localStorage.getItem("user") !== null;
  } catch (err) {
    console.log(err);
    return localStorage.getItem("user") !== null;
  }
}

export const router = new HashRouter(routes);
