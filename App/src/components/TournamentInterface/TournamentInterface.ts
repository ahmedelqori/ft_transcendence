import { createElement, defineComponent, IComponent } from "@/uccello/Uccello";
import TournamentStartState from "./TournamentStartState";
import TournamentCreateState from "./TournamentCreateState";
import TournamentBracketState from "./TournamentBracketState";

interface TournamentInterfaceState {
  state: string;
  number: number;
  nickName: string;
  title: string;
}

const TournamentInterface = defineComponent<TournamentInterfaceState>({
  state() {
    return { state: "start", number: 4, nickName: "", title: "" };
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
          setData: (
            state: string,
            number: number,
            nickName: string,
            title: string
          ) => {
            this.updateState({ number, nickName, title, state });
          },
        })
      : this.state.state === "bracket"
      ? createElement(TournamentBracketState, {
          number: this.state.number,
          nickName: this.state.nickName,
          title: this.state.title,
        })
      : createElement("div", {}, ["None"]);
  },
});

export default TournamentInterface;
