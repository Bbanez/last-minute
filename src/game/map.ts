import { BaseTexture, Rectangle, Sprite, Texture } from 'pixi.js';
import { groundData } from '../data/ground';
import { Chunk } from './chunk';
import { MathUtil, Point } from './math';

export interface GameMap {
  width: number;
  height: number;
  // Width in pixels
  pWidth: number;
  // Height in pixels
  pHeight: number;
  textureChannels: {
    r: Texture[];
    g: Texture[];
    b: Texture[];
  };
  chunks: Chunk[];
}

export async function createGameMap(index: number): Promise<GameMap> {
  const mapPixInfo = await getPixelInfo(`/game/map/${index}-ground-map.png`);
  if (!mapPixInfo) {
    throw Error(`Cannot load map pixel info for map ${index}`);
  }
  const groundTexture = BaseTexture.from(`/game/map/${index}-ground.png`);
  const output: GameMap = {
    width: mapPixInfo.width,
    height: mapPixInfo.height,
    pWidth: mapPixInfo.width * 32,
    pHeight: mapPixInfo.height * 32,
    chunks: [],
    textureChannels: {
      r: [],
      g: [],
      b: [],
    },
  };
  const channels: Array<'r' | 'g' | 'b'> = ['r', 'g', 'b'];
  for (let c = 0; c < channels.length; c++) {
    const channel = channels[c];
    for (let i = 0; i < groundData[index].chunks[channel].length; i++) {
      const chunk = groundData[index].chunks[channel][i];
      const offset = [
        groundData[index].gridSize.w * chunk[0],
        groundData[index].gridSize.h * chunk[1],
      ];
      output.textureChannels[channel].push(
        new Texture(
          groundTexture,
          new Rectangle(
            offset[0],
            offset[1],
            groundData[index].gridSize.w,
            groundData[index].gridSize.h
          )
        )
      );
    }
  }
  const pixArrSize = mapPixInfo.width * mapPixInfo.height * 4;
  let x = 0;
  let y = 0;
  for (let i = 0; i < pixArrSize; i += 4) {
    const position: Point = [x * 32, y * 32];
    if (mapPixInfo.data[i] === 255) {
      output.chunks.push(
        new Chunk(
          new Sprite(
            output.textureChannels.r[
              MathUtil.randomInRangeInt(0, output.textureChannels.r.length - 1)
            ]
          ),
          'r',
          position
        )
      );
    } else if (mapPixInfo.data[i + 1] === 255) {
      output.chunks.push(
        new Chunk(
          new Sprite(
            output.textureChannels.b[
              MathUtil.randomInRangeInt(0, output.textureChannels.b.length - 1)
            ]
          ),
          'b',
          position
        )
      );
    } else if (mapPixInfo.data[i + 2] === 255) {
      output.chunks.push(
        new Chunk(
          new Sprite(
            output.textureChannels.g[
              MathUtil.randomInRangeInt(0, output.textureChannels.g.length - 1)
            ]
          ),
          'g',
          position
        )
      );
    }
    x++;
    if (x === mapPixInfo.width) {
      x = 0;
      y++;
    }
  }
  // for (let i = 0; i < output.chunks.length; i++) {
  //   const chunk = output.chunks[i];
  //   Layers[4].addChild(chunk.sprite);
  // }
  return output;
}

async function getPixelInfo(path: string): Promise<ImageData | null> {
  return await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
      } else {
        ctx.drawImage(img, 0, 0);
        resolve(ctx.getImageData(0, 0, img.width, img.height));
      }
    };
    img.src = path;
  });
}
