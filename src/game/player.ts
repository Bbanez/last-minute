import {
  AnimatedSprite,
  BLEND_MODES,
  BaseTexture,
  Container,
  Rectangle,
  Sprite,
  Texture,
} from 'pixi.js';
import { PI12, PI14, PI32, PI34, PI54, PI74 } from './consts';
import { Keyboard, KeyboardEventType, KeyboardState } from './keyboard';
import { Ticker } from './ticker';
import { GameMap } from './map';
import { BB, Point } from './math';

export class Player {
  container: Container;
  light: Sprite;
  size: [number, number] = [32, 80];
  position: Point = [window.innerWidth / 2, window.innerHeight / 2];
  // position: [number, number] = [2500, 2500];
  speed = 8;
  move: [1 | -1 | 0, 1 | -1 | 0] = [0, 0];
  angle = 0;
  bb: BB;

  private unsubs: Array<() => void> = [];

  constructor(private map: GameMap, public hp: number) {
    this.light = Sprite.from('/game/map/p-light.png');
    this.light.blendMode = BLEND_MODES.ADD;
    this.light.pivot.set(250, 250);
    this.container = new Container();
    this.container.addChild(this.light);
    this.bb = new BB(32, 80, this.position);
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

    const idleBaseTexture = BaseTexture.from('/game/character/demo/run.png');
    const idleFrames: Texture[] = [];
    for (let i = 0; i < 8; i++) {
      idleFrames.push(
        new Texture(idleBaseTexture, new Rectangle(i * 48, 0, 48, 48))
      );
    }
    const idleAnim = new AnimatedSprite(idleFrames);
    idleAnim.play();
    idleAnim.pivot.set(24, 24);
    idleAnim.animationSpeed = 0.25;
    this.container.addChild(idleAnim);
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
    if (this.position[0] <= 16) {
      this.position[0] = 16;
    } else if (this.position[0] >= this.map.pWidth - 16) {
      this.position[0] = this.map.pWidth - 16;
    }
    if (this.position[1] <= 40) {
      this.position[1] = 40;
    } else if (this.position[1] >= this.map.pHeight - 40) {
      this.position[1] = this.map.pHeight - 40;
    }
    // this.light.position.set(
    //   this.container.position.x,
    //   this.container.position.y
    // );
    this.bb.updatePosition([this.position[0] - 16, this.position[1] - 40]);
  }

  destroy() {
    this.container.removeChildren(0, this.container.children.length);
    this.unsubs.forEach((e) => e());
  }
}
