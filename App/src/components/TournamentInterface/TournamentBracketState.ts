import { createElement, defineComponent, IComponent } from "@/uccello/Uccello";
import TournamentBracket from "./TournamentBracket";
interface TournamentBracketStateProps {
  number: number;
  nickName: string;
  title: string;
}
const TournamentBracketState = defineComponent<
  void,
  TournamentBracketStateProps
>({
  render(this: IComponent<void, TournamentBracketStateProps>) {
    return createElement("div", { class: ["w-full", "h-full"] }, [
      createElement(TournamentBracket, { number: this.props.number }),
    ]);
  },
});

export default TournamentBracketState;
