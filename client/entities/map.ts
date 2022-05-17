import Tile, { TileType } from "../entities/Tile";
import Tiles from "../assets/Graphics";
import { getRandomItem } from "../utils/array-utils";
import { perlin } from "../utils/perlin";

const generateMap = (w, h) => {
    const tiles = [];
    for(let i = 0; i < w; i++) {
        tiles.push([]);
        for(let j = 0; j < h; j++) {
            const v = perlin.get(i / 16, j / 16) + 0.5;

            const value = v < 0.3 ? TileType.Water : v > 0.4 ?  TileType.Grass : TileType.Dirt;
            tiles[i][j] = {type: value}
        }
    }

    return {
        tiles,
        rooms: [{height: 10, width: 10, x: 50, y: 50}]
    }
}


export default class Map {
  public readonly tiles: Array<Array<Tile>>;
  public readonly width: number;
  public readonly height: number;
  public readonly tilemap: Phaser.Tilemaps.Tilemap;
  public readonly wallLayer: Phaser.Types.Tilemaps.StaticTilemapLayer;

  public readonly startingX: number;
  public readonly startingY: number;

  constructor(width: number, height: number, scene: Phaser.Scene) {
    const dungeon = generateMap(width, height);


    this.width = width;
    this.height = height;

    this.tiles = [];
    for (let y = 0; y < height; y++) {
      this.tiles.push([]);
      for (let x = 0; x < width; x++) {
        this.tiles[y][x] = new Tile(
          dungeon.tiles[x][y].type,
          x,
          y,
          this
        );
      }
    }

    // const toReset = [];
    // for (let y = 0; y < height; y++) {
    //   for (let x = 0; x < width; x++) {
    //     const tile = this.tiles[y][x];
    //     if (tile.type === TileType.Wall && tile.isEnclosed()) {
    //       toReset.push({ y: y, x: x });
    //     }
    //   }
    // }

    // toReset.forEach(d => {
    //   this.tiles[d.y][d.x] = new Tile(TileType.None, d.x, d.y, this);
    // });

    // const roomNumber = Math.floor(Math.random() * dungeon.rooms.length);

    // const firstRoom = dungeon.rooms[roomNumber];
    this.startingX = Math.floor(width * Math.random());
    this.startingY = Math.floor(height * Math.random());

    this.tilemap = scene.make.tilemap({
      tileWidth: Tiles.dungeon.width,
      tileHeight: Tiles.dungeon.height,
      width: width,
      height: height
    });

    const grassTiles = this.tilemap.addTilesetImage("grass");
    const waterTiles = this.tilemap.addTilesetImage("water");
    const dirtTiles = this.tilemap.addTilesetImage("dirt");

    const groundLayer = this.tilemap
      .createBlankLayer("Grass", grassTiles, 0, 0)
      .randomize(
        0,
        0,
        this.width,
        this.height,
        Tiles.grass.indices.main
      );

    
    const waterLayer = this.tilemap.createBlankLayer(
        "Water",
        waterTiles,
        0,
        0
    )

    const dirtLayer = this.tilemap.createBlankLayer(
        "Dirt",
        dirtTiles,
        0,
        0
    )

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const tile = this.tiles[y][x];
        
        if (tile.type === TileType.Water) {
            waterLayer.putTileAt(getRandomItem(Tiles.water.indices.main), x, y)
        }

        if(tile.type === TileType.Dirt) {
            const dirtType = tile.wallIndex();
            if(dirtType !== Tiles.dirt.indices.main[0]) {
                waterLayer.putTileAt(Tiles.water.indices.main[0], x, y)
            }
            dirtLayer.putTileAt(dirtType, x, y)
        }
      }
    }

    this.wallLayer = waterLayer;
    waterLayer.setCollisionBetween(0,256);
  }

  tileAt(x: number, y: number): Tile | null {
    if (y < 0 || y >= this.height || x < 0 || x >= this.width) {
      return null;
    }
    return this.tiles[y][x];
  }
}
