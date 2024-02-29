import Battlezone from "../../main";
import Overlay from "./Overlay";
import StartButton from "../components/StartButton";
import { GUIText } from "drake-engine";

export default class LobbyOverlay extends Overlay {
  constructor(game: Battlezone) {
    super(game);

    this.initComponents();
  }

  private initComponents() {
    const startButton = new StartButton(this.game);

    const t1 = new GUIText("Battlezone", 70, "monospace", "#fff", 700);
    const t2 = new GUIText("Made by Świderki", 16, "monospace", "#fff", 700);

    // Positioning logic
    t1.position.x = (this.game.width - t1.width) / 2;
    t1.position.y = this.game.height / 2 - 100;
    t2.position.x = (this.game.width - t1.width) / 2;
    t2.position.y = t1.position.y + t1.height + 5;

    this.components.push(startButton, t1, t2);
  }
}
