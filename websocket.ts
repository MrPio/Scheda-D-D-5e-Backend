import WebSocket from 'ws';
import { Subject } from 'rxjs';
import * as https from 'https';
import * as fs from 'fs';

interface MessageEvent {
    ws: WebSocket;
    message: string;
}

const serverOptions = {
    cert: fs.readFileSync('server.cert'),
    key: fs.readFileSync('server.key')
};

const server = new https.Server(serverOptions);
const wss = new WebSocket.Server({ server });

const messageSubject = new Subject<MessageEvent>();
wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
        console.log(message)
        messageSubject.next({ ws, message });
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