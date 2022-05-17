import Map from "./map";
import Graphics from "../assets/Graphics";

export enum TileType {
  None,
  Grass,
  Water,
  Dirt,
}

export default class Tile {
  public readonly collides: boolean;
  public readonly type: TileType;
  public readonly map: Map;
  public readonly x: number;
  public readonly y: number;

  constructor(type: TileType, x: number, y: number, map: Map) {
    this.type = type;
    this.collides = type !== TileType.None;
    this.map = map;
    this.x = x;
    this.y = y;
  }

  neighbours(): { [dir: string]: Tile | null } {
    return {
      n: this.map.tileAt(this.x, this.y - 1),
      s: this.map.tileAt(this.x, this.y + 1),
      w: this.map.tileAt(this.x - 1, this.y),
      e: this.map.tileAt(this.x + 1, this.y),
      nw: this.map.tileAt(this.x - 1, this.y - 1),
      ne: this.map.tileAt(this.x + 1, this.y - 1),
      sw: this.map.tileAt(this.x - 1, this.y + 1),
      se: this.map.tileAt(this.x + 1, this.y + 1)
    };
  }

  isEnclosed(): boolean {
    return (
      Object.values(this.neighbours()).filter(
        t => !t || t.type === TileType.Wall
      ).length === 8
    );
  }

  // prettier-ignore
  wallIndex() {
    

    const neighbours = this.neighbours();

    const n = neighbours.n && neighbours.n.type === TileType.Water;
    const s = neighbours.s && neighbours.s.type === TileType.Water;
    const w = neighbours.w && neighbours.w.type === TileType.Water;
    const e = neighbours.e && neighbours.e.type === TileType.Water;
    const nw = neighbours.nw && neighbours.nw.type === TileType.Water;
    const ne = neighbours.ne && neighbours.ne.type === TileType.Water;
    const sw = neighbours.sw && neighbours.sw.type === TileType.Water;
    const se = neighbours.se && neighbours.se.type === TileType.Water;


    const i = Graphics.dirt.indices;

    // if(nw) {
    //     return i.edges.inner.se
    // }

    if(ne && n && e && !s && !w) {
        return i.edges.inner.sw
    }

    if(nw && n && w && !s && !e) {
        return i.edges.inner.se
    }

    if(se && s && e && !n && !w) {
        return i.edges.inner.nw
    }

    if(sw && s && w && !n && !e) {
        return i.edges.inner.ne
    }

    // if(neighbours.s && neighbours.s.wallIndex() === i.edges.outer.sw) {
    //     return i.edges.outer.w
    // }

    // if(neighbours.w && neighbours.w.wallIndex() === i.edges.outer.sw) {
    //     return i.edges.inner.

    // }


    
    // if (n && e && s && w) { return i.intersections.n_e_s_w; }
    // if (n && e && s) { return i.intersections.n_e_s; }
    // if (n && s && w) { return i.intersections.n_s_w; }
    // if (e && s && w) { return i.intersections.e_s_w; }
    // if (n && e && w) { return i.intersections.n_e_w; }

    if (e && s) { return i.edges.outer.se; }
    // if (e && w) { return i.intersections.we; }
    if (s && w) { return i.edges.outer.sw; }
    // if (n && s) { return i.intersections.n_s; }
    if (n && e) { return i.edges.outer.ne; }
    if (n && w) { return i.edges.outer.nw; }

    // if (n) { return i.edges.outer.n; }
    // if (s) { return i.edges.outer.s; }
    // if (e) { return i.edges.outer.e; }
    // if (w) { return i.edges.outer.w; }

    return Graphics.dirt.indices.main[0];
    // return i.alone;
  }
}

