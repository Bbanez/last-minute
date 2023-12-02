import { Sprite } from 'pixi.js';
import { Point } from './math';
import { PI12, PI32 } from './consts';

export class Chunk {
  midPosition: Point;
  visible = false;

  constructor(
    public sprite: Sprite,
    public type: string,
    public position: Point,
    angle?: number
  ) {
    this.midPosition = [position[0] + 32 / 2, position[1] + 32 / 2];
    this.sprite.pivot.set(0.5, 0.5);
    this.sprite.position.set(...this.position);
    this.sprite.scale.set(1.03125, 1.03125);
    this.sprite.position.x -= 1;
    this.sprite.position.y -= 1;
    if (angle) {
      this.sprite.rotation = angle;
      const offset = 32;
      if (angle === PI12) {
        this.sprite.position.x += offset;
      } else if (angle === Math.PI) {
        this.sprite.position.x += offset;
        this.sprite.position.y += offset;
      } else if (angle === PI32) {
        this.sprite.position.y += offset;
      }
    }
  }
}
