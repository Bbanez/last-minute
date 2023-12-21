import { Application, Filter, Texture } from 'pixi.js';
import { Layers } from './layers';
import { Ticker } from './ticker';
import { Keyboard } from './keyboard';
import { GameMap, createGameMap } from './map';
import { Camera, createCamera } from './camera';
import { Enemy, createEnemy } from './enemy';
import { loadBcmsData } from './bcms';
import { Player, createPlayer } from './player';
import { invoke } from '@tauri-apps/api';
import postProcessingFrag from './shaders/post-processing.frag';
import postProcessingVert from './shaders/post-processing.vert';
import l4Frag from './shaders/l4.frag';
import l4Vert from './shaders/l4.vert';

export class Game {
  app: Application;
  map: GameMap = null as never;
  player: Player = null as never;
  cam: Camera = null as never;
  enemies: Enemy[] = [];
  private unsubs: Array<() => void> = [];

  constructor() {
    this.app = new Application({
      background: 0x000000,
      resizeTo: window,
      // antialias: true,
    });
    this.app.stage.filters = [
      new Filter(postProcessingVert, postProcessingFrag, {
        uSampler2: Texture.from('/game/s-test.png'),
      }),
    ];
    this.app.ticker.add(() => {
      Ticker.tick();
    });
    Keyboard.init();
  }

  destroy() {
    this.unsubs.forEach((e) => e());
    this.unsubs = [];
    if (this.player) {
      this.player.destroy();
    }
    if (this.cam) {
      this.cam.destroy();
    }
    if (this.app) {
      this.app.stage.removeChildren(0, this.app.stage.children.length);
      // this.app.destroy();
    }
    Ticker.clear();
  }

  async load(mapName: string) {
    this.destroy();
    this.unsubs.push(
      Ticker.subscribe(async () => {
        await invoke('on_tick');
      })
    );
    this.app.renderer.extract.image(Layers[0]);
    await loadBcmsData();
    for (let i = Layers.length - 1; i >= 0; i--) {
      const layer = Layers[i];
      layer.removeChildren(0, layer.children.length);
      this.app.stage.addChild(layer);
    }
    this.map = await createGameMap(mapName);
    this.player = await createPlayer(this.app, 'demo');
    Layers[4].filters = [
      new Filter(l4Vert, l4Frag, {
        uSampler2: Texture.from('/game/s-test.png'),
      }),
    ];
    Layers[0].addChild(this.player.container);
    this.cam = await createCamera(this.player, this.map);
    const enemy = await createEnemy('demo', () => {
      Layers[3].removeChild(enemy.container);
    });
    this.enemies.push(enemy);
    Layers[3].addChild(enemy.container);
  }
}

export function createGame() {}
