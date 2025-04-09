import { createElement, defineComponent } from "../uccello/Uccello.js";

const Settings = defineComponent<void>({
  state() {},
  render() {
    return createElement("div", {}, ["Settings Page"]);
  },
});

export default Settings;
