import SettingsInteface from "@/components/SettingsInterface/SettingsInterface.js";
import { authState } from "@/Hooks/Auth";
import { createElement, defineComponent, eventBus } from "@/uccello/Uccello.js";

const Settings = defineComponent<void>({
  onMounted() {
    document.title = "Settings";
    eventBus.emit("navigate:bar", { data: "/settings" });
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
