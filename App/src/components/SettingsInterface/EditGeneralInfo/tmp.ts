import {
  createElement,
  defineComponent,
  type IComponent,
} from "../../../uccello/Uccello.js";

interface EditGeneralInfoState {
  firstName: string;
  lastName: string;
  icon: string;
  color: string;
}

const EditGeneralInfo = defineComponent<EditGeneralInfoState>({
  state() {
    return { firstName: "", lastName: "", icon: "ph-nut", color: "" };
  },
  render(this: IComponent<EditGeneralInfoState>) {
    return createElement(
      "div",
      {
        class: [
          "w-full",
          "border-2",
          "rounded-3xl",
          "border-[#878787]",
          "border-opacity-30",
          "items-start",
          "px-6",
          "md:px-10",
          "py-4",
          "md:py-5",
          "gap-3",
          "md:gap-5",
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
          createElement("h3", { class: ["text-[18px]"] }, ["Edit your avatar"]),
          createElement("i", {
            class: [
              "ph",
              this.state.icon,
              "transition-transform",
              "text-[24px]",
              "font-medium",
              "ease-in-out",
              `text-[${this.state.color}]`,
            ],
          }),
        ]),
        createElement("hr", {
          class: [
            "w-full",
            "border",
            "border-[var(--light-grey)]",
            "rounded-full",
            "my-3",
            "md:my-4",
          ],
        }),
        createElement(
          "div",
          {
            class: [
              "flex",
              "flex-col",
              "md:flex-row",
              "w-full",
              "mb-auto",
              "gap-4",
              "md:gap-6",
            ],
          },
          [
            createElement(
              "div",
              {
                class: [
                  "items-start",
                  "gap-2",
                  "md:gap-3",
                  "relative",
                  "w-full",
                  "md:w-1/2",
                  "after:hidden",
                  "md:after:block",
                  "after:absolute",
                  "after:bg-[var(--light-grey)]",
                  "after:opacity-30",
                  "after:w-[3px]",
                  "after:rounded-full",
                  "after:content-['']",
                  "after:h-[80px]",
                  "after:right-[35px]",
                  "after:top-[10px]",
                ],
              },
              [
                createElement(
                  "label",
                  {
                    class: ["text-sm", "md:text-base", "mb-1"],
                  },
                  ["FirstName"]
                ),
                createElement("input", {
                  placeholder: "Enter your first name",
                  value: this.state.firstName,
                  on: {
                    input: (e) => {
                      this.updateState({ firstName: e?.target?.value });
                      if (this.state.firstName.length > 3)
                        this.updateState({
                          icon: "ph-check",
                          color: "var(--light-yellow)",
                        });
                      else if (!this.state.lastName.length) {
                        this.updateState({
                          icon: "ph-nut",
                          color: "var(--red-color)",
                        });
                      }
                      if (
                        !this.state.lastName.length &&
                        !this.state.firstName.length
                      ) {
                        this.updateState({
                          icon: "ph-nut",
                          color: "white",
                        });
                      }
                    },
                  },
                  class: [
                    "bg-transparent",
                    "border-2",
                    "w-full",
                    "max-w-full",
                    "md:max-w-[80%]",
                    "rounded-3xl",
                    "border-[#878787]",
                    "border-opacity-30",
                    "px-3",
                    "md:px-4",
                    "py-2",
                    "md:py-3",
                    "focus:border-[#828c3a]",
                    "text-[#878787]",
                    "focus:outline-none",
                    "text-sm",
                    "md:text-base",
                  ],
                }),
              ]
            ),
            createElement(
              "div",
              {
                class: [
                  "items-start",
                  "gap-2",
                  "md:gap-3",
                  "w-full",
                  "md:w-1/2",
                ],
              },
              [
                createElement(
                  "label",
                  {
                    class: ["text-sm", "md:text-base", "mb-1"],
                  },
                  ["LastName"]
                ),
                createElement("input", {
                  on: {
                    input: (e) => {
                      this.updateState({ lastName: e?.target?.value });
                      if (this.state.lastName.length > 3)
                        this.updateState({
                          icon: "ph-check",
                          color: "var(--light-yellow)",
                        });
                      else if (!this.state.firstName.length) {
                        this.updateState({
                          icon: "ph-nut",
                          color: "var(--red-color)",
                        });
                      }

                      if (
                        !this.state.lastName.length &&
                        !this.state.firstName.length
                      ) {
                        this.updateState({
                          icon: "ph-nut",
                          color: "white",
                        });
                      }
                    },
                  },
                  value: this.state.lastName,
                  placeholder: "Enter your last name",
                  class: [
                    "bg-transparent",
                    "border-2",
                    "w-full",
                    "max-w-full",
                    "md:max-w-[80%]",
                    "rounded-3xl",
                    "border-[#878787]",
                    "border-opacity-30",
                    "px-3",
                    "md:px-4",
                    "py-2",
                    "md:py-3",
                    "focus:border-[#828c3a]",
                    "text-[#878787]",
                    "focus:outline-none",
                    "text-sm",
                    "md:text-base",
                  ],
                }),
              ]
            ),
          ]
        ),
      ]
    );
  },
});

export default EditGeneralInfo;
