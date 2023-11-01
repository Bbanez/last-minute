import { Application, Graphics } from 'pixi.js';
import { Player } from './player';
import { Layers } from './layers';
import { Ticker } from './ticker';
import { Keyboard } from './keyboard';
import { GameMap, createGameMap } from './map';
import { Camera, createCamera } from './camera';

export class Game {
  app: Application;
  map: GameMap = null as never;
  player: Player = null as never;
  cam: Camera = null as never;
  private unsubs: Array<() => void> = [];

  constructor() {
    this.app = new Application({
      background: 0x000000,
      resizeTo: window,
      antialias: true,
    });
    this.app.ticker.add(() => {
      Ticker.tick();
    });
    Keyboard.init();
  }

  destroy() {
    if (this.player) {
      this.player.destroy();
    }
    this.app.destroy();
  }

  async load(index: number) {
    if (this.player) {
      this.player.destroy();
    }
    if (this.cam) {
      this.cam.destroy();
    }
    this.app.stage.removeChildren(0, this.app.stage.children.length);
    this.unsubs.forEach((e) => e());
    for (let i = Layers.length - 1; i >= 0; i--) {
      const layer = Layers[i];
      layer.removeChildren(0, layer.children.length);
      this.app.stage.addChild(layer);
    }
    this.map = await createGameMap(index);
    this.player = new Player(this.map);
    Layers[0].addChild(this.player.g);
    this.cam = await createCamera(this.player, this.map);
    // for (let i = 0; i < 10; i++) {
    //   for (let j = 0; j < 10; j++) {
    //     const g = new Graphics();
    //     g.beginFill(0xff0000);
    //     g.drawRect(i * 32, j * 32, 32, 32);
    //     g.endFill();
    //     Layers[4].addChild(g);
    //   }
    // }
  }
}

export function createGame() {}
