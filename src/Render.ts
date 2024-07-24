import { Enemy } from './Enemy';
import { enemyRegister } from './Register';

const gameScreen = document.getElementById('gameScreen');
const gui = document.getElementById('gui');

let baseScreen : string[][] = buildBaseScreen(buildScreenRow());
export let screenBuffer : string[][] = baseScreen.map(row => [...row]);
let bounds: number[] = [53, 67];
let playerPosition: number[] = [0, 0];
let lastPlayerPosition: number[] = [0, 0];

let playerHealth : number = 100;
let playerScore : number = 0;
let dead: boolean = false;

function buildScreenRow(){
    let row : string[] = [];
    for(let i = 0; i < 67; i++){
        row.push('■');
    }
    return row;
}

function buildBaseScreen(row : string[]){
    let screen : string[][] = [];
    for(let i = 0; i < 53; i++){
        screen.push(row);
    }
    return screen;
}

function startRender(screen : HTMLElement): Promise<void> {
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
            if(!dead){
                switch(event.key){
                    case 'w':
                        if(collisionCheck(playerPosition[0] - 1, playerPosition[1])){
                            playerPosition[0] = clamp(playerPosition[0] - 1, 0, bounds[0]);
                        }
                        break;
                    case 'a':
                        if(collisionCheck(playerPosition[0], playerPosition[1] - 1)){
                            playerPosition[1] = clamp(playerPosition[1] - 1, 0, bounds[1]);
                        }
                        break;
                    case 's':
                        if(collisionCheck(playerPosition[0] + 1, playerPosition[1])){
                            playerPosition[0] = clamp(playerPosition[0] + 1, 0, bounds[0]);
                        }
                        break;
                    case 'd':
                        if(collisionCheck(playerPosition[0], playerPosition[1] + 1)){
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
            if(event.key == 'r' && dead){
                gameRestart();
            }
            screenBuffer[playerPosition[0]][playerPosition[1]] = '●';
            if(lastPlayerPosition[0] !== playerPosition[0] || lastPlayerPosition[1] !== playerPosition[1])
            {
                screenBuffer[lastPlayerPosition[0]][lastPlayerPosition[1]] = '■';
            }
        });

        screen.textContent = screenBuffer.map(row => row.join('')).join('\n');
        console.log('Render started');
        resolve();
    });
}

export function collisionCheck(row: number, col: number): boolean{
    switch(screenBuffer[row][col]){
        case 'X':
            console.log('Player touched a dangerous obstacle');
            subtractHealth(10);
            break;
        case 'V':
            console.log('Player touched an enemy');
            subtractHealth(15);
            break;
        default:
            break;
    }

    return screenBuffer[row][col] === '■';
}

function initPlayer(){
    screenBuffer[0][0] = '●';
    console.log('Player placed');
}

function initEnemies(amount: number){
    for(let i = 0; i < amount; i++){
        let row = Math.floor(Math.random() * bounds[0]);
        let col = Math.floor(Math.random() * bounds[1]);
        if(screenBuffer[row][col] !== '●'){
            screenBuffer[row][col] = 'V';
        }
        new Enemy(i, [row, col], 4, 1, 1);
    }
}

function placeObstacles(){
    for(let i = 0; i < 200; i++){
        let row = Math.floor(Math.random() * bounds[0]);
        let col = Math.floor(Math.random() * bounds[1]);
        if(screenBuffer[row][col] !== '●'){
            screenBuffer[row][col] = '□';
        }
    }
}

function pushBufferToScreen(screen : HTMLElement){
    if(screen){
        screen.textContent = screenBuffer.map(row => row.join('')).join('\n');
        doScreenHighlights();
    }
}

function updateGUI(){
    const healthElement = document.getElementById('health');
    const scoreElement = document.getElementById('score');

    if(healthElement && scoreElement){
        healthElement.textContent = `${playerHealth}`;
        scoreElement.textContent = `${playerScore}`;
    }
}

function _highlight(wordToHighlight : string, styleTag : string){
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

        // Escape special characters for symbols
        const playerSymbol = '●';
        const obstacleSymbol = '□';
        const enemySymbol = 'V';
        const escapedPlayerSymbol = playerSymbol.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const escapedObstacleSymbol = obstacleSymbol.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const escapedEnemySymbol = enemySymbol.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

        // Create regex for each highlightable symbol
        const playerRegex = new RegExp(`(${escapedPlayerSymbol})`, 'gi');
        const obstacleRegex = new RegExp(`(${escapedObstacleSymbol})`, 'gi');
        const enemyRegex = new RegExp(`(${escapedEnemySymbol})`, 'gi');

        // Replace symbols with highlighted HTML
        textContent = textContent.replace(playerRegex, '<span class="player">$1</span>');
        textContent = textContent.replace(obstacleRegex, '<span class="obstacle">$1</span>');
        textContent = textContent.replace(enemyRegex, '<span class="enemy">$1</span>');

        textElement.innerHTML = textContent;
    }
}

async function renderLoop(){
    while(true){
        if(playerHealth <= 0){
            onDeath();
        }
        updateGUI();
        pushBufferToScreen(gameScreen as HTMLElement);
        if(dead){break;}
        console.log('Render loop');
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

async function enemyProcess(){
    while(true){
        enemyRegister.forEach(element => {
            element.doMove(playerPosition);
        });
    }
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function onDeath(){
    console.log('Player has died');
    dead = true;
    const gameOverElement = document.getElementById('gameOver');
    if(gameOverElement){
        gameOverElement.style.display = 'block';
    }
}

async function start(){
    initPlayer();
    initEnemies(3);
    placeObstacles();
    pushBufferToScreen(gameScreen as HTMLElement);
    await startRender(gameScreen as HTMLElement);
    renderLoop();
    enemyProcess();
}

function gameRestart(){
    screenBuffer = baseScreen.map(row => [...row]);
    playerPosition = [0, 0];
    lastPlayerPosition = [0, 0];
    playerHealth = 100;
    playerScore = 0;
    dead = false;
    const gameOverElement = document.getElementById('gameOver');
    if(gameOverElement){
        gameOverElement.style.display = 'none';
    }
    initPlayer();
    placeObstacles();
    pushBufferToScreen(gameScreen as HTMLElement);
    renderLoop();
}

export function subtractHealth(amount: number){
    playerHealth -= amount;
}

function addHealth(amount: number){
    playerHealth += amount;
}

function subtractScore(amount: number){
    playerScore -= amount;
}

function addScore(amount: number){
    playerScore += amount;
}

start();

// ■ ● □
//https://www.alt-codes.net/square-symbols

//TO/DO: enemy creation -> movement/ai -> collision detection -> dealing damage/taking damage
//TO/DO: enemy health -> player/enemy attack -> enemy death
//TODO: UI -> score system -> high score
Render.js:11 Uncaught ReferenceError: exports is not defined
at Render.js:11:23
(anonymous) @ Render.js:11