import { authState } from "@/Hooks/Auth";
import enhancedFetch from "@/Hooks/fetch";
import {
  createElement,
  createFragment,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";
import FriendsSideBar from "./FriendsSideBar";
import Loader from "../Loader/Loader";
import ProfileDashboard from "./ProfileDashboard";
import LocalDashboard from "./LocalDashboard";
import FriendDashboard from "./FriendDashboard";
import TournamentDashboard from "./TournamentDashboard";
import SideBarDashboard from "./SideBarDashboard";
import GamesDashboard from "./GamesDashboard";
import TournamentHistory from "./TournamentHistory";

interface IDashboardInterface {}

const DashboardInterface = defineComponent<IDashboardInterface>({
  async onMounted(this: IComponent<IDashboardInterface> & {}) {},
  state() {
    return {};
  },

  render(
    this: IComponent<IDashboardInterface> & { sendInvite: () => Promise<void> }
  ) {
    return createElement(
      "section",
      {
        class: [
          "flex",
          "z-10",
          "gap-4",
          "w-full",
          "relative",
          "py-8",
          "px-6",
          "max-lg:py-4",
          "h-[75vh]",
          "max-lg:h-full",
          "my-auto",
        ],
        style: {},
      },
      [
        createElement(
          "div",
          {
            class: [
              "w-full",
              "h-full",
              "bg-no-repeat",
              "rounded-[30px]",
              "gap-6",
            ],
            style: {
              "background-position": "center",
            },
          },
          [
            createElement(
              "div",
              {
                class: [
                  "w-full",
                  "h-full",
                  "flex-row",
                  "gap-5",
                  "justify-between",
                ],
              },
              [
                createElement(
                  "div",
                  {
                    class: [
                      "w-full",
                      "h-full",
                      "rounded-[30px]",
                      "flex-row",
                      "relative",
                      "items-center",
                    ],
                  },
                  [
                    createElement(LocalDashboard),
                    createElement(FriendDashboard),
                    createElement(TournamentDashboard),
                  ]
                ),
              ]
            ),
            createElement(
              "div",
              { class: ["w-full", "h-full", "flex-row", "gap-6"] },
              [createElement(GamesDashboard), createElement(TournamentHistory)]
            ),
          ]
        ),
        createElement(SideBarDashboard),
      ]
    );
  },
});

export default DashboardInterface;
