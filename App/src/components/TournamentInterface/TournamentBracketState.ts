import { createElement, defineComponent, IComponent } from "@/uccello/Uccello";
import TournamentBracketFour from "./TournamentBracketFour";
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
      createElement(TournamentBracketFour),
    ]);
  },
});

export default TournamentBracketState;
