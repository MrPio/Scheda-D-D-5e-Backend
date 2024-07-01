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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const rxjs_1 = require("rxjs");
const https = __importStar(require("https"));
const fs = __importStar(require("fs"));
const serverOptions = {
    cert: fs.readFileSync('server.cert'),
    key: fs.readFileSync('server.key')
};
const server = new https.Server(serverOptions);
const wss = new ws_1.default.Server({ server });
const messageSubject = new rxjs_1.Subject();
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log(message);
        messageSubject.next({ ws, message });
    });
    ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));
});
messageSubject.subscribe(({ ws, message }) => {
    wss.clients.forEach(client => {
        if (client !== ws && client.readyState === ws_1.default.OPEN) {
            client.send(JSON.stringify({ message: message.toString() }));
        }
    });
});
server.listen(8080, () => {
    console.log('Secure WebSocket server is running on wss://localhost:8080');
});
