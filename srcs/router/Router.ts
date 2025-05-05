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
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/dashboard",
    component: Dashboard,
  },
  {
    path: "/profile",
    component: Profile,
  },
  {
    path: "/settings",
    component: Settings,
  },
  {
    path: "/leaderboard",
    component: LeaderBoard,
  },
  {
    path: "/chat",
    component: Chat,
  },
  {
    path: "/tournament",
    component: Tournament,
  },
  {
    path: "/game",
    component: Game,
  },
  {
    path: "/game/:userId",
    component: Game,
  },
  {
    path: "*",
    component: NotFound,
  },
];

export const router = new HashRouter(routes);
