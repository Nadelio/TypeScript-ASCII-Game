"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.avaliableWin = void 0;
const electron_1 = require("electron");
const path = __importStar(require("path"));
function createWindow() {
    let win = new electron_1.BrowserWindow({
        width: 740,
        height: 690,
        backgroundColor: '#006400',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    win.setMenu(null);
    win.webContents.openDevTools();
    win.loadFile(path.join(__dirname, 'index.html'));
    exports.avaliableWin = win;
}
electron_1.app.whenReady().then(createWindow);
