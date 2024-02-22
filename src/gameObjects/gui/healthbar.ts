import { GUI, Icon, Vec2D,  } from "drake-engine";

class HealthBar {
    
    //* references 
    private playerGUI: GUI;
    private _heartIcons: HeartIcon[] = []

    //* healthBar specific values
    private _currentHealth: number;
    position: { x: number; y: number };

    //* constants
    private _heartGap = 30 + 10;

    constructor(startingHealth: number, gui: GUI) {
        this.position = { x: 30, y: 30 };
        this.playerGUI = gui;
        this._currentHealth = startingHealth;
        this.addStartingHealth();
    }

    private addStartingHealth() {
        for(let i=0;i<this._currentHealth;i++) {
            const healthIcon = new HeartIcon({
                x: this.position.x + i * this._heartGap,
                y: this.position.y
            });
            this._heartIcons.push(healthIcon);
            this.playerGUI.addElement(healthIcon);
        }
    }

    get currentHealth() {
        return this._currentHealth;
    }

    set currentHealth(value: number) {
        const healthDiff = value - this._currentHealth;
        if(healthDiff === 0) return; // no change
        if(healthDiff < 0) { // descres amount of health
            this._heartIcons.slice(0, value);
            this._currentHealth = value;
            return;
        }
        // add new hearts
        for(let i=0;i<healthDiff;i++) {
            const healthIcon = new HeartIcon({
                x: this.position.x + (this._currentHealth + i) * this._heartGap,
                y: this.position.y
            });
            this._heartIcons.push(healthIcon);
            this.playerGUI.addElement(healthIcon);
        }
        this._currentHealth = value;
    }
    
}

class HeartIcon extends Icon {
    width = 700;
    height = 700;
    fillColor = '#fff';
    constructor(position: Vec2D, width=100, height=100, strokeColor="#fff") {
        super('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', width, height, position, strokeColor);
        
    }
}

export default HealthBar;
