import { GUIComponent, GUIText } from "drake-engine";
import { GUI_MARGIN } from "../../util/consts";
import PlayerTank from "../../gameObjects/Player/PlayerTank";

export default class Score implements GUIComponent {
  private playerTank: PlayerTank;

  private scoreText: GUIText = new GUIText("SCORE:", 20, "monospace", "#f0f", 700);
  private bestScoreText: GUIText = new GUIText("BEST SCORE:", 20, "monospace", "#f0f", 700);
  scoreGUIText: GUIText = new GUIText("", 20, "monospace", "#f0f", 700);
  bestScoreGUIText: GUIText = new GUIText("", 20, "monospace", "#f0f", 700);

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
    if (this.scoreGUIText.text === newScore) return;

    const xForPoints = this.playerTank.game.width - GUI_MARGIN;

    this.scoreGUIText.text = newScore;

    this.scoreGUIText.position = { x: xForPoints - this.scoreGUIText.width, y: GUI_MARGIN };
    this.bestScoreGUIText.position = { x: xForPoints - this.bestScoreGUIText.width, y: 2 * GUI_MARGIN };

    const newBestScore = `${this.playerTank.bestScore}`;
    if (this.bestScoreGUIText.text === newBestScore) return;

    this.bestScoreGUIText.text = newBestScore;

    this.scoreGUIText.position = { x: xForPoints - this.scoreGUIText.width, y: GUI_MARGIN };
    this.bestScoreGUIText.position = { x: xForPoints - this.bestScoreGUIText.width, y: 2 * GUI_MARGIN };
  }

  render(ctx: CanvasRenderingContext2D) {
    this.updateTextPosition();

    this.scoreGUIText.render(ctx);
    this.scoreText.render(ctx);
    this.bestScoreGUIText.render(ctx);
    this.bestScoreText.render(ctx);
  }
}
