
import Phaser from "phaser";
import { PlayScene } from "./scenes/play";
// import SceneWatcherPlugin from "phaser-plugin-scene-watcher";

new Phaser.Game({
  type: Phaser.WEBGL,
  width: window.innerWidth,
  height: window.innerHeight,
  render: { pixelArt: true },
  physics: { default: "arcade", arcade: { debug: false, gravity: { y: 0 } } },
  scene: [PlayScene],
  scale: {
    mode: Phaser.Scale.RESIZE
  }
  // plugins: {
  //   global: [{ key: "SceneWatcher", plugin: SceneWatcherPlugin, start: true }]
  // }
});