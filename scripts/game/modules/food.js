class Food extends Game {
    constructor(gridSize, cellSize, gameField) {
        super();
        this.gridSize = gridSize;
        this.cellSize = cellSize;
        this.position = this.generatePosition();
        this.foodGraphics = new PIXI.Graphics();
        gameField.addChild(this.foodGraphics);
        this.draw();
    }

    generatePosition() {
        return {
            x: Math.floor(Math.random() * this.gridSize),
            y: Math.floor(Math.random() * this.gridSize),
        };
    }

    draw() {
        this.foodGraphics.clear();
        this.foodGraphics.beginFill(0xff0000);
        this.foodGraphics.drawCircle(
            this.position.x * this.cellSize + this.cellSize / 2,
            this.position.y * this.cellSize + this.cellSize / 2,
            this.cellSize / 3
        );
        this.foodGraphics.endFill();
    }

    relocate() {
        this.position = this.generatePosition();
        this.draw();
    }
}