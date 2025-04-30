import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../uccello/Uccello.js";

interface EditAvatarState {
  avatar: any;
  icon: string;
  validAvatar: boolean;
  color: string | null;
}

const EditAvatar = defineComponent<EditAvatarState>({
  state() {
    return {
      icon: "ph-nut",
      validAvatar: false,
      avatar: null,
      color: `var(--main-color)`,
    };
  },
  render(this: IComponent<EditAvatarState>) {
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
            on: {
              click: () => {
                if (this.state.validAvatar && this.state.avatar) {
                  console.log(this.state.avatar);
                }
                this.updateState({
                  icon: "ph-nut",
                  validAvatar: false,
                  avatar: null,
                  color: `var(--main-color)`,
                }),
                  ((
                    document.getElementById(
                      "fileInputAvatarSettingPage"
                    ) as HTMLInputElement
                  ).value = "");
              },
            },
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
        createElement("div", { class: ["flex-row", "gap-[30px]"] }, [
          createElement("img", {
            alt: "Avatar",
            src: "../../../../public/assets/avatar.png",
            class: ["w-[100px]", "rounded-full", "hover:scale-[110%]", "z-10"],
          }),
          createElement("div", { class: ["items-start", "gap-2"] }, [
            createElement("h4", { class: ["font-medium", "pl-[10px]"] }, [
              "Upload a new avatar",
            ]),
            createElement(
              "div",
              {
                class: [
                  "border-[1px]",
                  "w-fit",
                  "border-[var(--light-grey)]",
                  "rounded-full",
                  "px-[20px]",
                  "py-[10px]",
                ],
              },
              [
                createElement("input", {
                  type: "file",
                  placeholder: "Choose File",
                  id: "fileInputAvatarSettingPage",
                  accept: ".png,.jpeg,.jpg",
                  class: [
                    "file:bg-[var(--light-yellow)]",
                    "file:rounded-[14px]",
                    "file:border-none",
                    "file:px-[20px]",
                    "file:cursor-pointer",
                    "cursor-pointer",
                    "text-[var(--light-grey)]",
                    "file:mr-[35px]",
                  ],
                  on: {
                    change: (e) => {
                      const file = e.currentTarget.files[0];
                      const filesize = +(file.size / 1024 / 1024).toFixed(4);

                      if (
                        file.name != "item" &&
                        typeof file.name != "undefined" &&
                        filesize <= 10
                      ) {
                        this.updateState({
                          icon: "ph-check",
                          avatar: file,
                          color: `var(--light-yellow)`,
                          validAvatar: true,
                        });
                      } else {
                        this.updateState({
                          icon: "ph-nut",
                          avatar: null,
                          color: `var(--red-color)`,
                          validAvatar: false,
                        });
                      }
                    },
                  },
                }),
              ]
            ),
            createElement(
              "p",
              {
                class: ["text-[var(--light-grey)]", "text-[14px]", "pl-[10px]"],
              },
              ["PNG, JPEG format"]
            ),
          ]),
        ]),
      ]
    );
  },
});

export default EditAvatar;
