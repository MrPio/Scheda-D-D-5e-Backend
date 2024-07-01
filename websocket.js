"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var rxjs_1 = require("rxjs");
var https = require("https");
var fs = require("fs");
var serverOptions = {
    cert: fs.readFileSync('server.cert'),
    key: fs.readFileSync('server.key')
};
var server = new https.Server(serverOptions);
var wss = new ws_1.default.Server({ server: server });
var messageSubject = new rxjs_1.Subject();
wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        console.log(message);
        messageSubject.next({ ws: ws, message: message });
    });
    ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));
});
messageSubject.subscribe(function (_a) {
    var ws = _a.ws, message = _a.message;
    wss.clients.forEach(function (client) {
        if (client !== ws && client.readyState === ws_1.default.OPEN) {
            client.send(JSON.stringify({ message: message.toString() }));
        }
    });
});
server.listen(8080, function () {
    console.log('Secure WebSocket server is running on wss://localhost:8080');
});
