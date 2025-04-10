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
        class: ["flex", "flex-row", "gap-4"],
      },
      [
        createElement(Notifications),
        createElement(User),
        createElement("p", {}, ["Meedivo"]),
      ]
    );
  },
});

export default Profile;
