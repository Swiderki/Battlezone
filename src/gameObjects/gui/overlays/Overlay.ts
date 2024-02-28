import { GUIComponent } from "drake-engine";
import Battlezone from "../../../main";

export default class Overlay implements GUIComponent {
  protected game: Battlezone;
  protected components: GUIComponent[] = [];
  protected componentsIDs: number[] = [];

  constructor(game: Battlezone) {
    this.game = game;
  }

  applyOverlay(): void {
    for (const component of this.components) {
      const id = this.game.gui.addElement(component);
      this.componentsIDs.push(id);
    }
  }

  removeOverlay(): void {
    for (const id of this.componentsIDs) {
      this.game.gui.removeElement(id);
    }
    this.componentsIDs = [];
  }

  render(ctx: CanvasRenderingContext2D): void;
  render() {}
}
