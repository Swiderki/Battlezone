import { GUI, GUIComponent } from "drake-engine";
import Battlezone from "../../main";

export default class Overlay implements GUIComponent {
  protected game: Battlezone;
  protected components: GUIComponent[] = [];
  protected componentsIDs: number[] = [];
  protected gui?: GUI;

  constructor(game: Battlezone) {
    this.game = game;
  }

  applyOverlay(gui: GUI): void {
    this.gui = gui;
    for (const component of this.components) {
      const id = gui.addElement(component);
      this.componentsIDs.push(id);
    }
  }

  removeOverlay(): void {
    if (!this.gui) return;

    for (const id of this.componentsIDs) {
      this.gui.removeElement(id);
    }
    this.componentsIDs = [];
  }

  render(ctx: CanvasRenderingContext2D): void;
  render() {}
}
