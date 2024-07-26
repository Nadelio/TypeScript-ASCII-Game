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
class Enemy {
    constructor(uid, position, health, damage, speed, mapBounds) {
        this.lastPosition = [];
        this.Dead = false;
        this.UID = uid;
        this.Position = position;
        this.Health = health;
        this.Damage = damage;
        this.Speed = speed;
        this.mapBounds = mapBounds;
        addToRegister(this, "enemy");
    }
    move(playerPosition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.UID == 0) {
                console.log(this.UID + "> move()");
            }
            if (this.Dead) {
                return;
            }
            let availableMoves = [[clamp(this.Position[0] - 1, 0, this.mapBounds[1]), this.Position[1]],
                [clamp(this.Position[0] + 1, 0, this.mapBounds[1]), this.Position[1]],
                [this.Position[0], clamp(this.Position[1] - 1, 0, this.mapBounds[0])],
                [this.Position[0], clamp(this.Position[1] + 1, 0, this.mapBounds[0])]];
            if (this.UID == 0) {
                console.log(this.UID + "> Avaliable Moves: " + this.format2DArray(availableMoves));
            }
            let trapCount = 0;
            let distancesToPlayer = [];
            if (availableMoves.length === 0) {
                console.error("No available moves.");
                return;
            }
            for (let i = 0; i < availableMoves.length; i++) {
                let potentialPosition = [...availableMoves[i]];
                if (this.UID == 0) {
                    console.log(this.UID + "> Potential Position: " + potentialPosition);
                }
                if (!collisionCheck(clamp(potentialPosition[0], 0, this.mapBounds[0]), clamp(potentialPosition[1], 0, this.mapBounds[1]))) {
                    trapCount++;
                    if (this.UID == 0) {
                        console.log(this.UID + "> Trap Count: " + trapCount);
                    }
                    availableMoves.splice(i, 1);
                    i--;
                    if (this.UID == 0) {
                        console.log(this.UID + "> Available Moves: " + this.format2DArray(availableMoves));
                    }
                }
                else if (distancesToPlayer[i] <= 2) {
                    this.attack();
                    return;
                }
                else {
                    distancesToPlayer.push(this.getDistance(potentialPosition, playerPosition));
                }
            }
            if (this.UID == 0) {
                console.log(this.UID + "> Final Trap Count: " + trapCount);
                console.log(this.UID + "> Distances to Player: " + distancesToPlayer);
            }
            if (trapCount == 3) {
                this.getOnlyMove(availableMoves);
                return;
            }
            if (trapCount >= 4) {
                this.Dead = true;
                return;
            }
            if (trapCount <= 2) {
                this.getBestMove(distancesToPlayer, availableMoves);
                return;
            }
        });
    }
    attack() {
        if (this.UID == 0) {
            console.log(this.UID + "> attack()");
        }
        subtractHealth(this.Damage);
        this.Health--;
    }
    getDistance(potentialPosition, targetPosition) {
        return Math.abs(potentialPosition[0] - targetPosition[0]) + Math.abs(potentialPosition[1] - targetPosition[1]);
    }
    getOnlyMove(availableMoves) {
        if (this.UID == 0) {
            console.log(this.UID + "> getOnlyMove()");
        }
        if (availableMoves.length > 0 && Array.isArray(this.Position)) {
            availableMoves.forEach(element => {
                if (screenBuffer[element[0]][element[1]] === '■') {
                    this.Position = [...element];
                    if (this.UID == 0) {
                        console.log(this.UID + "> Moved To: " + this.Position + " From: " + this.lastPosition);
                    }
                    return;
                }
            });
        }
        else {
            console.error("Available moves is empty or this.Position is not an array.");
        }
    }
    getBestMove(distancesToPlayer, availableMoves) {
        if (this.UID == 0) {
            console.log(this.UID + "> getBestMove()");
        }
        let closestIndex = 0;
        let closestDistance = distancesToPlayer[0];
        for (let i = 1; i < distancesToPlayer.length; i++) {
            if (distancesToPlayer[i] < closestDistance) {
                closestDistance = distancesToPlayer[i];
                closestIndex = i;
            }
            else if (distancesToPlayer[i] === closestDistance) {
                let random = Math.floor(Math.random() * 2);
                if (random == 0) {
                    closestDistance = distancesToPlayer[i];
                    closestIndex = i;
                }
            }
        }
        if (this.UID == 0) {
            console.log(this.UID + "> Best Move: " + availableMoves[closestIndex]);
        }
        this.Position = availableMoves[closestIndex];
        if (this.UID == 0) {
            console.log(this.UID + "> Moved To: " + this.Position + " From: " + this.lastPosition);
        }
    }
    delay(milliseconds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => setTimeout(resolve, milliseconds));
        });
    }
    setDead() { this.Dead = true; }
    setAlive() { this.Dead = false; }
    format2DArray(array) { return array.map(subArray => `[${subArray.join(', ')}]`).join(', '); }
    doMove(playerPosition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray(this.Position) || this.Position.length !== 2) {
                console.error("this.Position is not a valid array." + " Position: " + this.Position);
                return;
            }
            this.lastPosition = [...this.Position];
            yield this.move(playerPosition);
            yield this.delay(1000 / this.Speed);
            screenBuffer[this.Position[0]][this.Position[1]] = 'V';
            if (this.lastPosition[0] !== this.Position[0] || this.lastPosition[1] !== this.Position[1]) {
                screenBuffer[this.lastPosition[0]][this.lastPosition[1]] = '■';
            }
        });
    }
    doDeath() {
        screenBuffer[this.Position[0]][this.Position[1]] = '■';
    }
}
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
let enemyRegister = [];
function addToRegister(data, registerName) {
    switch (registerName) {
        case 'enemy':
            enemyRegister.push(data);
    }
}
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
            lastPlayerPosition = [...playerPosition];
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
let offset = 0;
function initEnemies(amount) {
    for (let i = 0; i < amount; i++) {
        let row = Math.floor(Math.random() * bounds[0]);
        let col = Math.floor(Math.random() * bounds[1]);
        if (screenBuffer[row][col] !== '●' && screenBuffer[row][col] !== 'V' && screenBuffer[row][col] !== '□') {
            screenBuffer[row][col] = 'V';
        }
        new Enemy(i + offset, [row, col], 4, 1, 0.5, bounds);
    }
    offset += amount;
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
            enemyProcess();
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
function enemyProcess() {
    for (let i = 0; i < enemyRegister.length; i++) {
        enemyRegister[i].doMove(playerPosition);
        if (enemyRegister[i].Dead) {
            enemyRegister[i].doDeath();
        }
    }
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
        initEnemies(3);
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
    enemyRegister.forEach(element => { element.setDead(); });
    const gameOverElement = document.getElementById('gameOver');
    if (gameOverElement) {
        gameOverElement.style.display = 'none';
    }
    initPlayer();
    initEnemies(3);
    placeObstacles();
    pushBufferToScreen(gameScreen);
    renderLoop();
}
function subtractHealth(amount) {
    playerHealth -= amount;
}
function addHealth(amount) {
    playerHealth += amount;
}
function subtractScore(amount) {
    playerScore -= amount;
}
function addScore(amount) {
    playerScore += amount;
}
start();
