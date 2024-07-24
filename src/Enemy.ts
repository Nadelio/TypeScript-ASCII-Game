import { addToRegister } from "./Register";
import { subtractHealth, collisionCheck, screenBuffer } from "./Render";

export class Enemy
{
    public UID: number;
    public Position: number[];
    public lastPosition: number[] = [];
    public Health: number;
    public Damage: number;
    public Speed: number;
    public Dead: boolean = false;

    constructor(uid: number, position: number[], health: number, damage: number, speed: number)
    {
        this.UID = uid;
        this.Position = position;
        this.Health = health;
        this.Damage = damage;
        this.Speed = speed;
        addToRegister(this, "enemy");
    }

    private move(playerPosition: number[]){
        if(this.Dead){ return; }

        let availableMoves: number[][] = [[this.Position[0] - 1, this.Position[1]], // left
                                          [this.Position[0] + 1, this.Position[1]], // right
                                          [this.Position[0], this.Position[1] - 1], // up
                                          [this.Position[0], this.Position[1] + 1]]; // down

        let trapCount = 0;
        let distancesToPlayer: number[] = [];

        for(let i = 0; i < availableMoves.length; i++){
            let potentialPosition = [...availableMoves[i]];
            distancesToPlayer.push(this.getDistance(potentialPosition, playerPosition));
            if(!collisionCheck(potentialPosition[0], potentialPosition[1])){
                trapCount++;
            } else if(distancesToPlayer[i] === 1){
                this.attack();
                return;
            }
        }
        
        if(trapCount == 3){ this.getOnlyMove(availableMoves); return; }

        if(trapCount >= 4){ this.Dead = true; return; }

        if(trapCount <= 2){ this.getBestMove(distancesToPlayer, availableMoves); return; }
    }

    private attack(){
        subtractHealth(this.Damage);
    }

    private getDistance(potentialPosition: number[], targetPosition: number[]): number{
        return Math.abs(potentialPosition[0] - targetPosition[0]) + Math.abs(potentialPosition[1] - targetPosition[1]);
    }

    private getOnlyMove(availableMoves: number[][]){
        availableMoves.forEach(element => {
            if(screenBuffer[element[0]][element[1]] === '■'){
                this.Position = element;
                return;
            }
        });
    }

    private getBestMove(distancesToPlayer: number[], availableMoves: number[][]){
        let closestIndex = 0;
        let closestDistance = distancesToPlayer[0];
        for (let i = 1; i < distancesToPlayer.length; i++){
            if (distancesToPlayer[i] < closestDistance) {
                closestDistance = distancesToPlayer[i];
                closestIndex = i;
            }
        }
        this.Position = availableMoves[closestIndex];
    }

    private async delay(milliseconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    public setDead(){ this.Dead = true; }
    public setAlive(){ this.Dead = false; }

    public async doMove(playerPosition: number[]){
        this.lastPosition = this.Position.map(pos => pos);
        this.move(playerPosition);
        this.delay(1000/this.Speed);
        screenBuffer[this.Position[0]][this.Position[1]] = 'V';
        if(this.lastPosition[0] !== this.Position[0] || this.lastPosition[1] !== this.Position[1]){
            screenBuffer[this.lastPosition[0]][this.lastPosition[1]] = '■';
        }
    }
}