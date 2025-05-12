import { createElement, defineComponent, IComponent } from "@/uccello/Uccello";
import TournamentStartState from "./TournamentStartState";
import TournamentCreateState from "./TournamentCreateState";
import TournamentBracketState from "./TournamentBracketState";

interface TournamentInterfaceState {
  state: string;
}

const TournamentInterface = defineComponent<TournamentInterfaceState>({
  state() {
    return { state: "start" };
  },
  render(this: IComponent<TournamentInterfaceState>) {
    return this.state.state === "start"
      ? createElement(TournamentStartState, {
          setState: (state: string) => {
            this.updateState({ state });
          },
        })
      : this.state.state === "create"
      ? createElement(TournamentCreateState, {
          setState: (state: string) => {
            this.updateState({ state });
          },
        })
      : this.state.state === "bracket"
      ? createElement(TournamentBracketState)
      : createElement("div", {}, ["None"]);
  },
});

export default TournamentInterface;
