import SettingsInteface from "@/components/SettingsInterface/SettingsInterface.js";
import { createElement, defineComponent } from "@/uccello/Uccello.js";

const Settings = defineComponent<void>({
  onMounted() {
    document.title = "Settings";
  },
  state() {},
  render() {
    return createElement(
      "main",
      {
        class: [
          "col-span-3",
          "w-full",
          "h-[90%]",
          "mt-[20px]",
          "items-start",
          "flex",
          "flex-col",
          "gap-[20px]",
        ],
      },
      [createElement(SettingsInteface)]
    );
  },
});

export default Settings;
