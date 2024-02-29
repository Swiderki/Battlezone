import { Button } from "drake-engine";
import Battlezone from "../../main";

export default class StartButton extends Button {
  game: Battlezone;

  constructor(game: Battlezone) {
    super("START", 30, "monospace", "#fff", 700);
    this.game = game;

    this.position = { x: this.game.width / 2 - this.width, y: this.game.height - 200 };
  }

  override onHover() {
    this.color = "#f0f";
    this.border = {
      bottom: { color: "#f0f", width: 2 },
      left: { color: "#f0f", width: 2 },
      right: { color: "#f0f", width: 2 },
      top: { color: "#f0f", width: 2 },
    };

    return () => {
      this.color = "#fff";
      this.border = {
        bottom: { color: "#fff", width: 2 },
        left: { color: "#fff", width: 2 },
        right: { color: "#fff", width: 2 },
        top: { color: "#fff", width: 2 },
      };
    };
  }

  override onClick(): void {
    this.game.setGameStateToPlay();
  }
}
