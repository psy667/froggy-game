import Phaser from "phaser";
import Tiles from "../assets/Graphics";
// import FOVLayer from "../entities/FOVLayer";
import Player, { Frog } from "../entities/Player";
import GameMap from "../entities/Map";
import { GameServer } from "../services/game-server";
import { IPlayer } from "../../protocol/main";

const worldTileHeight = 81;
const worldTileWidth = 81;

export class PlayScene extends Phaser.Scene {
  lastX: number;
  lastY: number;
  player: Player | null;
  frogs: Map<string, Frog> = new Map();

//   fov: FOVLayer | null;
  tilemap: Phaser.Tilemaps.Tilemap | null;

  preload(): void {
    // this.load.image("dungeon", Tiles.dungeon.file);
    this.load.image("grass", Tiles.grass.file);
    this.load.image("dirt", Tiles.dirt.file);
    this.load.image("water", Tiles.water.file);

    this.load.image("util", Tiles.util.file);
    this.load.spritesheet("player", Tiles.player.file, {
      frameHeight: Tiles.player.height,
      frameWidth: Tiles.player.width
    });
  }

  constructor() {
    super("Scene");
    this.lastX = -1;
    this.lastY = -1;
    this.player = null;
    // this.fov = null;
    this.tilemap = null;
  }

  create(): void {
    const map = new GameMap(worldTileWidth, worldTileHeight, this);
    this.tilemap = map.tilemap;

    // this.fov = new FOVLayer(map.width, map.height, map.tiles, this.tilemap);
    const server = new GameServer(this);
    server.auth();

    // console.log(map.width);
    // this.player = new Player(
    //     this.tilemap.tileToWorldX(2),
    //     this.tilemap.tileToWorldY(2),
    //     this
    //   );
  
    // this.cameras.main.startFollow(this.player.sprite);
    // this.physics.add.collider(this.player.sprite, map.wallLayer);

    server.onSpawn = (player: IPlayer, gameServer) => {
        const [x,y] = player.position;

        if(!this.player) {
            console.log('spawn', player);

            this.player = new Player(
                (x),
                (y),
                this,
                player.id,
                gameServer
              );
          
            this.cameras.main.startFollow(this.player.sprite);
            this.physics.add.collider(this.player.sprite, map.wallLayer);
        } else {
            this.player.update()
        }
    }


    server.onSpawnPlayers = (frogs) => {
        // console.log(frogs);
        frogs.forEach((frog) => {
            const [x,y] = frog.position;
            
            console.log(frog.id, this.player.id);
            if(frog.id === this.player.id) {
                return;
            }
            if(this.frogs.has(frog.id)) {
                const currentFrog = this.frogs.get(frog.id);
                console.log(currentFrog.sprite.x, x);

                if(currentFrog.sprite.x == x && currentFrog.sprite.y == y) {
                    currentFrog.step++
                    if(currentFrog.step > 10) {
                        // currentFrog.sprite.setVelocityX(1);
                        currentFrog.sprite.anims.play("player-idle", true);
                    }
                } else {
                    if(currentFrog.sprite.x < x) {
                        currentFrog.sprite.setFlipX(false);
                    }  else {
                        currentFrog.sprite.setFlipX(true);
                    }
                    if(currentFrog.step > 1) {
                        currentFrog.sprite.anims.play("player-walk", true);

                    }
                    currentFrog.step = 0;
                    // currentFrog.sprite.setTint(0xff0000);

                }
                currentFrog.sprite.setPosition(x,y);


                return;
            }
            this.frogs.set(frog.id, new Frog(
                (x),
                (y),
                this,
                frog.id
            ));
        })
    }

    // this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(3);
    this.cameras.main.setBounds(
      0,
      0,
      map.width * Tiles.dungeon.width,
      map.height * Tiles.dungeon.height
    );

  }

  update() {
    if(!this.player) {
        return;
    }
    // console.log(this.player.sprite.data);

    this.player!.update();

    // const playerX = this.tilemap!.worldToTileX(this.player!.sprite.x);
    // const playerY = this.tilemap!.worldToTileY(this.player!.sprite.y);

    this.player.gameServer.move({position: [this.player!.sprite.x, this.player!.sprite.y]})
    // this.fov!.update(playerX, playerY);
  }
}
