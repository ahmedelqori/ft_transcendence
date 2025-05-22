import { createElement, defineComponent } from "@/uccello/Uccello.js";
import EditAvatar from "./EditAvatar/EditAvatar.js";
import EditGeneralInfo from "./EditGeneralInfo/EditGeneralInfo.js";
import EditSecurity from "./EditInfo/EditInfo.js";

const SettingsInteface = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: [
          "w-[90%]",
          "h-full",
          "flex",
          "flex-col",
          "items-start",
          "justify-start",
          "gap-[40px]",
          "overflow-hidden",
          "p-5",
        ],
      },
      [
        createElement("h2", { class: ["text-4xl"] }, ["Settings Page"]),
        createElement(
          "div",
          {
            class: [
              "w-full",
              "grid",
              "grid-cols-4",
              "grid-rows-5",
              "gap-4",
              "h-full",
            ],
          },
          [
            createElement(EditAvatar),
            createElement(EditGeneralInfo),
            createElement(EditSecurity),
          ]
        ),
      ]
    );
  },
});

export default SettingsInteface;
