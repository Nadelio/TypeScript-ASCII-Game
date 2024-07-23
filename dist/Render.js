"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const gameScreen = document.getElementById('gameScreen');
const gui = document.getElementById('gui');
let baseScreen = buildBaseScreen(buildScreenRow());
let screenBuffer = baseScreen.map(row => [...row]);
let bounds = [53, 67];
let playerPosition = [0, 0];
let lastPlayerPosition = [0, 0];
let playerHealth = 100;
let playerScore = 0;
let dead = false;
function buildScreenRow() {
    let row = [];
    for (let i = 0; i < 67; i++) {
        row.push('■');
    }
    return row;
}
function buildBaseScreen(row) {
    let screen = [];
    for (let i = 0; i < 53; i++) {
        screen.push(row);
    }
    return screen;
}
function startRender(screen) {
    return new Promise((resolve, reject) => {
        screen.addEventListener('click', () => {
            screen.requestPointerLock();
        });
        document.addEventListener('keyup', (event) => {
            console.log(`Key released: ${event.key}`);
        });
        document.addEventListener('keydown', (event) => {
            console.log(`Key pressed: ${event.key}`);
            lastPlayerPosition = playerPosition.map(pos => pos);
            if (!dead) {
                switch (event.key) {
                    case 'w':
                        if (collisionCheck(playerPosition[0] - 1, playerPosition[1])) {
                            playerPosition[0] = clamp(playerPosition[0] - 1, 0, bounds[0]);
                        }
                        break;
                    case 'a':
                        if (collisionCheck(playerPosition[0], playerPosition[1] - 1)) {
                            playerPosition[1] = clamp(playerPosition[1] - 1, 0, bounds[1]);
                        }
                        break;
                    case 's':
                        if (collisionCheck(playerPosition[0] + 1, playerPosition[1])) {
                            playerPosition[0] = clamp(playerPosition[0] + 1, 0, bounds[0]);
                        }
                        break;
                    case 'd':
                        if (collisionCheck(playerPosition[0], playerPosition[1] + 1)) {
                            playerPosition[1] = clamp(playerPosition[1] + 1, 0, bounds[1]);
                        }
                        break;
                    case 'p':
                        playerHealth -= 10;
                        break;
                    default:
                        break;
                }
            }
            if (event.key == 'r' && dead) {
                gameRestart();
            }
            screenBuffer[playerPosition[0]][playerPosition[1]] = '●';
            if (lastPlayerPosition[0] !== playerPosition[0] || lastPlayerPosition[1] !== playerPosition[1]) {
                screenBuffer[lastPlayerPosition[0]][lastPlayerPosition[1]] = '■';
            }
        });
        screen.textContent = screenBuffer.map(row => row.join('')).join('\n');
        console.log('Render started');
        resolve();
    });
}
function collisionCheck(row, col) {
    return screenBuffer[row][col] === '■';
}
function initPlayer() {
    screenBuffer[0][0] = '●';
    console.log('Player placed');
}
function placeObstacles() {
    for (let i = 0; i < 200; i++) {
        let row = Math.floor(Math.random() * bounds[0]);
        let col = Math.floor(Math.random() * bounds[1]);
        if (screenBuffer[row][col] !== '●') {
            screenBuffer[row][col] = '□';
        }
    }
}
function pushBufferToScreen(screen) {
    if (screen) {
        screen.textContent = screenBuffer.map(row => row.join('')).join('\n');
        doScreenHighlights();
    }
}
function updateGUI() {
    const healthElement = document.getElementById('health');
    const scoreElement = document.getElementById('score');
    if (healthElement && scoreElement) {
        healthElement.textContent = `${playerHealth}`;
        scoreElement.textContent = `${playerScore}`;
    }
}
function _highlight(wordToHighlight, styleTag) {
    const textElement = document.getElementById('gameScreen');
    if (textElement) {
        let textContent = textElement.textContent || '';
        const escapedWord = wordToHighlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(${escapedWord})`, 'gi');
        textElement.innerHTML = textContent.replace(regex, '<span class="' + styleTag + '">$1</span>');
    }
}
function doScreenHighlights() {
    const textElement = document.getElementById('gameScreen');
    if (textElement) {
        let textContent = screenBuffer.map(row => row.join('')).join('\n');
        const playerSymbol = '●';
        const obstacleSymbol = '□';
        const enemySymbol = 'V';
        const escapedPlayerSymbol = playerSymbol.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const escapedObstacleSymbol = obstacleSymbol.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const escapedEnemySymbol = enemySymbol.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const playerRegex = new RegExp(`(${escapedPlayerSymbol})`, 'gi');
        const obstacleRegex = new RegExp(`(${escapedObstacleSymbol})`, 'gi');
        const enemyRegex = new RegExp(`(${escapedEnemySymbol})`, 'gi');
        textContent = textContent.replace(playerRegex, '<span class="player">$1</span>');
        textContent = textContent.replace(obstacleRegex, '<span class="obstacle">$1</span>');
        textContent = textContent.replace(enemyRegex, '<span class="enemy">$1</span>');
        textElement.innerHTML = textContent;
    }
}
function renderLoop() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            if (playerHealth <= 0) {
                onDeath();
            }
            updateGUI();
            pushBufferToScreen(gameScreen);
            if (dead) {
                break;
            }
            console.log('Render loop');
            yield new Promise(resolve => setTimeout(resolve, 100));
        }
    });
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function onDeath() {
    console.log('Player has died');
    dead = true;
    const gameOverElement = document.getElementById('gameOver');
    if (gameOverElement) {
        gameOverElement.style.display = 'block';
    }
}
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        initPlayer();
        placeObstacles();
        pushBufferToScreen(gameScreen);
        yield startRender(gameScreen);
        renderLoop();
    });
}
function gameRestart() {
    screenBuffer = baseScreen.map(row => [...row]);
    playerPosition = [0, 0];
    lastPlayerPosition = [0, 0];
    playerHealth = 100;
    playerScore = 0;
    dead = false;
    const gameOverElement = document.getElementById('gameOver');
    if (gameOverElement) {
        gameOverElement.style.display = 'none';
    }
    initPlayer();
    placeObstacles();
    pushBufferToScreen(gameScreen);
    renderLoop();
}
start();
