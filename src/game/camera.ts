import { Layers } from './layers';
import { GameMap } from './map';
import { Point } from './math';
import { Player } from './player';
import { Ticker } from './ticker';

export interface Camera {
  position: Point;
  update(): void;
  destroy(): void;
}

// async function delay(ms: number) {
//   await new Promise<void>((resolve) => {
//     setTimeout(() => {
//       resolve();
//     }, ms);
//   });
// }

export async function createCamera(
  player: Player,
  map: GameMap
): Promise<Camera> {
  const unsubs: Array<() => void> = [];
  const cam: Camera = {
    position: [0, 0],
    destroy() {
      unsubs.forEach((e) => e());
    },
    update() {
      const w12 = window.innerWidth / 2;
      const h12 = window.innerHeight / 2;
      const skipChunkCalc = [true, true];
      for (let i = 1; i < 5; i++) {
        const position: Point = [
          -player.rust.obj.position[0] + w12,
          -player.rust.obj.position[1] + h12,
        ];
        let x = position[0];
        let y = position[1];
        if (player.rust.obj.position[0] < w12) {
          x = 0;
          player.container.position.x = player.rust.obj.position[0];
        } else if (player.rust.obj.position[0] > map.pWidth - w12) {
          x = -map.pWidth + window.innerWidth;
          player.container.position.x =
            w12 - (map.pWidth - w12 - player.rust.obj.position[0]);
        } else {
          player.container.position.x = w12;
          skipChunkCalc[0] = false;
        }
        if (player.rust.obj.position[1] < h12) {
          y = 0;
          player.container.position.y = player.rust.obj.position[1];
        } else if (player.rust.obj.position[1] > map.pHeight - h12) {
          y = -map.pHeight + window.innerHeight;
          player.container.position.y =
            h12 - (map.pHeight - h12 - player.rust.obj.position[1]);
        } else {
          player.container.position.y = h12;
          skipChunkCalc[1] = false;
        }
        Layers[i].position.set(x, y);
      }
      const offset: Point = [
        player.container.position.x - w12 + 32,
        player.container.position.y - h12 + 32,
      ];
      const cix =
        parseInt(`${(player.rust.obj.position[0] - w12) / 32}`) * 32 - offset[0] - 64;
      const ciy =
        parseInt(`${(player.rust.obj.position[1] - h12) / 32}`) * 32 - offset[1] - 64;
      const cex =
        parseInt(`${(player.rust.obj.position[0] + w12) / 32}`) * 32 - offset[0] + 64;
      const cey =
        parseInt(`${(player.rust.obj.position[1] + h12) / 32}`) * 32 - offset[1] + 64;
      for (let i = 0; i < map.chunks.length; i++) {
        const chunk = map.chunks[i];
        if (
          chunk.position[0] >= cix &&
          chunk.position[0] <= cex &&
          chunk.position[1] >= ciy &&
          chunk.position[1] <= cey
        ) {
          if (!chunk.visible) {
            Layers[4].addChild(chunk.sprite);
            chunk.visible = true;
          }
        } else {
          Layers[4].removeChild(chunk.sprite);
          chunk.visible = false;
        }
      }
    },
  };
  unsubs.push(
    Ticker.subscribe(() => {
      cam.update();
    })
  );
  return cam;
}
