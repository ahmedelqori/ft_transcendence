import { createElement, defineComponent, IComponent } from "@/uccello/Uccello";
import TournamentBracket from "./TournamentBracket";
import { router } from "@/router/Router";
interface TournamentBracketStateProps {
  number: number;
  nickName: string;
  title: string;
}
interface TournamentBracketStateSt {}
const TournamentBracketState = defineComponent<
  TournamentBracketStateSt,
  TournamentBracketStateProps
>({
  async onMounted(
    this: IComponent<TournamentBracketStateSt, TournamentBracketStateProps>
  ) {},
  state() {
    return {};
  },
  render(
    this: IComponent<TournamentBracketStateSt, TournamentBracketStateProps>
  ) {
    return createElement("div", { class: ["w-full", "h-full"] }, [
      createElement(TournamentBracket, { number: this.props.number }),
    ]);
  },
});

export default TournamentBracketState;
