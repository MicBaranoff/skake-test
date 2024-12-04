const SPEED = 30

const GAME_MODES = {
    CLASSIC: 'classic',
    GOD: 'god',
    WALLS: 'walls',
    PORTAL: 'portal',
    SPEED: 'speed',
}

const bestScoreFromStorage = localStorage.getItem('best-snake-score');
const setBestScoreFromStorage = (value) => localStorage.setItem('best-snake-score', value);

class Game {
    constructor() {
        this.GRID_SIZE = 20;
        this.CELL_SIZE = 30;
        this.speed = SPEED;
        this.tick = 0;
        this.isGameOver = false;

        this.bestScore = bestScoreFromStorage;
        this.currentScore = 0;

        this.walls = [];

        this.portals = [];
        this.portalMode = false;
        this.portalRoute = [];

        this.initializeGUI();
        this.updateGUI();
    }

    setup() {
        if (this.app) {
            this.app.destroy(true, { children: true, texture: true, baseTexture: true });
        }

        this.app = new PIXI.Application({
            width: this.GRID_SIZE * this.CELL_SIZE,
            height: this.GRID_SIZE * this.CELL_SIZE + 50,
            backgroundColor: 0x000000,
        });

        document.getElementById("game-container").appendChild(this.app.view);

        this.gameField = new PIXI.Container();
        this.app.stage.addChild(this.gameField);

        this.portalContainer = new PIXI.Container();
        this.app.stage.addChild(this.portalContainer);

        this.snake = new Snake(this.GRID_SIZE, this.CELL_SIZE, this.gameField);
        this.food = new Food(this.GRID_SIZE, this.CELL_SIZE, this.gameField);

        this.drawGrid();

        this.setupControls();
    }

    drawGrid() {
        for (let x = 0; x < this.GRID_SIZE; x++) {
            for (let y = 0; y < this.GRID_SIZE; y++) {
                const cell = new PIXI.Graphics();
                cell.lineStyle(1, 0x444444);
                cell.drawRect(
                    x * this.CELL_SIZE,
                    y * this.CELL_SIZE,
                    this.CELL_SIZE,
                    this.CELL_SIZE
                );
                this.gameField.addChild(cell);
            }
        }
    }

    setupControls() {
        document.addEventListener("keydown", (event) => {
            switch (event.key) {
                case "ArrowUp":
                    this.snake.setDirection({ x: 0, y: -1 });
                    break;
                case "ArrowDown":
                    this.snake.setDirection({ x: 0, y: 1 });
                    break;
                case "ArrowLeft":
                    this.snake.setDirection({ x: -1, y: 0 });
                    break;
                case "ArrowRight":
                    this.snake.setDirection({ x: 1, y: 0 });
                    break;
            }
        });
    }

    checkCollision() {
        const head = this.snake.body[0];

        if (head.x < 0 || head.x >= this.GRID_SIZE || head.y < 0 || head.y >= this.GRID_SIZE) {
            return true;
        }

        for (let i = 1; i < this.snake.body.length; i++) {
            if (head.x === this.snake.body[i].x && head.y === this.snake.body[i].y) {
                return true;
            }
        }

        for (const wall of this.walls) {
            if (head.x === wall.x && head.y === wall.y) {
                return true;
            }
        }

        return false;
    }

    generateWall() {
        let wallPosition;
        do {
            wallPosition = {
                x: Math.floor(Math.random() * this.GRID_SIZE),
                y: Math.floor(Math.random() * this.GRID_SIZE),
            };
        } while (
            this.snake.body.some(
                (segment) => segment.x === wallPosition.x && segment.y === wallPosition.y
            ) ||
            (this.food.position.x === wallPosition.x &&
                this.food.position.y === wallPosition.y)
            );

        this.walls.push(wallPosition);

        const wall = new PIXI.Graphics();
        wall.beginFill(0x888888);
        wall.drawRect(
            wallPosition.x * this.CELL_SIZE,
            wallPosition.y * this.CELL_SIZE,
            this.CELL_SIZE,
            this.CELL_SIZE
        );
        wall.endFill();
        this.gameField.addChild(wall);
    }

    generatePortals() {
        this.portals = [];

        while (this.portals.length < 2) {
            const x = Math.floor(Math.random() * this.GRID_SIZE);
            const y = Math.floor(Math.random() * this.GRID_SIZE);

            if (!this.snake.body.some((segment) => segment.x === x && segment.y === y)) {
                this.portals.push({ x, y });
            }
        }
    }

    calculateRoute(start, end) {
        const route = [];
        let current = { ...start };

        while (current.x !== end.x || current.y !== end.y) {
            if (current.x < end.x) current.x++;
            else if (current.x > end.x) current.x--;

            if (current.y < end.y) current.y++;
            else if (current.y > end.y) current.y--;

            route.push({ ...current });
        }

        return route;
    }

    drawPortals() {
        this.portalContainer.removeChildren();

        this.portals.forEach((portal, index) => {
            const color = index === 0 ? 0x00ff00 : 0xff0000;
            const graphics = new PIXI.Graphics();
            graphics.beginFill(color);
            graphics.drawRect(
                portal.x * this.CELL_SIZE,
                portal.y * this.CELL_SIZE,
                this.CELL_SIZE,
                this.CELL_SIZE
            );
            graphics.endFill();
            this.portalContainer.addChild(graphics);
        });
    }

    portalModeTickerLogic() {
        if (this.portalMode && this.portalRoute.length > 0) {
            const nextStep = this.portalRoute.shift();
            this.snake.body.unshift(nextStep);
            this.snake.body.pop();

            this.snake.draw();

            if (this.portalRoute.length === 0) {
                this.portalMode = false;

                this.portals = [];
            }
        } else {
            this.snake.move();
        }

        if (!this.portalMode) {

            this.portalMode = true;

            this.generatePortals();

            this.drawPortals();
        }

        for (let i = 0; i < this.portals.length; i++) {
            if (
                this.snake.body[0].x === this.portals[i].x &&
                this.snake.body[0].y === this.portals[i].y
            ) {
                const otherPortal = this.portals[1 - i];
                this.portalRoute = this.calculateRoute(this.snake.body[0], otherPortal);
                return;
            }
        }
    }

    godModeTickerLogic() {
        const head = this.snake.body[0];

        if (head.x < 0) head.x = this.GRID_SIZE - 1;
        else if (head.x >= this.GRID_SIZE) head.x = 0;

        if (head.y < 0) head.y = this.GRID_SIZE - 1;
        else if (head.y >= this.GRID_SIZE) head.y = 0;
    }

    getSelectedGameMode() {
        let selectedMode = "classic";
        this.gameModeInputs.forEach((input) => {
            if (input.checked) selectedMode = input.value;
        });
        return selectedMode;
    }

    update() {
        if (this.isGameOver) return;

        this.tick++;

        if (this.tick >= this.speed) {
            this.tick = 0;

            const mode = this.getSelectedGameMode();

            const baseSnakeMove = () => {
                this.speed = SPEED;
                this.snake.move();
            }

            switch (mode) {
                case GAME_MODES.CLASSIC:
                    baseSnakeMove();

                    if (this.checkCollision()) {
                        this.gameOver();
                        return;
                    }
                    break;

                case GAME_MODES.WALLS:
                    baseSnakeMove();

                    if (this.checkCollision()) {
                        this.gameOver();
                        return;
                    }
                    break;

                case GAME_MODES.GOD:
                    baseSnakeMove();

                    this.godModeTickerLogic();
                    break;

                case GAME_MODES.SPEED:
                    this.snake.move();
                    this.speed = SPEED / 2;

                    if (this.checkCollision()) {
                        this.gameOver();
                        return;
                    }
                    break;

                case GAME_MODES.PORTAL:
                    this.speed = SPEED;

                    this.portalModeTickerLogic();

                    if (this.checkCollision()) {
                        this.gameOver();
                        return;
                    }
                    break;
            }

            if (
                this.snake.body[0].x === this.food.position.x &&
                this.snake.body[0].y === this.food.position.y
            ) {
                this.snake.body.push({});
                this.food.relocate();
                this.currentScore++;

                if (mode === GAME_MODES.WALLS) {
                    this.generateWall();
                }
            }

            this.updateGUI();
        }
    }

    init() {
        this.app.ticker.add(this.update.bind(this));

        this.startGame();
    }

    gameOver() {
        this.isGameOver = true;

        if (this.currentScore > this.bestScore) {
            this.bestScore = this.currentScore;
            setBestScoreFromStorage(this.bestScore)
        }

        window.alert(`Game Over! Your score: ${this.currentScore}`)

        location.reload();
    }

    initializeGUI() {
        this.bestScoreElement = document.getElementById("best-score");
        this.currentScoreElement = document.getElementById("current-score");

        this.gameModeInputs = document.querySelectorAll('input[name="game-mode"]');
    }

    startGame() {
        this.isGameOver = false;

        const mode = this.getSelectedGameMode();
        if (mode === "portal") {
            this.generatePortals();
        }
    }

    updateGUI() {
        this.bestScoreElement.textContent = this.bestScore || 0;
        this.currentScoreElement.textContent = this.currentScore;
    }
}