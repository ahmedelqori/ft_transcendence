import { eventBus } from "@/uccello/Uccello";
import enhancedFetch from "./fetch";

class NotifSystem {
  private socket: WebSocket;

  constructor(port: string) {
    this.socket = new WebSocket(
      `wss://64.23.191.17/api/notif/ws?authorization=${localStorage.getItem(
        "access_token"
      )}`
    );
    this.socket.addEventListener("message", (event) => {
      const data: any = JSON.parse(event.data);
      console.log(data);
      switch (data.type) {
        case "friendRequest":
          this.handleFriendRequest(data.payload.senderId);
          break;
        case "MessageRequest":
          this.handleMessageRequest(data.payload.senderId);
          break;
        case "AcceptGame":
          this.handleMessageRequest(data.payload.senderId);
          break;
        default:
          break;
      }
    });
  }
  private async handleFriendRequest(id: number) {
    try {
      const data = await this.getUserData(id);

      eventBus.emit("notif:requestReceived", {
        username: data.username,
        avatar: data.avatar_url,
        id: id,
      });
    } catch (err) {
      console.log("Error::handleFriendRequest - ", err);
    }
  }
  private async handleMessageRequest(id: number) {
    try {
      const data = await this.getUserData(id);
      eventBus.emit("notif:requestReceived", {
        username: data.username,
        avatar: data.avatar_url,
        id: id,
        content: data.content,
      });
    } catch (err) {
      console.log("Error::handleFriendRequest - ", err);
    }
  }
  private async getUserData(id: number) {
    const response = await enhancedFetch.fetch(
      `https://www.meedivo.me/api/account/${id}`
    );
    return await response.json();
  }
}

const notifSystem = new NotifSystem("3333");

export default notifSystem;

// click invite button -> send notif to target -> (accept | decline)
// accept => notif to sender => POST /game =>(res=[gameId]) redirect => notif to target with gameId to join the game redirect
// decline => notif decline
