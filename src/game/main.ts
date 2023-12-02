import { Application } from 'pixi.js';
import { Player } from './player';
import { Layers } from './layers';
import { Ticker } from './ticker';
import { Keyboard } from './keyboard';
import { GameMap, createGameMap } from './map';
import { Camera, createCamera } from './camera';
import { Enemy } from './enemy';
import { loadBcmsData } from './bcms';
import { invoke } from '@tauri-apps/api';

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
      // antialias: true,
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

  async load(mapName: string) {
    await loadBcmsData();
    await invoke('player_load', {
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
    });
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
    this.map = await createGameMap(mapName);
    this.player = new Player(this.map, 20);
    // Layers[0].addChild(this.player.light);
    Layers[0].addChild(this.player.container);
    this.cam = await createCamera(this.player, this.map);
    this.player.bb.show(Layers[1]);
    const enemy = new Enemy(
      [this.player.position[0] + 100, this.player.position[1] + 100],
      10
    );
    enemy.destination = [...this.player.position];
    enemy.bb.show(Layers[2]);
    Layers[3].addChild(enemy.container);
    Ticker.subscribe(() => {
      enemy.destination = [...this.player.position];
    });
  }
}

export function createGame() {}
