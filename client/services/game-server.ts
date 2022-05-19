import { EventType, IPlayer, Payload, PayloadType } from "../../protocol/main";
import Player from "../entities/Player";

class EventEmitter{
    callbacks: Record<string, Function[]>;
    
    constructor(){
        this.callbacks = {}
    }

    on(event, cb){
        if(!this.callbacks[event]) this.callbacks[event] = [];
        this.callbacks[event].push(cb)
    }

    emit(event, ...args){
        let cbs = this.callbacks[event]
        if(cbs){
            cbs.forEach(cb => cb(...args))
        }
    }
}



class WebSocketClient {
    server = new WebSocket('ws://192.168.100.5:8080');

    eventEmitter: EventEmitter = new EventEmitter();

    constructor() {
        this.server.onmessage = (event) => {
            const message = JSON.parse(event.data);

            this.eventEmitter.emit(message.type, message.payload)
        }
    }

    onMessage<T extends PayloadType>(type: EventType, cb: (payload: Payload<T>) => void) {
        this.eventEmitter.on(type, cb);
    }

    async emit<T extends PayloadType>(type: EventType, payload: Payload<T>, token?: string) {
        const message = {
            type,
            payload,
            token,
        };

        // await new Promise((r) => setTimeout(r, 200));

        this.server.send(JSON.stringify(message));
    }
}

export class GameServer {
    scene
    gameState = {};
    server: WebSocketClient;
    me: IPlayer;
    token: string;
    players: IPlayer[]
    lastEmit = 0;

    public onSpawn: (player: IPlayer, server: GameServer) => void;
    public onSpawnPlayers: (players: IPlayer[]) => void;

    constructor(scene) {
        this.scene = scene;
        this.server = new WebSocketClient();
    }

    async auth() {
        if(!localStorage.getItem('token')) {
            localStorage.setItem('token', this.generateToken());
        }

        const token = localStorage.getItem('token');
        this.token = token;
        
        await new Promise((r) => setTimeout(r, 200));

        this.server.emit<EventType.AUTH>(EventType.AUTH, {name: 'FROGGY', token: token});

        this.server.onMessage<EventType.GAME_STATE>(EventType.GAME_STATE, (payload) => {
            this.me = payload.players.find(it => this.token.startsWith(it.id));
            this.players = payload.players.filter(it => !this.token.startsWith(it.id));

            this.onSpawn(this.me, this);
            this.onSpawnPlayers(this.players);
        })
    }

    move(payload: Payload<EventType.MOVE>) {
        if(Date.now() - this.lastEmit > 1000 / 64) {
            this.server.emit(EventType.MOVE, payload, this.token);
            this.lastEmit = Date.now()
        }
    }

    private generateToken() {
        return [0,0].reduce((acc,cur) => acc + Math.random().toString(16).slice(2), '');
    }

    getPlayers() {

    }
}