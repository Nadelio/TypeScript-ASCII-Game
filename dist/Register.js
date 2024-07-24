"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enemyRegister = void 0;
exports.addToRegister = addToRegister;
exports.enemyRegister = [];
function addToRegister(data, registerName) {
    switch (registerName) {
        case 'enemy':
            exports.enemyRegister.push(data);
    }
}
