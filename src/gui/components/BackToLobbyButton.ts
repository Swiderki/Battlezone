import Battlezone from "../../main";
import BattlezoneButton from "./templates/BattlezoneButton";

export default class BackToLobbyButton extends BattlezoneButton {
  constructor(game: Battlezone) {
    super(game, "BACK TO LOBBY", 30, "monospace", "#fff", 700);

    this.position = {
      x: this.game.width / 2 - this.width / 2 - this.padding.left - this.border.left.width,
      y: this.game.height - 200,
    };
    console.log(this.width, this.game.width);
    console.log(this.position.x);
  }

  override onClick(): void {
    this.game.setGameStateToLobby();
  }
}
