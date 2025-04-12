import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../../../../../uccello/Uccello.js";

interface NotificationItemsProps {
  listItems: any[];
}

const NotificationItems = defineComponent<void, NotificationItemsProps>({
  state() {},
  render(this: IComponent<void, NotificationItemsProps>) {
    return createElement(
      "div",
      {},
      this.props.listItems.map((e) => {
        return createElement("div", {}, [e]);
      })
    );
  },
});

export default NotificationItems;
