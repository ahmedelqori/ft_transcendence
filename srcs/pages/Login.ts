import { createElement, defineComponent } from "../uccello/Uccello.js";

const Login = defineComponent<void>({
  onMounted() {
    document.title = "Login";
  },
  state() {},
  render() {
    return createElement("div", {}, ["Login Page"]);
  },
});

export default Login;
