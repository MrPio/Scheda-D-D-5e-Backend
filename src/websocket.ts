import WebSocket from 'ws';
import { Subject } from 'rxjs';
import * as https from 'https';
import * as fs from 'fs';

interface MessageEvent {
    ws: WebSocket;
    message: string;
}

const serverOptions = {
    cert: fs.readFileSync('src/websocket_keys/server.cert'),
    key: fs.readFileSync('src/websocket_keys/server.key')
};

const server = new https.Server(serverOptions);
const wss = new WebSocket.Server({ server });

const messageSubject = new Subject<MessageEvent>();
wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
        messageSubject.next({ ws, message });
        // messageSubject.complete();
    });

    ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));
});

messageSubject.subscribe(({ ws, message }) => {
    wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ message: message.toString() }));
        }
    });
});
server.listen(8080, () => {
    console.log('Secure WebSocket server is running on wss://localhost:8080');
});