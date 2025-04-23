import { router } from "../router/Router.js";
import {
  createElement,
  defineComponent,
  eventBus,
} from "../uccello/Uccello.js";

const Login = defineComponent<void>({
  onMounted() {
    document.title = "Login";
  },
  state() {},
  render() {
    return createElement("div", {}, [
      "Login Page",
      createElement(
        "button",
        {
          on: {
            click: () => {
              localStorage.setItem("user", JSON.stringify("Meedivo"));
              eventBus.emit("auth:login");
              router.navigateTo("/dashboard");
            },
          },
        },
        ["Click Me"]
      ),
    ]);
  },
});

export default Login;
