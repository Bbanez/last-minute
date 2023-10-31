import { Sprite } from 'pixi.js';
import { Point } from './math';

export type ChunkType = 'r' | 'g' | 'b';

export class Chunk {
  midPosition: Point;
  visible = false;

  constructor(
    public sprite: Sprite,
    public type: ChunkType,
    public position: Point
  ) {
    this.midPosition = [position[0] + 32 / 2, position[1] + 32 / 2];
    this.sprite.position.set(...this.position);
    this.sprite.scale.set(1.1, 1.1);
  }
}
