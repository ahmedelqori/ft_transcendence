import { createElement, defineComponent } from "../../../uccello/Uccello.js";

const EditGeneralInfo = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: [
          "w-full",
          "border-2",
          "rounded-[30px]",
          "border-[#878787]",
          "border-opacity-[30%]",
          "items-start",
          "px-[40px]",
          "py-[20px]",
          "gap-5",
          "col-span-2",
          "row-span-2",
          "col-start-3",
          "h-fit",
          "min-h-[220px]",
          "justify-start",
        ],
      },
      [
        createElement("div", { class: ["flex-row", "w-full"] }, [
          createElement("h3", { class: ["text-[18px]"] }, [
            "Edit your profile",
          ]),
          createElement("i", {
            class: [
              "ph",
              "ph-nut",
              "transition-transform",
              "text-[24px]",
              "font-medium",
            ],
          }),
        ]),
        createElement("hr", {
          class: [
            "w-full",
            "border-1",
            "border-[var(--light-grey)]",
            "rounded-full",
          ],
        }),
        createElement("div", { class: ["flex-row", "w-full", "mb-auto"] }, [
          createElement(
            "div",
            {
              class: [
                "items-start",
                "gap-3",
                "relative",
                "after:absolute",
                "after:bg-[var(--light-grey)]",
                "after:opacity-[30%]",
                "after:w-[3px]",
                "after:rounded-full",
                "after:content-['']",
                "after:h-[80px]",
                "after:right-[35px]",
                "after:top-[10px]",
              ],
            },
            [
              createElement("label", {}, ["FirstName"]),
              createElement("input", {
                placeholder: "Enter your first name",
                class: [
                  "bg-transparent",
                  "border-2",
                  "max-w-[80%]",
                  "rounded-[30px]",
                  "border-[#878787]",
                  "border-opacity-[30%]",
                  "px-[16px]",
                  "py-[12px]",
                  "focus:border-[#828c3a]",
                  "text-[#878787]",
                  "focus:outline-none",
                ],
              }),
            ]
          ),
          createElement("div", { class: ["items-start", "gap-3", "w-full"] }, [
            createElement("label", {}, ["FirstName"]),
            createElement("input", {
              placeholder: "Enter your last name",
              class: [
                "bg-transparent",
                "border-2",
                "max-w-[80%]",
                "rounded-[30px]",
                "border-[#878787]",
                "border-opacity-[30%]",
                "px-[16px]",
                "py-[12px]",
                "focus:border-[#828c3a]",
                "text-[#878787]",
                "focus:outline-none",
              ],
            }),
          ]),
        ]),
      ]
    );
  },
});

export default EditGeneralInfo;
