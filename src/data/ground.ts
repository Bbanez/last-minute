import { Point } from '../game/math';

export const groundData: Array<{
  gridSize: { w: number; h: number };
  chunks: {
    r: Point[];
    g: Point[];
    b: Point[];
  };
}> = [
  {
    gridSize: {
      w: 32,
      h: 32,
    },
    chunks: {
      r: [
        [1, 1],
        [3, 1],
        [5, 1],
        [7, 1],
        [9, 1],
        [11, 1],
        [13, 1],
      ],
      g: [],
      b: [[1, 3]],
    },
  },
];
