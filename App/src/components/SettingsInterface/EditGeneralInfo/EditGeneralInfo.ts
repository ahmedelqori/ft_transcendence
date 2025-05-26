import enhancedFetch from "@/Hooks/fetch.js";
import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";

interface EditGeneralInfoState {
  firstName: string;
  lastName: string;
  icon: string;
  color: string;
}

const EditGeneralInfo = defineComponent<EditGeneralInfoState>({
  async onMounted(this: IComponent<EditGeneralInfoState>) {
    try {
      const response = await enhancedFetch.fetch(
        "https://www.meedivo.me/api/account/whoami/"
      );
      const data = await response.json();
      this.updateState({
        firstName: data.first_name,
        lastName: data.last_name,
      });
    } catch (err) {}
  },
  state() {
    return { firstName: "", lastName: "", icon: "ph-nut", color: "" };
  },
  render(
    this: IComponent<EditGeneralInfoState> & { handleSubmit: () => void }
  ) {
    return createElement(
      "div",
      {
        class: [
          "z-10",
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
          "h-56",
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
            on: {
              click: this.handleSubmit,
            },
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
  async handleSubmit(this: IComponent<EditGeneralInfoState>) {
    try {
      if (this.state.firstName.length > 3 && this.state.lastName.length > 3) {
        await enhancedFetch.fetch(
          "https://www.meedivo.me/api/account/update-profile/",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              first_name: this.state.firstName,
              last_name: this.state.lastName,
            }),
          }
        );
      } else if (this.state.firstName.length > 3) {
        await enhancedFetch.fetch(
          "https://www.meedivo.me/api/account/update-profile/",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              first_name: this.state.firstName,
            }),
          }
        );
      } else if (this.state.lastName.length > 3) {
        await enhancedFetch.fetch(
          "https://www.meedivo.me/api/account/update-profile/",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              last_name: this.state.lastName,
            }),
          }
        );
      }
    } catch (err) {
      console.log(err);
    }
    this.updateState({
      icon: "ph-nut",
      color: "white",
    });
  },
});

export default EditGeneralInfo;
