import { eventBus } from "@/uccello/Uccello";
import enhancedFetch from "./fetch";
import { router } from "@/router/Router";

class NotifSystem {
  private socket: WebSocket;

  constructor() {
    this.socket = new WebSocket(
      `wss://${
        import.meta.env.VITE_DOMAIN_DEV
      }/api/notif/ws?authorization=${localStorage.getItem("access_token")}`
    );
    this.socket.onopen = () => {};
    this.socket.onmessage = (event) => {
      const data: any = JSON.parse(event.data);
      console.log("===============> ", data);
      switch (data.type) {
        case "friendRequest":
          this.handleFriendRequest(data);
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
        case "tournamentInvite":
          this.handleTournamentInvite(data);
          break;
        case "reloadTournament":
          this.handleReloadTournament();
          break;
        case "joinTournamentGame":
          this.handlePlayGameFromTournament(data);
          break;
        default:
          break;
      }
    };
    this.socket.onclose = () => {};
  }
  private async handleFriendRequest(req: any) {
    try {
      const data = await this.getUserData(req.payload.senderId);
      eventBus.emit("notif:requestReceived", {
        username: data.username,
        avatar: data.avatar_url,
        id: req.payload.senderId,
        notifId: req.id,
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
      `${import.meta.env.VITE_URL_DEV}/api/account/${id}`
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

  async handleGameAccepted(data: any) {
    await router.navigateTo(`/game/${data.payload.id}`);
  }

  handleGameDecline(data: any) {
    console.log("Canceled", data);
  }

  private handleTournamentInvite(data: any) {
    eventBus.emit("notif:inviteToTournament", {
      avatar_url: data.Sender.avatar_url,
      username: data.Sender.username,
      id: data.Sender.id,
      link: data.payload.invite_link,
      tournamentId: data.payload.tournament_id,
    });
  }
  private handleReloadTournament() {
    if (router.getMatchedRoute?.path === "/tournament/:id")
      eventBus.emit("change:tournament");
  }
  private async handlePlayGameFromTournament(data: any) {
    await router.navigateTo(`/game/${data.payload.id}`);
  }
  public destroy() {
    this.socket.close();
  }
}

export default NotifSystem;
