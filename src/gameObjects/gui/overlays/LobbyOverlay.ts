import Battlezone from "../../../main";
import Overlay from "./Overlay";
import StartButton from "../components/StartButton";

export default class LobbyOverlay extends Overlay {
  constructor(game: Battlezone) {
    super(game);

    this.initComponents();
  }

  private initComponents() {
    const startButton = new StartButton(this.game);

    this.components.push(startButton);
  }
}
