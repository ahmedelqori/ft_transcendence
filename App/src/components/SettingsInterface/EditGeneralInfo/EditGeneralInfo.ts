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
        `${import.meta.env.VITE_URL_DEV}/api/account/whoami/`
      );
      const data = await response.json();
      if (this.getIsMounted)
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
    this: IComponent<EditGeneralInfoState> & {
      handleSubmit: () => void;
      updateFirstName: () => Promise<void>;
      updateLastName: () => Promise<void>;
    }
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
        // createElement("div", { class: ["flex-row", "w-full"] }, [
        //   createElement("h3", { class: ["text-[18px]"] }, ["Edit your avatar"]),
        //   createElement("i", {
        //     class: [
        //       "ph",
        //       this.state.icon,
        //       "transition-transform",
        //       "text-[24px]",
        //       "font-medium",
        //       "ease-in-out",
        //       `text-[${this.state.color}]`,
        //     ],
        //     on: {
        //       click: this.handleSubmit,
        //     },
        //   }),
        // ]),
        // createElement("hr", {
        //   class: [
        //     "w-full",
        //     "border",
        //     "border-[var(--light-grey)]",
        //     "rounded-full",
        //     "my-3",
        //     "md:my-4",
        //   ],
        // }),
        // createElement(
        //   "div",
        //   {
        //     class: [
        //       "flex",
        //       "flex-col",
        //       "md:flex-row",
        //       "w-full",
        //       "mb-auto",
        //       "gap-4",
        //       "md:gap-6",
        //     ],
        //   },
        //   [
        //     createElement(
        //       "div",
        //       {
        //         class: [
        //           "items-start",
        //           "gap-2",
        //           "md:gap-3",
        //           "relative",
        //           "w-full",
        //           "md:w-1/2",
        //           "after:hidden",
        //           "md:after:block",
        //           "after:absolute",
        //           "after:bg-[var(--light-grey)]",
        //           "after:opacity-30",
        //           "after:w-[3px]",
        //           "after:rounded-full",
        //           "after:content-['']",
        //           "after:h-[80px]",
        //           "after:right-[35px]",
        //           "after:top-[10px]",
        //         ],
        //       },
        //       [
        //         createElement(
        //           "label",
        //           {
        //             class: ["text-sm", "md:text-base", "mb-1"],
        //           },
        //           ["FirstName"]
        //         ),
        //         createElement("input", {
        //           placeholder: "Enter your first name",
        //           value: this.state.firstName,
        //           on: {
        //             input: (e) => {
        //               this.updateState({ firstName: e?.target?.value });
        //               if (this.state.firstName.length > 3)
        //                 this.updateState({
        //                   icon: "ph-check",
        //                   color: "var(--light-yellow)",
        //                 });
        //               else if (!this.state.lastName.length) {
        //                 this.updateState({
        //                   icon: "ph-nut",
        //                   color: "var(--red-color)",
        //                 });
        //               }
        //               if (
        //                 !this.state.lastName.length &&
        //                 !this.state.firstName.length
        //               ) {
        //                 this.updateState({
        //                   icon: "ph-nut",
        //                   color: "white",
        //                 });
        //               }
        //             },
        //           },
        //           class: [
        //             "bg-transparent",
        //             "border-2",
        //             "w-full",
        //             "max-w-full",
        //             "md:max-w-[80%]",
        //             "rounded-3xl",
        //             "border-[#878787]",
        //             "border-opacity-30",
        //             "px-3",
        //             "md:px-4",
        //             "py-2",
        //             "md:py-3",
        //             "focus:border-[#828c3a]",
        //             "text-[#878787]",
        //             "focus:outline-none",
        //             "text-sm",
        //             "md:text-base",
        //           ],
        //         }),
        //       ]
        //     ),
        //     createElement(
        //       "div",
        //       {
        //         class: [
        //           "items-start",
        //           "gap-2",
        //           "md:gap-3",
        //           "w-full",
        //           "md:w-1/2",
        //         ],
        //       },
        //       [
        //         createElement(
        //           "label",
        //           {
        //             class: ["text-sm", "md:text-base", "mb-1"],
        //           },
        //           ["LastName"]
        //         ),
        //         createElement("input", {
        //           on: {
        //             input: (e) => {
        //               this.updateState({ lastName: e?.target?.value });
        //               if (this.state.lastName.length > 3)
        //                 this.updateState({
        //                   icon: "ph-check",
        //                   color: "var(--light-yellow)",
        //                 });
        //               else if (!this.state.firstName.length) {
        //                 this.updateState({
        //                   icon: "ph-nut",
        //                   color: "var(--red-color)",
        //                 });
        //               }

        //               if (
        //                 !this.state.lastName.length &&
        //                 !this.state.firstName.length
        //               ) {
        //                 this.updateState({
        //                   icon: "ph-nut",
        //                   color: "white",
        //                 });
        //               }
        //             },
        //           },
        //           value: this.state.lastName,
        //           placeholder: "Enter your last name",
        //           class: [
        //             "bg-transparent",
        //             "border-2",
        //             "w-full",
        //             "max-w-full",
        //             "md:max-w-[80%]",
        //             "rounded-3xl",
        //             "border-[#878787]",
        //             "border-opacity-30",
        //             "px-3",
        //             "md:px-4",
        //             "py-2",
        //             "md:py-3",
        //             "focus:border-[#828c3a]",
        //             "text-[#878787]",
        //             "focus:outline-none",
        //             "text-sm",
        //             "md:text-base",
        //           ],
        //         }),
        //       ]
        //     ),
        //   ]
        // ),
        createElement("div", { class: ["flex-row", "w-full"] }, [
          createElement("h3", { class: ["text-[18px]"] }, ["Edit your avatar"]),
          createElement("i", {
            class: [
              "ph",
              "ph-sketch-logo",
              "transition-transform",
              "text-[24px]",
              "font-medium",
              "ease-in-out",
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
        createElement(
          "div",
          { class: ["flex-row", "w-full", "h-full", "gap-16"] },
          [
            createElement("div", { class: ["gap-4", "items-start"] }, [
              createElement("label", { class: ["font-light"] }, ["FirstName"]),
              createElement("input", {
                value: this.state.firstName,
                on: {
                  input: (e: any) => {
                    if (this.getIsMounted)
                      this.updateState({ firstName: e.target.value });
                  },
                  change: async () => await this.updateFirstName(),
                },
                class: [
                  "px-4",
                  "py-4",
                  "w-full",
                  "h-[50px]",
                  "border-2",
                  "pr-[50px]",
                  "rounded-[14px]",
                  "text-[#878787]",
                  "bg-transparent",
                  "border-[#878787]",
                  "border-opacity-[30%]",
                  "focus:outline-none",
                  "focus:border-[#828c3a]",
                  "transition-all",
                ],
              }),
            ]),
            createElement("div", {
              class: [
                "h-3/4",
                "w-[2px]",
                "bg-[var(--light-grey)]",
                "opacity-[30%]",
                "rounded-full",
                "m-auto",
              ],
            }),
            createElement("div", { class: ["gap-4", "items-start"] }, [
              createElement("label", { class: ["font-light"] }, ["LastName"]),
              createElement("input", {
                value: this.state.lastName,
                on: {
                  input: (e: any) => {
                    if (this.getIsMounted)
                      this.updateState({ lastName: e.target.value });
                  },
                  change: async () => await this.updateLastName(),
                },
                class: [
                  "px-4",
                  "py-4",
                  "w-full",
                  "h-[50px]",
                  "border-2",
                  "pr-[50px]",
                  "rounded-[14px]",
                  "text-[#878787]",
                  "bg-transparent",
                  "border-[#878787]",
                  "focus:outline-none",
                  "focus:border-[#828c3a]",
                  "transition-all",
                  "border-opacity-[30%]",
                ],
              }),
            ]),
          ]
        ),
      ]
    );
  },
  async updateFirstName(this: IComponent<EditGeneralInfoState>) {
    try {
      await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/account/update-profile/`,
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
    } catch (err) {
      console.log(err);
    }
  },
  async updateLastName(this: IComponent<EditGeneralInfoState>) {
    try {
      await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/account/update-profile/`,
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
    } catch (err) {
      console.log(err);
    }
  },
});

export default EditGeneralInfo;
