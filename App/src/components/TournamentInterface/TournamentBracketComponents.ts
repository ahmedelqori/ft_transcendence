import { router } from "@/router/Router";
import {
  createElement,
  defineComponent,
  eventBus,
  IComponent,
} from "@/uccello/Uccello";

interface InviteUserProps {
  updateInviteUsers: () => void;
  index: number;
}

interface InviteUserState {
  index: number;
}

export const InviteUserComp = defineComponent<InviteUserState, InviteUserProps>(
  {
    async onMounted(this: IComponent<InviteUserState, InviteUserProps>) {
      if (this.getIsMounted) this.updateState({ index: this.props.index });
    },
    state(this: IComponent<InviteUserState, InviteUserProps>) {
      return { index: -1 };
    },
    render(this: IComponent<InviteUserState, InviteUserProps>) {
      return createElement("i", {
        on: {
          click: () => {
            this.props.updateInviteUsers();
            console.log(this.state.index);
          },
        },
        class: [
          "ph",
          "ph-user-plus",
          "text-[26px]",
          "text-[var(--light-grey)]",
        ],
      });
    },
  }
);

interface UserCompoProps {
  avatar_url: string;
  username: string;
  id: string;
  invert: boolean;
}

export const UserCompo = defineComponent<void, UserCompoProps>({
  render(this: IComponent<void, UserCompoProps>) {
    return createElement(
      "div",
      {
        class: [
          "w-full",
          "h-full",
          "flex-row",
          "justify-start",
          "px-4",
          "gap-2",
          "cursor-pointer",
          this.props.invert ? "scale-x-[-1]" : "w-full",
        ],
        on: {
          click: async () => {
            await router.navigateTo(`/profile/${this.props.username}`);
            eventBus.emit("change:profile");
          },
        },
      },
      [
        createElement("img", {
          src: this.props.avatar_url || "/assets/default.webp",
          width: "25",
          height: "25",
          class: ["rounded-full", "w-[25px]", "h-[25px]"],
        }),
        this.props?.username?.substring(0, 8),
      ]
    );
  },
});
