import { createElement, defineComponent } from "@/uccello/Uccello.js";
import Card from "./Cards/Card.js";
import FirstCard from "./Cards/FirstCard.js";
import SecondCard from "./Cards/SecondCard.js";
import ThirdCard from "./Cards/ThirdCard.js";

const LeaderBoardInterface = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: [
          "w-[90%]",
          "h-full",
          "max-h-[720px]",
          "border-2",
          "rounded-[30px]",
          "border-[#878787]",
          "border-opacity-[30%]",
          "flex",
          "flex-col",
          "gap-[40px]",
          "overflow-hidden",
          "p-5",
        ],
      },
      [
        createElement(
          "div",
          { class: ["flex", "flex-row", "justify-center", "gap-5", "w-full"] },
          [
            createElement(SecondCard),
            createElement(FirstCard),
            createElement(ThirdCard),
          ]
        ),
        createElement(
          "div",
          {
            class: [
              "w-full",
              "flex-1",
              "flex",
              "flex-col",
              "gap-4",
              "pr-2",
              "justify-start",
              "overflow-scroll",
              "overflow-x-hidden",
              "overflow-y-auto",
              "[&::-webkit-scrollbar]:w-1",
              "[&::-webkit-scrollbar-track]:rounded-full",
              "[&::-webkit-scrollbar-track]:bg-gray-100",
              "[&::-webkit-scrollbar-thumb]:rounded-full",
              "[&::-webkit-scrollbar-thumb]:bg-gray-300",
              "dark:[&::-webkit-scrollbar-track]:bg-transparent",
              "dark:[&::-webkit-scrollbar-thumb]:bg-[#ddf247]",
              "dark:[&::-webkit-scrollbar-thumb]:bg-opacity-[70%]",
            ],
          },
          [
            createElement(Card),
            createElement(Card),
            createElement(Card),
            createElement(Card),
            createElement(Card),
            createElement(Card),
            createElement(Card),
          ]
        ),
      ]
    );
  },
});

export default LeaderBoardInterface;
