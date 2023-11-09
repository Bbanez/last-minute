import { BaseTexture, Rectangle, Sprite, Texture } from 'pixi.js';
import { Chunk } from './chunk';
import { Point } from './math';

export interface GameMap {
  width: number;
  height: number;
  // Width in pixels
  pWidth: number;
  // Height in pixels
  pHeight: number;
  chunks: Chunk[];
}

export async function createGameMap(index: number): Promise<GameMap> {
  const mapPixInfo = await getPixelInfo(`/game/map/${index}-map.png`);
  if (!mapPixInfo) {
    throw Error(`Cannot load map pixel info for map ${index}`);
  }
  const groundTexture = BaseTexture.from(`/game/map/${index}-map.png`);
  const output: GameMap = {
    pWidth: mapPixInfo.width,
    pHeight: mapPixInfo.height,
    width: mapPixInfo.width / 32,
    height: mapPixInfo.height / 32,
    chunks: [],
  };
  for (let x = 0; x < output.pWidth; x += 32) {
    for (let y = 0; y < output.pHeight; y += 32) {
      const position: Point = [x, y];
      output.chunks.push(
        new Chunk(
          new Sprite(new Texture(groundTexture, new Rectangle(x, y, 32, 32))),
          'r',
          position
        )
      );
    }
  }
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
