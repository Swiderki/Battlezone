import { BackgroundObjectConfig, GUI, Scene } from "drake-engine";
import Battlezone from "../main";
import LobbyOverlay from "../gui/overlays/LobbyOverlay";

export default class LobbyScene extends Scene {
  private game: Battlezone;
  private gui: GUI;

  constructor(game: Battlezone, background?: BackgroundObjectConfig) {
    super(background, true);
    this.game = game;

    this.setMainCamera(game.camera, game.width, game.height);

    this.gui = new GUI(game.canvas, game.ctx);

    const guiID = this.addGUI(this.gui);
    this.setCurrentGUI(guiID);
  }

  useLobbyOverlay(): void {
    this.game.overlays.lobby = new LobbyOverlay(this.game) as unknown as LobbyOverlay;
    this.game.overlays.lobby.applyOverlay(this.gui);
    this.gui.addElement(this.game.overlays.lobby);
  }
}
