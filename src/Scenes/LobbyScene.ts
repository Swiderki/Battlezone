import { BackgroundObjectConfig, Scene } from "drake-engine";
import Battlezone from "../main";
import LobbyOverlay from "../gameObjects/gui/overlays/LobbyOverlay";

export default class LobbyScene extends Scene {
  private game: Battlezone;

  constructor(game: Battlezone, background?: BackgroundObjectConfig) {
    super(background);
    this.game = game;

    this.setMainCamera(game.camera, game.width, game.height);

    const guiID = this.addGUI(game.gui);
    this.setCurrentGUI(guiID);
  }

  useLobbyOverlay(): void {
    this.game.overlays.lobby = new LobbyOverlay(this.game);
    this.game.overlays.lobby.applyOverlay();
    this.game.gui.addElement(this.game.overlays.lobby);
  }
}
