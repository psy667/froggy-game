import Phaser from "phaser";
import Graphics from "../assets/Graphics";
import { GameServer } from "../services/game-server";

const speed = 150;

export class Frog {
    public sprite: Phaser.Physics.Arcade.Sprite;
    public keys: Phaser.Types.Input.Keyboard.CursorKeys;
    public id;
    step = 0;;

    constructor(x: number, y: number, scene: Phaser.Scene, id: any) {
        this.id = id;
      for (let animName in Graphics.player.frames) {
        scene.anims.create({
          key: `player-${animName}`,
          frames: scene.anims.generateFrameNumbers(
            "player",
            Graphics.player.frames[animName]
          ),
          frameRate: 16,
          repeat: -1
        });
      }
  
      this.sprite = scene.physics.add.sprite(x, y, id, 0);
      
      this.sprite.setTint(parseInt(id.slice(0,6), 16));
      // this.sprite.setSize(13, 12);
      // this.sprite.setOffset(9, 16);
      this.sprite.anims.play("player-idle");
  
      this.keys = scene.input.keyboard.createCursorKeys();
    }
}

export default class Player extends Frog {
    gameServer: GameServer;
  constructor(x: number, y: number, scene: Phaser.Scene, id: any, gameServer: GameServer) {
    super(x, y, scene, id)
    this.gameServer = gameServer;
  }

  update() {
    const keys = this.keys;
    const body = <Phaser.Physics.Arcade.Body>this.sprite.body;

    // Stop any previous movement from the last frame
    body.setVelocity(0);

    // Horizontal movement
    if (keys.left!.isDown) {
      body.setVelocityX(-speed);
      this.sprite.setFlipX(true);
    } else if (keys.right!.isDown) {
      body.setVelocityX(speed);
      this.sprite.setFlipX(false);
    }

    // Vertical movement
    if (keys.up!.isDown) {
      body.setVelocityY(-speed);
    } else if (keys.down!.isDown) {
      body.setVelocityY(speed);
    }

    if (keys.left!.isDown || keys.right!.isDown || keys.down!.isDown) {
      this.sprite.anims.play("player-walk", true);
    } else if (keys.up!.isDown) {
      this.sprite.anims.play("player-walkBack", true);
    } else {
      this.sprite.anims.play("player-idle", true);
    }
    // Normalize and scale the velocity so that sprite can't move faster along a diagonal
    body.velocity.normalize().scale(speed);

    
    // if(this.gameServer) {
    //     this.gameServer.move({position: [body.position.x, body.position.y]})
    // }
  }
}