import { eventBus } from "@/uccello/Uccello";
import enhancedFetch from "./fetch";
import { router } from "@/router/Router";

class NotifSystem {
  private socket: WebSocket;

  constructor() {
    this.socket = new WebSocket(
      `wss://www.meedivo.me/api/notif/ws?authorization=${localStorage.getItem(
        "access_token"
      )}`
    );
    this.socket.onopen = () => {};
    this.socket.onmessage = (event) => {
      const data: any = JSON.parse(event.data);
      switch (data.type) {
        case "friendRequest":
          this.handleFriendRequest(data.payload.senderId);
          break;
        case "directMessage":
          this.handleMessageRequest(data.payload.senderId);
          break;
        case "AcceptGame":
          this.handleMessageRequest(data.payload.senderId);
          break;
        case "inviteToMatch":
          this.handleInviteToMatch(data);
          break;
        case "gameAccepted":
          this.handleGameAccepted(data);
          break;
        case "gameDeclined":
          this.handleGameDecline(data);
          break;
        default:
          break;
      }
    };
    this.socket.onclose = () => {};
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
      eventBus.emit("notif:directMessage", {
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
  private async handleInviteToMatch(data: any) {
    try {
      eventBus.emit("notif:inviteToMatch", {
        username: data.Sender.username,
        avatar: data.Sender.avatar_url,
        id: data.Sender.id,
        gameId: data.payload.id,
      });
    } catch (err) {
      console.log("Error::handleFriendRequest - ", err);
    }
  }

  handleGameAccepted(data: any) {
    router.navigateTo(`/game/${data.payload.id}`);
  }

  handleGameDecline(data: any) {
    console.log("Canceled", data);
  }
  public destroy() {
    this.socket.close();
  }
}

export default NotifSystem;

// const notifSystem = new NotifSystem("3333");

// export default notifSystem;

// click invite button -> send notif to target -> (accept | decline)
// accept => notif to sender => POST /game =>(res=[gameId]) redirect => notif to target with gameId to join the game redirect
// decline => notif decline

/* click invite button -> post to game --> return game object {
gameId}
  send notif to other player inviteToMatch GameId

*/
