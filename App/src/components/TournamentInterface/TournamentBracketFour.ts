import { createElement, defineComponent } from "@/uccello/Uccello";

const TournamentBracketFour = defineComponent({
  render() {
    return createElement("div", { class: ["w-full", "h-full", "flex-row"] }, [
      createElement("div", { class: ["w-full"] }, ["first"]),
      createElement("h4", { class: ["text-3xl"] }, ["Vs"]),
      createElement("div", { class: ["w-full"] }, ["last"]),
    ]);
  },
});

export default TournamentBracketFour;
