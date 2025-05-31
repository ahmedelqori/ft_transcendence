import { authState } from "@/Hooks/Auth";
import { createElement, defineComponent } from "@/uccello/Uccello";

const ProfileDashboard = defineComponent({
  render() {
    return createElement(
      "div",
      {
        class: [
          "w-fit",
          "h-full",
          "rounded-[30px]",
          "border-2",
          "border-[#878787]",
          "border-opacity-[30%]",
          "px-8",
          "py-8",
        ],
      },
      [
        createElement("img", {
          src: authState.getState().user?.avatar,
          width: "128",
          height: "128",
          class: ["rounded-full"],
        }),
      ]
    );
  },
});

export default ProfileDashboard;
