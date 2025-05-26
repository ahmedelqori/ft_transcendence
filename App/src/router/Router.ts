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
import AccessToken from "../pages/AccessToken.js";
import enhancedFetch from "../Hooks/fetch.js";
import LocalGame from "@/pages/LocalGame.js";
import GameSetup from "@/pages/GameSetup.js";
import { authState } from "@/Hooks/Auth.js";
import TwoFA from "@/pages/TwoFA.js";

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
    path: "/profile/:username",
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
    path: "/tournament/:id",
    component: Tournament,
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
    component: GameSetup,
    beforeEnter: async () => {
      if (!(await isAuth())) return "/login";
    },
  },
  {
    path: "/localGame",
    component: LocalGame,
    beforeEnter: async () => {
      if (!(await isAuth())) return "/login";
    },
  },
  {
    path: "/game/:gameId",
    component: Game,
    beforeEnter: async () => {
      if (!(await isAuth())) return "/login";
    },
  },
  {
    path: "/login/:accessToken",
    component: AccessToken,
  },
  {
    path: "/verify/:accessToken",
    component: TwoFA,
  },
  {
    path: "*",
    component: NotFound,
    beforeEnter: async () => {
      if (!(await isAuth())) return "/login";
    },
  },
];

export async function isAuth() {
  try {
    const isAuthenticated = authState.getState().isAuthenticated;
    if (isAuthenticated) return true;
    const checkIfUserLoggedIn = await fetch(
      `${import.meta.env.VITE_URL_DEV}/api/account/whoami/`,
      {
        mode: "cors",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    if (!checkIfUserLoggedIn.ok) throw new Error("User not authenticated");

    const userData = await checkIfUserLoggedIn.json();
    authState.setState({
      isAuthenticated: true,
      user: {
        username: userData.username,
        id: userData.id,
        avatar: userData.avatar_url,
      },
    });
    return true;
  } catch (err) {
    eventBus.emit("auth:logout");
    return false;
  }
}

export const router = new HashRouter(routes);
