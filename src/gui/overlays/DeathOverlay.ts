import { GUIText } from "drake-engine";
import Battlezone from "../../main";
import BackToLobbyButton from "../components/BackToLobbyButton";
import RestartButton from "../components/RestartButton";
import Overlay from "./Overlay";

export default class DeathOverlay extends Overlay {
  constructor(game: Battlezone) {
    super(game);

    this.initComponents();
  }

  private initComponents() {
    // restart button, points scored or sth idk
    const backToLobbyButton = new BackToLobbyButton(this.game);
    const restartButton = new RestartButton(this.game);

    const youLoseText = new GUIText("YOU LOSE", 100, "monospace", "#fff", 1000);
    youLoseText.position = {
      x: this.game.width / 2 - youLoseText.width / 2,
      y: 300 - youLoseText.height,
    };

    this.components.push(backToLobbyButton, restartButton, youLoseText);
  }
}
