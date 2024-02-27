import { GUI, GUIText } from "drake-engine";
import Battlezone from "../../main";
import { GUI_MARGIN } from "../../util/consts";
import PlayerTank from "../Player/PlayerTank";

class GUITextUpdateable extends GUIText {
  override render(ctx: CanvasRenderingContext2D) {
    this.Update()
    super.render(ctx)
  }

  Update() {}
}

export default class Score {
  private playerTank: PlayerTank;
  private playerGUI: GUI;
  private game: Battlezone

  private scoreText: GUIText = new GUIText("SCORE:", 20, 'monospace', "#f0f", 700);

  private bestScoreText: GUIText = new GUIText("BEST SCORE:", 20, 'monospace', "#f0f", 700);
  
  scoreGUI: GUITextUpdateable = new GUITextUpdateable("", 20, "monospace", "#f0f", 700);

  bestScoreGUI: GUITextUpdateable  = new GUITextUpdateable("", 20, "monospace", "#f0f", 700);
  
  constructor(playerTank: PlayerTank) {
    this.playerTank = playerTank;
    this.playerGUI = playerTank.playerGUI;
    this.game = playerTank.game

    this.initUpdate()
    this.setPosition()
    this.addAllComponents()
  }

  private initUpdate() {
    this.scoreGUI.Update = () => {
      const newText = `${this.playerTank.score}`;
      if (this.scoreGUI.text === newText) return;

      this.scoreGUI.text = newText

      const xForPoints = this.game.width - GUI_MARGIN
      this.scoreGUI.position = { x: xForPoints - this.scoreGUI.width, y: GUI_MARGIN }
      this.bestScoreGUI.position = { x: xForPoints - this.bestScoreGUI.width, y: 2 * GUI_MARGIN }
    }
    this.bestScoreGUI.Update = () => {
      const newText = `${this.playerTank.bestScore}`;
      if (this.bestScoreGUI.text === newText) return;

      this.bestScoreGUI.text = newText

      const xForPoints = this.game.width - GUI_MARGIN
      this.scoreGUI.position = { x: xForPoints - this.scoreGUI.width, y: GUI_MARGIN }
      this.bestScoreGUI.position = { x: xForPoints - this.bestScoreGUI.width, y: 2 * GUI_MARGIN }
    }
  }

  private setPosition() {
    const xForPoints = this.game.width - GUI_MARGIN



    console.log(this.scoreGUI.text)
    console.log(this.bestScoreGUI.text)

    const spaceForPoints = 100
    const xAlignedForText = xForPoints - spaceForPoints - this.bestScoreText.width - GUI_MARGIN

    this.scoreText.position = { x: xAlignedForText, y: GUI_MARGIN }
    this.bestScoreText.position = { x: xAlignedForText, y: 2 * GUI_MARGIN }
  }

  private addAllComponents() {
    this.playerGUI.addElement(this.scoreText)
    this.playerGUI.addElement(this.bestScoreText)
    this.playerGUI.addElement(this.scoreGUI)
    this.playerGUI.addElement(this.bestScoreGUI)
  }
}

