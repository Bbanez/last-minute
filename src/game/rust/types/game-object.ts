import type { RustBB } from './bb';

export interface RustGameObject {
  position: [number, number];
  size: [number, number];
  bb: RustBB;
}
