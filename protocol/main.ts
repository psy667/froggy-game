export enum EventType {
    UNDEFINED = 'UNDEFINED',
    AUTH = 'AUTH',
    MOVE = 'MOVE',
    ATTACK = 'ATTACK',
    GET_HIT = 'GET_HIT',
    EAT = 'EAT',
    GAME_STATE = 'GAME_STATE',
}

// X, Y
export type Position = [number, number]

export type Direction = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

type payloads = {
    [EventType.AUTH]: {
        name: string,
        token: string,
    },
    [EventType.MOVE]: {
        position: Position
    },
    [EventType.ATTACK]: {
        direction: Direction
    },
    [EventType.GET_HIT]: {
        direction: Direction
    },
    [EventType.GAME_STATE]: GameState
}

export type PayloadType = keyof payloads;

export type Payload<T extends PayloadType> = payloads[T]


export type GameEvent<T extends PayloadType> = {
    type: T,
    payload: Payload<T>
    token?: string
}

interface FrogClass {

}

export interface IPlayer {
    position: Position;
    hp: number;
    frogClass: FrogClass;
    id: string;
    name: string;
}

export type GameState = {
    players: IPlayer[],
    timer: number
}