import { GUIComponent, GUIText } from "drake-engine";
import { GUI_MARGIN } from "../../../util/consts";
import PlayerTank from "../../Player/PlayerTank";

export default class Score implements GUIComponent {
  private playerTank: PlayerTank;

  private scoreText: GUIText = new GUIText("SCORE:", 20, "monospace", "#f0f", 700);
  private bestScoreText: GUIText = new GUIText("BEST SCORE:", 20, "monospace", "#f0f", 700);
  scoreGUI: GUIText = new GUIText("", 20, "monospace", "#f0f", 700);
  bestScoreGUI: GUIText = new GUIText("", 20, "monospace", "#f0f", 700);

  constructor(playerTank: PlayerTank) {
    this.playerTank = playerTank;

    this.setPosition();
  }

  private setPosition() {
    const xForPoints = this.playerTank.game.width - GUI_MARGIN;

    const spaceForPoints = 100;
    const xAlignedForText = xForPoints - spaceForPoints - this.bestScoreText.width - GUI_MARGIN;

    this.scoreText.position = { x: xAlignedForText, y: GUI_MARGIN };
    this.bestScoreText.position = { x: xAlignedForText, y: 2 * GUI_MARGIN };
  }

  private updateTextPosition() {
    const newScore = `${this.playerTank.score}`;
    if (this.scoreGUI.text === newScore) return;

    const xForPoints = this.playerTank.game.width - GUI_MARGIN;

    this.scoreGUI.text = newScore;

    this.scoreGUI.position = { x: xForPoints - this.scoreGUI.width, y: GUI_MARGIN };
    this.bestScoreGUI.position = { x: xForPoints - this.bestScoreGUI.width, y: 2 * GUI_MARGIN };

    const newBestScore = `${this.playerTank.bestScore}`;
    if (this.bestScoreGUI.text === newBestScore) return;

    this.bestScoreGUI.text = newBestScore;

    this.scoreGUI.position = { x: xForPoints - this.scoreGUI.width, y: GUI_MARGIN };
    this.bestScoreGUI.position = { x: xForPoints - this.bestScoreGUI.width, y: 2 * GUI_MARGIN };
  }

  render(ctx: CanvasRenderingContext2D) {
    this.updateTextPosition();

    this.scoreGUI.render(ctx);
    this.scoreText.render(ctx);
    this.bestScoreGUI.render(ctx);
    this.bestScoreText.render(ctx);
  }
}
