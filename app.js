const gameInstance = new Game();

gameInstance.setup();

gameInstance.initializeGUI();

document.querySelector('#play-button').addEventListener('click', () => {
    gameInstance.init();

    document.querySelector('.gameplay-buttons').style.display = 'block';
    document.querySelector('#play-button').style.display = 'none';
});

document.querySelector('#exit-button').addEventListener('click', () => {
    document.querySelector('.gameplay-buttons').style.display = 'none';
    document.querySelector('.game-modes').style.display = 'none';
    document.querySelector('#play-button').style.display = 'block';

    gameInstance.gameOver();
});

document.querySelector('#menu-button').addEventListener('click', () => {
    document.querySelector('.game-modes').style.display = 'block';
})


