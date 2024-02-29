import { Button } from "drake-engine";
import Battlezone from "../../../main";

export default class BattlezoneButton extends Button {
  game: Battlezone;

  constructor(
    game: Battlezone,
    text: string,
    fontSize: number,
    fontFamily: string,
    color: string,
    fontWeight?: number | undefined
  ) {
    super(text, fontSize, fontFamily, color, fontWeight);
    this.game = game;
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
}
