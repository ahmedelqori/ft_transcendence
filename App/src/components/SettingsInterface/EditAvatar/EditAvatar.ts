import enhancedFetch from "@/Hooks/fetch.js";
import {
  createElement,
  defineComponent,
  eventBus,
  type IComponent,
} from "@/uccello/Uccello.js";

interface EditAvatarState {
  avatarUrl: string;
  avatarFile: File | null;
  icon: string;
  validAvatar: boolean;
  color: string;
  previewUrl: any;
}

const EditAvatar = defineComponent<EditAvatarState>({
  async onMounted(this: IComponent<EditAvatarState>) {
    try {
      const res = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/account/whoami/`
      );
      const data = await res.json();
      if (this.getIsMounted)
        this.updateState({
          avatarUrl: data.avatar_url,
        });
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  },
  state() {
    return {
      icon: "ph-nut",
      validAvatar: false,
      avatarUrl: "",
      avatarFile: null,
      color: "var(--main-color)",
      previewUrl: null,
    };
  },
  render(this: IComponent<EditAvatarState> & { updateAvatar: () => void }) {
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
          "h-fit",
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
            ],
            style: {
              color: this.state.color,
            },
            on: {
              click: () => {
                if (this.state.validAvatar && this.state.avatarFile) {
                  this.updateAvatar();
                }

                this.updateState({
                  icon: "ph-nut",
                  validAvatar: false,
                  avatarFile: null,
                  color: "var(--main-color)",
                });

                const fileInput = document.getElementById(
                  "fileInputAvatarSettingPage"
                ) as HTMLInputElement;
                if (fileInput) {
                  fileInput.value = "";
                }
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
            loading: "lazy",
            src: this.state.avatarUrl,
            class: [
              "w-[100px]",
              "h-[100px]",
              "max-lg:w-[75px]",
              "rounded-full",
              "hover:scale-[110%]",
            ],
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
                  "w-full",
                  "max-w-[300px]",
                  "border-[var(--light-grey)]",
                  "rounded-full",
                  "px-4",
                  "py-2",
                  "sm:px-5",
                  "sm:py-2.5",
                  "md:px-6",
                  "md:py-3",
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
                    "file:px-3",
                    "file:cursor-pointer",
                    "cursor-pointer",
                    "text-[var(--light-grey)]",
                    "file:mr-4",
                    "w-full",
                    "text-sm",
                    "sm:text-base",
                  ],
                  on: {
                    change: (e) => {
                      const fileInput = e.currentTarget as HTMLInputElement;
                      if (!fileInput.files || fileInput.files.length === 0) {
                        return;
                      }

                      const file = fileInput.files[0];
                      const filesize = +(file.size / 1024 / 1024).toFixed(4);

                      if (
                        file.name !== "item" &&
                        typeof file.name !== "undefined" &&
                        filesize <= 10
                      ) {
                        this.updateState({
                          icon: "ph-check",
                          avatarFile: file,
                          previewUrl: URL.createObjectURL(file),
                          color: "var(--light-yellow)",
                          validAvatar: true,
                        });
                      } else {
                        this.updateState({
                          icon: "ph-nut",
                          avatarFile: null,
                          previewUrl: null,
                          color: "var(--red-color)",
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
  async updateAvatar(this: IComponent<EditAvatarState>) {
    try {
      if (!this.state.avatarFile) {
        return;
      }
      const formData = new FormData();
      formData.append("avatar", this.state.avatarFile);
      const res = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/account/avatar/`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!res.ok) throw res;
      this.updateState({ avatarUrl: this.state.previewUrl });
      eventBus.emit("load:avatar", {
        avatar: this.state.avatarUrl,
      });
    } catch (err) {
      console.error("Error updating avatar:", err);
    }
  },
});

export default EditAvatar;
