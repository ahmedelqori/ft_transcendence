import { createElement, defineComponent } from "../uccello/Uccello.js";

const Profile = defineComponent<void>({
  onMounted() {
    document.title = "Profile";
  },
  state() {},
  render() {
    return createElement("div", {}, ["Profile Page"]);
  },
});

export default Profile;
