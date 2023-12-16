import type { RustBaseStats, RustGameObject } from '.';

export interface RustEnemy {
  id: string;
  destination: [number, number];
  obj: RustGameObject;
  base_stats: RustBaseStats;
  alpha: number;
}
