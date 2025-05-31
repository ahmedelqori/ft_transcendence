import { createElement, defineComponent } from "@/uccello/Uccello";

const TournamentHistory = defineComponent({
  render() {
    return createElement(
      "div",
      {
        class: [
          "w-2/3",
          "h-full",
          "rounded-[30px]",
          "border-2",
          "border-[#878787]",
          "border-opacity-[30%]",
          "items-start",
          "px-2",
          "py-4",
          "gap-4",
        ],
      },
      ["Div"]
    );
  },
});

export default TournamentHistory;
