import { GUIElement } from "drake-engine";

class Crosshair implements GUIElement {
    public height: number;
    public width: number;
    public position: { x: number; y: number };
    private canvasWidth: number;
    private canvasHeight: number;
    public isTargeting: boolean = false

    constructor(canvasWidth: number, canvasHeight: number) {
        this.width = 20;
        this.height = 20;
        this.position = { x: 0, y: 0 };
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        console.log(canvasWidth);
        console.log(canvasHeight);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // Save the current state of the context
        ctx.save();

        // Set the color and style for the crosshair
        ctx.strokeStyle = this.isTargeting ? 'green' : 'red';
        ctx.lineWidth = 2;

        // Calculate the center coordinates of the canvas
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;

        // Calculate the actual position of the crosshair based on the offset from the center
        const offsetX = centerX + this.position.x;
        const offsetY = centerY + this.position.y;

        // Draw horizontal line
        ctx.beginPath();
        ctx.moveTo(offsetX - this.width / 2, offsetY);
        ctx.lineTo(offsetX + this.width / 2, offsetY);
        ctx.stroke();

        // Draw vertical line
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY - this.height / 2);
        ctx.lineTo(offsetX, offsetY + this.height / 2);
        ctx.stroke();

        // Restore the context to its previous state
        ctx.restore();
    }
}

export default Crosshair;
