import FriendsInterface from "../components/FriendsInterface/FriendsInterface.js";
import LeaderBoardInterface from "../components/LeaderBoardInterface/LeaderBoardInterface.js";
import { createElement, defineComponent } from "../uccello/Uccello.js";

const LeaderBoard = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "main",
      {
        class: ["w-full", "flex", "flex-row", "h-[900px]", "pt-[50px]", "z-10"],
      },
      [
        createElement(
          "div",
          {
            class: [
              "w-full",
              "h-full",
              "justify-start",
              "items-start",
              "gap-5",
            ],
          },
          [
            createElement(
              "div",
              { class: ["flex-row", "items-end", "gap-4", "font-medium"] },
              [
                createElement("h2", { class: ["text-4xl"] }, ["Friends"]),
                createElement("i", {
                  class: ["text-[40px]", "ph", "ph-users-three"],
                }),
              ]
            ),
            createElement("p", { class: ["text-base", "w-[80%]"] }, [
              "The people I share the ping pong table with aren’t just players; they’re my friends who make the game enjoyable and engaging.",
            ]),
            createElement(FriendsInterface),
          ]
        ),
        createElement(
          "div",
          {
            class: [
              "w-full",
              "h-full",
              "justify-start",
              "items-start",
              "gap-5",
            ],
          },
          [
            createElement(
              "div",
              { class: ["flex-row", "items-end", "gap-4", "font-medium"] },
              [
                createElement("h2", { class: ["text-4xl"] }, ["Leaderboard"]),
                createElement("img", {
                  class: ["w-[40px]"],
                  src: "../../../public/assets/trophy.png",
                }),
              ]
            ),
            createElement("p", { class: ["text-base", "w-[80%]"] }, [
              "The leaderboard showcases the top players, highlighting their skills, dedication, and achievements.",
            ]),
            createElement(LeaderBoardInterface),
          ]
        ),
      ]
    );
  },
});

export default LeaderBoard;
