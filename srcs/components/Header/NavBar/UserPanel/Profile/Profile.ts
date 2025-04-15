import User from "./User/User.js";
import Notifications from "./Notifications/Notification.js";
import {
  createElement,
  defineComponent,
} from "../../../../../uccello/Uccello.js";

const Profile = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: ["flex", "flex-row", "gap-6"],
      },
      [
        createElement(Notifications),
        createElement(User),
        createElement("p", { class: ["hidden", "lg:block"] }, ["sajaite"]),
      ]
    );
  },
});

export default Profile;
