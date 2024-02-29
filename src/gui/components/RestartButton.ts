import Battlezone from "../../main";
import BattlezoneButton from "./templates/BattlezoneButton";

export default class RestartButton extends BattlezoneButton {
  constructor(game: Battlezone) {
    super(game, "TRY AGAIN", 30, "monospace", "#fff", 700);

    this.position = {
      x: this.game.width / 2 - this.width / 2 - this.padding.left - this.border.left.width,
      y: this.game.height - 300,
    };
  }

  override onClick(): void {
    // restart game
  }
}
