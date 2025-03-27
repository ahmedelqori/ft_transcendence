import {
  createElement,
  createFragment,
  defineComponent,
  IComponent,
} from "../uccello/Uccello.js";

interface RandomState {
  isLoading: boolean;
  cocktail: any;
}

const url = "https://www.thecocktaildb.com/api/json/v1/1/random.php";

async function fetchRandomCocktail() {
  const response = await fetch(url);
  const data = await response.json();

  return data.drinks[0];
}

const RandomCocktail = defineComponent<RandomState>({
  state(): RandomState {
    return {
      isLoading: false,
      cocktail: null,
    };
  },

  render(this: IComponent<RandomState> & { fetchCocktail: () => void }) {
    const { isLoading, cocktail } = this.state;

    if (isLoading) {
      return createFragment([
        createElement("h1", { class: ["text-xl", "font-bold", "mb-4"] }, [
          "Random Cocktail",
        ]),
        createElement("p", { class: ["text-lg", "italic"] }, ["Loading..."]),
      ]);
    }

    if (!cocktail) {
      return createFragment([
        createElement("h1", { class: ["text-xl", "font-bold", "mb-4"] }, [
          "Random Cocktail",
        ]),
        createElement(
          "button",
          {
            class: ["bg-blue-500", "text-white", "px-4", "py-2", "rounded"],
            on: { click: this.fetchCocktail },
          },
          ["Get a cocktail"]
        ),
      ]);
    }

    const { strDrink, strDrinkThumb, strInstructions } = cocktail;

    return createFragment([
      createElement("h1", { class: ["text-2xl", "font-semibold", "mb-2"] }, [
        strDrink,
      ]),
      createElement("p", { class: ["text-md", "mb-4"] }, [strInstructions]),
      createElement("img", {
        src: strDrinkThumb,
        alt: strDrink,
        style: { width: "300px", height: "300px" },
        class: ["rounded-lg", "mb-4"],
      }),
      createElement(
        "button",
        {
          class: [
            "bg-green-500",
            "text-white",
            "px-4",
            "py-2",
            "rounded",
            "block",
            "mx-auto",
            "mt-4",
          ],
          on: { click: this.fetchCocktail },
        },
        ["Get another cocktail"]
      ),
    ]);
  },

  async fetchCocktail() {
    this.updateState({ isLoading: true, cocktail: null });
    const cocktail = await fetchRandomCocktail();

    setTimeout(() => {
      this.updateState({ isLoading: false, cocktail });
    }, 1000);
  },
});

export default RandomCocktail;
