import {
  createElement,
  defineComponent,
  eventBus,
  IComponent,
} from "@/uccello/Uccello";
import TournamentStartState from "./TournamentStartState";
import TournamentCreateState from "./TournamentCreateState";
import TournamentBracketState from "./TournamentBracketState";
import { router } from "@/router/Router";

interface TournamentInterfaceState {
  state: string;
  number: number;
  nickName: string;
  title: string;
}

const TournamentInterface = defineComponent<TournamentInterfaceState>({
  async onMounted(this: IComponent<TournamentInterfaceState>) {},
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
      : createElement("div", {}, ["None"]);
  },
});

export default TournamentInterface;
