import type { RustBB } from './bb';

export interface RustGameObject {
  position: [number, number];
  size: [number, number];
  bb: RustBB;
}

export interface RustBaseStats {
  max_hp: number;
  hp: number;
  damage: number;
  move_speed: number;
  attack_speed: number;
  armor: number;
}

export interface RustCharacterStats {
  recovery: number;
  magnet: number;
  growth: number;
  greed: number;
  curse: number;
}
