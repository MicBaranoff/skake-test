class Snake extends Game {
    constructor(gridSize, cellSize, gameField) {
        super();
        this.gridSize = gridSize;
        this.cellSize = cellSize;
        this.body = [
            { x: 8, y: 10 },
            { x: 7, y: 10 },
            { x: 6, y: 10 },
        ];
        this.direction = { x: 1, y: 0 };
        this.snakeContainer = new PIXI.Container();
        gameField.addChild(this.snakeContainer);
        this.draw();
    }

    draw() {
        this.snakeContainer.removeChildren();
        this.body.forEach(segment => {
            const segmentGraphics = new PIXI.Graphics();
            segmentGraphics.beginFill(0x00ff00);
            segmentGraphics.drawRect(
                segment.x * this.cellSize,
                segment.y * this.cellSize,
                this.cellSize,
                this.cellSize
            );
            segmentGraphics.endFill();
            this.snakeContainer.addChild(segmentGraphics);
        });
    }

    move() {
        const newHead = {
            x: this.body[0].x + this.direction.x,
            y: this.body[0].y + this.direction.y,
        };
        this.body.unshift(newHead);
        this.body.pop();
        this.draw();
    }

    setDirection(newDirection) {
        const opposite = this.direction.x === -newDirection.x || this.direction.y === -newDirection.y;
        if (!opposite) {
            this.direction = newDirection;
        }
    }
}