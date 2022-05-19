import { EventType, GameEvent, IPlayer, Payload, PayloadType, Position } from '../../protocol/main';
import { EventEmitter } from 'stream';
import WebSocket, { WebSocketServer } from 'ws';


export class Server {
    wss: WebSocketServer;
    eventEmitter: EventEmitter = new EventEmitter();


    constructor() {
        this.wss = new WebSocketServer({ port: 8080 });
        this.init()
    }

    init() {
        this.wss.on('connection', (ws) => {

            ws.on('message', (rawMessage) => {


                const message = JSON.parse(rawMessage.toString());

                if(!message && !message.type) {
                    throw new Error('Invalid message');
                }

                this.eventEmitter.emit(message.type, message.payload, message.token);
            });
        });

    }

    onMessage<T extends PayloadType>(type: T, cb: (payload: Payload<T>, token?: string) => void) {
        this.eventEmitter.addListener(type, cb);
    }


    broadcast(data: any) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: EventType.GAME_STATE,
                    payload: data,
                }), { binary: false });
            }
        });
    }
}

export class FrogClass {

}

export class Player implements IPlayer {
    position: Position = [0, 0];
    hp: number = 0;
    frogClass: FrogClass = new FrogClass();
    id: string;
    name: string;

    constructor(token: string, name: string) {
        this.id = token.slice(0,8);
        this.name = name;
    }

    setPosition(newPosition: Position) {
        this.position = newPosition;
    }
}

class Logger {
    lastEvents: string[] = [];
    props: Record<string, string> = {};

    constructor() {
        setInterval(() => {
            console.clear()
            console.log('STATS');
            Object.entries(this.props).forEach(([k,v]) => {
                console.log(`${k}: ${v}`)
            })
            this.lastEvents.slice(-5).forEach(it => console.log(it));
        }, 300);
    }

    addEvent(event: string) {
        this.lastEvents.push(event)
    }

    addProp(key: string, value: string) {
        this.props[key] = value;
    }
}

export class Game {
    players: Map<string, Player> = new Map();
    server: Server;
    gameState: {
        players: Player[],
        timer: number
    } = {
        players: [],
        timer: 0,
    }
    logger;

    constructor() {
        this.logger = new Logger();
        this.server = new Server();
        this.onAuth();
        this.onMove();
        this.broadcastGameState();
    }

    onAuth() {
        this.server.onMessage<EventType.AUTH>(EventType.AUTH, (payload: Payload<EventType.AUTH>) => {
            if(payload.token.length < 16 || payload.token.length > 32) {
                throw new Error('invalid token')
            }

            if(!this.players.get(payload.token)) {
                const player = new Player(payload.token, payload.name);
                player.setPosition([500 + Math.random() * 500, 500 + Math.random() * 500])
                
                this.logger.addEvent('new player: ' + player.name);

                this.players.set(
                    payload.token,
                    player
                )
            }

            
        })
    }

    onMove() {
        this.server.onMessage<EventType.MOVE>(EventType.MOVE, (payload, token) => {
            if(!token) {throw new Error('unauthenticated')}

            const player = this.players.get(token);
            
            if(!player) {throw new Error('unauthenticated')}
            
            this.logger.addProp(token, payload.position.join(':'))

            player.setPosition(payload.position);
        })
    }

    broadcastGameState() {
        setInterval(() => {
            this.updageGameState()
            this.server.broadcast(this.gameState);
            this.logger.addProp('players', this.gameState.players.length.toString());
        }, 1000 / 128);
    }

    private updageGameState() {
        this.gameState = {...this.gameState, players: [...this.players.values()]};
    }
}

new Game();