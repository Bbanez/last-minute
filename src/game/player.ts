import { Graphics } from 'pixi.js';
import { PI12, PI14, PI32, PI34, PI54, PI74 } from './consts';
import { Keyboard, KeyboardEventType, KeyboardState } from './keyboard';
import { Ticker } from './ticker';

export class Player {
  g: Graphics;
  size: [number, number] = [32, 80];
  position: [number, number] = [2500, window.innerWidth / 2];
  speed = 4;
  move: [1 | -1 | 0, 1 | -1 | 0] = [0, 0];
  angle = 0;

  private unsubs: Array<() => void> = [];

  constructor() {
    this.g = new Graphics();
    this.g.pivot.set(this.size[0] / 2, this.size[1] / 2);
    this.g.position.set(window.innerWidth / 2, window.innerHeight / 2);
    this.g.width = this.size[0];
    this.g.height = this.size[1];
    this.g.beginFill(0x00ff00);
    this.g.drawRect(0, 0, ...this.size);
    this.g.endFill();
    this.unsubs.push(
      Ticker.subscribe(() => {
        this.calcPosition();
      }),
      Keyboard.subscribe(KeyboardEventType.KEY_DOWN, (state) => {
        this.setMove(state);
      }),
      Keyboard.subscribe(KeyboardEventType.KEY_UP, (state) => {
        this.setMove(state);
      })
    );
  }

  setMove(state: KeyboardState) {
    if (state.w) {
      this.move[1] = -1;
    } else if (state.s) {
      this.move[1] = 1;
    } else {
      this.move[1] = 0;
    }
    if (state.a) {
      this.move[0] = -1;
    } else if (state.d) {
      this.move[0] = 1;
    } else {
      this.move[0] = 0;
    }
    this.calcAngle();
  }

  calcAngle() {
    if (this.move[0] === 1 && this.move[1] === 0) {
      this.angle = 0;
    } else if (this.move[0] === 1 && this.move[1] === 1) {
      this.angle = PI14;
    } else if (this.move[0] === 0 && this.move[1] === 1) {
      this.angle = PI12;
    } else if (this.move[0] === -1 && this.move[1] === 1) {
      this.angle = PI34;
    } else if (this.move[0] === -1 && this.move[1] === 0) {
      this.angle = Math.PI;
    } else if (this.move[0] === -1 && this.move[1] === -1) {
      this.angle = PI54;
    } else if (this.move[0] === 0 && this.move[1] === -1) {
      this.angle = PI32;
    } else if (this.move[0] === 1 && this.move[1] === -1) {
      this.angle = PI74;
    }
  }

  calcPosition() {
    this.position[0] =
      this.speed * Math.cos(this.angle) * Math.abs(this.move[0]) +
      this.position[0];
    this.position[1] =
      this.speed * Math.sin(this.angle) * Math.abs(this.move[1]) +
      this.position[1];
  }

  destroy() {
    this.g.clear();
    this.unsubs.forEach((e) => e());
  }
}
