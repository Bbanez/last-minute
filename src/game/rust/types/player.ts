import type { RustGameObject } from './game-object';

export interface RustPlayer {
  hp: number;
  speed: number;
  angle: number;
  motion: [number, number];
  obj: RustGameObject;
  map_size: [number, number];
}
