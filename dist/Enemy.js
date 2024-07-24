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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enemy = void 0;
const Register_1 = require("./Register");
const Render_1 = require("./Render");
class Enemy {
    constructor(uid, position, health, damage, speed) {
        this.lastPosition = [];
        this.Dead = false;
        this.UID = uid;
        this.Position = position;
        this.Health = health;
        this.Damage = damage;
        this.Speed = speed;
        (0, Register_1.addToRegister)(this, "enemy");
    }
    move(playerPosition) {
        if (this.Dead) {
            return;
        }
        let availableMoves = [[this.Position[0] - 1, this.Position[1]],
            [this.Position[0] + 1, this.Position[1]],
            [this.Position[0], this.Position[1] - 1],
            [this.Position[0], this.Position[1] + 1]];
        let trapCount = 0;
        let distancesToPlayer = [];
        for (let i = 0; i < availableMoves.length; i++) {
            let potentialPosition = [...availableMoves[i]];
            distancesToPlayer.push(this.getDistance(potentialPosition, playerPosition));
            if (!(0, Render_1.collisionCheck)(potentialPosition[0], potentialPosition[1])) {
                trapCount++;
            }
            else if (distancesToPlayer[i] === 1) {
                this.attack();
                return;
            }
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
    }
    attack() {
        (0, Render_1.subtractHealth)(this.Damage);
    }
    getDistance(potentialPosition, targetPosition) {
        return Math.abs(potentialPosition[0] - targetPosition[0]) + Math.abs(potentialPosition[1] - targetPosition[1]);
    }
    getOnlyMove(availableMoves) {
        availableMoves.forEach(element => {
            if (Render_1.screenBuffer[element[0]][element[1]] === '■') {
                this.Position = element;
                return;
            }
        });
    }
    getBestMove(distancesToPlayer, availableMoves) {
        let closestIndex = 0;
        let closestDistance = distancesToPlayer[0];
        for (let i = 1; i < distancesToPlayer.length; i++) {
            if (distancesToPlayer[i] < closestDistance) {
                closestDistance = distancesToPlayer[i];
                closestIndex = i;
            }
        }
        this.Position = availableMoves[closestIndex];
    }
    delay(milliseconds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => setTimeout(resolve, milliseconds));
        });
    }
    setDead() { this.Dead = true; }
    setAlive() { this.Dead = false; }
    doMove(playerPosition) {
        return __awaiter(this, void 0, void 0, function* () {
            this.lastPosition = this.Position.map(pos => pos);
            this.move(playerPosition);
            this.delay(1000 / this.Speed);
            Render_1.screenBuffer[this.Position[0]][this.Position[1]] = 'V';
            if (this.lastPosition[0] !== this.Position[0] || this.lastPosition[1] !== this.Position[1]) {
                Render_1.screenBuffer[this.lastPosition[0]][this.lastPosition[1]] = '■';
            }
        });
    }
}
exports.Enemy = Enemy;
