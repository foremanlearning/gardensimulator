import Game from './engine/game.js';

window.addEventListener('load', () => {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const game = new Game(canvas);
    game.start();
}); 