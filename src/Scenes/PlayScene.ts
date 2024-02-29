import { BackgroundObjectConfig, GUI, Scene } from "drake-engine";
import Battlezone from "../main";
import PlayOverlay from "../gui/overlays/PlayOverlay";
import DeathOverlay from "../gui/overlays/DeathOverlay";

export default class PlayScene extends Scene {
  private game: Battlezone;
  private gui: GUI;

  constructor(game: Battlezone, background?: BackgroundObjectConfig) {
    super(background, game._isStarted);
    this.game = game;
    this.setMainCamera(game.camera, game.width, game.height);

    this.gui = new GUI(game.canvas, game.ctx);

    const guiID = this.addGUI(this.gui);
    this.setCurrentGUI(guiID);
  }

  usePlayOverlay(): void {
    this.game.overlays.play = new PlayOverlay(this.game);
    this.game.overlays.death?.removeOverlay();
    this.game.overlays.play.applyOverlay(this.gui);
    this.gui.addElement(this.game.overlays.play);
  }

  useDeathOverlay(): void {
    this.game.overlays.death = new DeathOverlay(this.game);
    this.game.overlays.play?.removeOverlay();
    this.game.overlays.death.applyOverlay(this.gui);
    this.gui.addElement(this.game.overlays.death);
  }
}
