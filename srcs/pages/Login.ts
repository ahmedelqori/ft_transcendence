import { createElement, defineComponent } from "../uccello/Uccello.js";

const Login = defineComponent<void>({
  state() {},
  render() {
    return createElement("div", {}, ["Login Page"]);
  },
});

export default Login;
