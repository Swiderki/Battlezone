import Battlezone from "../../main";
import BattlezoneButton from "./templates/BattlezoneButton";

export default class StartButton extends BattlezoneButton {
  constructor(game: Battlezone) {
    super(game, "START", 60, "monospace", "#fff", 700);

    this.position = {
      x: this.game.width / 2 - this.width / 2 - this.padding.left - this.border.left.width,
      y: this.game.height - 200,
    };
  }

  override onClick(): void {
    this.game.setGameStateToPlay();
  }
}
