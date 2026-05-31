import { WebSocketServer } from 'ws';
import { events } from '@repo/shared/events';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});

console.log('WebSocket server is running on ws://localhost:8080');