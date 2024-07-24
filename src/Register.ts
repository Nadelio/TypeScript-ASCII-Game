import { Enemy } from "./Enemy";

export let enemyRegister: Enemy[] = [];

export function addToRegister(data: any, registerName: string) {
    switch (registerName) {
        case 'enemy':
            enemyRegister.push(data as Enemy);
    }
}
