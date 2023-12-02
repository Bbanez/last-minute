import { BaseTexture, Graphics, Rectangle, Sprite, Texture } from 'pixi.js';
import { Chunk } from './chunk';
import { Point } from './math';
import { bcms } from './bcms';
import { LmTileDataGroup } from '../types';
import { PI12, PI32 } from './consts';

export interface GameMap {
  width: number;
  height: number;
  // Width in pixels
  pWidth: number;
  // Height in pixels
  pHeight: number;
  chunks: Chunk[];
}

export async function createGameMap(name: string): Promise<GameMap> {
  const mapData = bcms.map.tileSet.find((e) => e.slug === name);
  if (!mapData) {
    throw Error(`Failed to find map data for "${name}"`);
  }
  const tiles = BaseTexture.from(mapData.tiles.src);
  const chunkInfo = await getPixelInfo(mapData.chunk_info.src);
  if (!chunkInfo) {
    throw Error(`Cannot load map info for "${name}"`);
  }
  const output: GameMap = {
    pWidth: chunkInfo.width * 32,
    pHeight: chunkInfo.height * 32,
    width: chunkInfo.width,
    height: chunkInfo.height,
    chunks: [],
  };
  for (let y = 0; y < output.height; y++) {
    for (let x = 0; x < output.width; x++) {
      if (chunkInfo.data[(x + output.height * y) * 4] > 250) {
        const D = mapData.chunks.find((e) => e.name === 'D') as LmTileDataGroup;
        const optionsIndex = 0;
        output.chunks.push(
          new Chunk(
            new Sprite(
              new Texture(
                tiles,
                new Rectangle(
                  D.options[optionsIndex].x * 32,
                  D.options[optionsIndex].y * 32,
                  32,
                  32
                )
              )
            ),
            `D${optionsIndex}`,
            [x * 32, y * 32]
          )
        );
      } else {
        if (x === 0 || y === 0 || x === output.width || y === output.height) {
          const A = mapData.chunks.find(
            (e) => e.name === 'A'
          ) as LmTileDataGroup;
          const optionsIndex = 0;
          output.chunks.push(
            new Chunk(
              new Sprite(
                new Texture(
                  tiles,
                  new Rectangle(
                    A.options[optionsIndex].x * 32,
                    A.options[optionsIndex].y * 32,
                    32,
                    32
                  )
                )
              ),
              `D${optionsIndex}`,
              [x * 32, y * 32]
            )
          );
        } else {
          const pixelsInfo = {
            tl: chunkInfo.data.slice(
              (x - 1 + output.height * (y - 1)) * 4,
              (x - 1 + output.height * (y - 1)) * 4 + 4
            ),
            tm: chunkInfo.data.slice(
              (x + output.height * (y - 1)) * 4,
              (x + output.height * (y - 1)) * 4 + 4
            ),
            tr: chunkInfo.data.slice(
              (x + 1 + output.height * (y - 1)) * 4,
              (x + 1 + output.height * (y - 1)) * 4 + 4
            ),
            ml: chunkInfo.data.slice(
              (x - 1 + output.height * y) * 4,
              (x - 1 + output.height * y) * 4 + 4
            ),
            mm: chunkInfo.data.slice(
              (x + output.height * y) * 4,
              (x + output.height * y) * 4 + 4
            ),
            mr: chunkInfo.data.slice(
              (x + 1 + output.height * y) * 4,
              (x + 1 + output.height * y) * 4 + 4
            ),
            bl: chunkInfo.data.slice(
              (x - 1 + output.height * (y + 1)) * 4,
              (x - 1 + output.height * (y + 1)) * 4 + 4
            ),
            bm: chunkInfo.data.slice(
              (x + output.height * (y + 1)) * 4,
              (x + output.height * (y + 1)) * 4 + 4
            ),
            br: chunkInfo.data.slice(
              (x + 1 + output.height * (y + 1)) * 4,
              (x + 1 + output.height * (y + 1)) * 4 + 4
            ),
          };
          let chunkName = '';
          let angle = 0;
          if (
            pixelsInfo.tl[1] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[1] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[1] === 255
          ) {
            chunkName = 'A';
          } else if (
            pixelsInfo.tl[1] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[1] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[1] === 255
          ) {
            chunkName = 'G';
          } else if (
            pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[1] === 255
          ) {
            chunkName = 'O';
            // angle = PI12;
          } else if (
            pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[0] === 255 &&
            pixelsInfo.br[1] === 255
          ) {
            chunkName = 'O';
            angle = PI12;
          } else if (
            pixelsInfo.tl[1] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[0] === 255
          ) {
            chunkName = 'O';
            angle = Math.PI;
          } else if (
            pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[1] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[0] === 255
          ) {
            chunkName = 'O';
            angle = PI32;
          } else if (
            pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[1] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[1] === 255
          ) {
            chunkName = 'G';
            angle = PI12;
          } else if (
            pixelsInfo.tl[1] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[1] === 255
          ) {
            chunkName = 'G';
            angle = Math.PI;
          } else if (
            pixelsInfo.tl[1] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[1] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[0] === 255
          ) {
            chunkName = 'G';
            angle = PI32;
          } else if (
            pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[0] === 255
          ) {
            chunkName = 'E';
          } else if (
            pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[1] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[1] === 255
          ) {
            chunkName = 'F';
            // angle = PI12;
          } else if (
            pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[1] === 255
          ) {
            chunkName = 'F';
            angle = PI12;
          } else if (
            pixelsInfo.tl[1] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[0] === 255
          ) {
            chunkName = 'F';
            angle = Math.PI;
          } else if (
            pixelsInfo.tl[1] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[1] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[0] === 255
          ) {
            chunkName = 'F';
            angle = PI32;
          } else if (
            pixelsInfo.tl[1] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[1] === 255
          ) {
            chunkName = 'H';
            // angle = PI12;
          } else if (
            pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[1] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[0] === 255
          ) {
            chunkName = 'F';
            angle = PI12;
          } else if (
            pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            // pixelsInfo.tr[1] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[0] === 255 &&
            pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[1] === 255
            // pixelsInfo.br[1] === 255
          ) {
            chunkName = 'I';
            // angle = PI12;
          } else if (
            pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            // pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[0] === 255
            // pixelsInfo.br[1] === 255
          ) {
            chunkName = 'I';
            angle = PI12;
          } else if (
            // pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[0] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            // pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[0] === 255
          ) {
            chunkName = 'I';
            angle = Math.PI;
          } else if (
            // pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[0] === 255 &&
            // pixelsInfo.tr[1] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[0] === 255
          ) {
            chunkName = 'I';
            angle = PI32;
          } else if (
            pixelsInfo.tl[1] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            // pixelsInfo.tr[1] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[0] === 255 &&
            pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[1] === 255
            // pixelsInfo.br[1] === 255
          ) {
            chunkName = 'N';
            // angle = PI12;
          } else if (
            pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[1] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            // pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[0] === 255
            // pixelsInfo.br[1] === 255
          ) {
            chunkName = 'N';
            angle = PI12;
          } else if (
            // pixelsInfo.tl[1] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[0] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            // pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[1] === 255
          ) {
            chunkName = 'N';
            angle = Math.PI;
          } else if (
            // pixelsInfo.tl[1] === 255 &&
            pixelsInfo.tm[0] === 255 &&
            // pixelsInfo.tr[1] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[0] === 255
          ) {
            chunkName = 'N';
            angle = PI32;
          } else if (
            // pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[0] === 255 &&
            pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[0] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[0] === 255
          ) {
            chunkName = 'M';
          } else if (
            pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[0] === 255 &&
            // pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[0] === 255 &&
            pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[0] === 255
          ) {
            chunkName = 'M';
            angle = PI12;
          } else if (
            pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[0] === 255 &&
            pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[0] === 255
            // pixelsInfo.br[0] === 255
          ) {
            chunkName = 'M';
            angle = Math.PI;
          } else if (
            pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[0] === 255 &&
            pixelsInfo.mr[0] === 255 &&
            // pixelsInfo.bl[0] === 255 &&
            pixelsInfo.bm[0] === 255 &&
            pixelsInfo.br[0] === 255
          ) {
            chunkName = 'M';
            angle = PI32;
          } else if (
            // pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[0] === 255 &&
            // pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[1] === 255
          ) {
            chunkName = 'B';
            // angle = PI32;
          } else if (
            pixelsInfo.tl[1] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            // pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[0] === 255 &&
            pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[1] === 255
            // pixelsInfo.br[0] === 255
          ) {
            chunkName = 'B';
            angle = PI12;
          } else if (
            pixelsInfo.tl[1] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[1] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            // pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[0] === 255
            // pixelsInfo.br[1] === 255
          ) {
            chunkName = 'B';
            angle = Math.PI;
          } else if (
            // pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[1] === 255 &&
            pixelsInfo.ml[0] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            // pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[1] === 255
          ) {
            chunkName = 'B';
            angle = PI32;
          } else if (
            // pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[0] === 255 &&
            // pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[0] === 255 &&
            pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[1] === 255
            // pixelsInfo.br[0] === 255
          ) {
            chunkName = 'C';
            // angle = PI32;
          } else if (
            pixelsInfo.tl[1] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            // pixelsInfo.tr[1] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[0] === 255 &&
            // pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[0] === 255
            // pixelsInfo.br[1] === 255
          ) {
            chunkName = 'C';
            angle = PI12;
          } else if (
            // pixelsInfo.tl[1] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            pixelsInfo.tr[1] === 255 &&
            pixelsInfo.ml[0] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            // pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[0] === 255
            // pixelsInfo.br[1] === 255
          ) {
            chunkName = 'C';
            angle = Math.PI;
          } else if (
            // pixelsInfo.tl[1] === 255 &&
            pixelsInfo.tm[0] === 255 &&
            // pixelsInfo.tr[1] === 255 &&
            pixelsInfo.ml[0] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            // pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[1] === 255 &&
            pixelsInfo.br[1] === 255
          ) {
            chunkName = 'C';
            angle = PI32;
          } else if (
            // pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[0] === 255 &&
            // pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[0] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[0] === 255 &&
            // pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[0] === 255
            // pixelsInfo.br[1] === 255
          ) {
            chunkName = 'J';
            // angle = PI32;
          } else if (
            // pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[0] === 255 &&
            // pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            // pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[0] === 255
            // pixelsInfo.br[1] === 255
          ) {
            chunkName = 'K';
            // angle = PI32;
          } else if (
            // pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            // pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[0] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[0] === 255 &&
            // pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[1] === 255
            // pixelsInfo.br[1] === 255
          ) {
            chunkName = 'K';
            angle = PI12;
          } else if (
            // pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[0] === 255 &&
            // pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[0] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[1] === 255 &&
            // pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[0] === 255
            // pixelsInfo.br[1] === 255
          ) {
            chunkName = 'L';
            // angle = PI12;
          } else if (
            // pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[0] === 255 &&
            // pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[0] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[0] === 255 &&
            // pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[1] === 255
            // pixelsInfo.br[1] === 255
          ) {
            chunkName = 'L';
            angle = PI12;
          } else if (
            // pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[0] === 255 &&
            // pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[1] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[0] === 255 &&
            // pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[0] === 255
            // pixelsInfo.br[1] === 255
          ) {
            chunkName = 'L';
            angle = Math.PI;
          } else if (
            // pixelsInfo.tl[0] === 255 &&
            pixelsInfo.tm[1] === 255 &&
            // pixelsInfo.tr[0] === 255 &&
            pixelsInfo.ml[0] === 255 &&
            pixelsInfo.mm[1] === 255 &&
            pixelsInfo.mr[0] === 255 &&
            // pixelsInfo.bl[1] === 255 &&
            pixelsInfo.bm[0] === 255
            // pixelsInfo.br[1] === 255
          ) {
            chunkName = 'L';
            angle = PI32;
          }
          const cInfo = mapData.chunks.find((e) => e.name === chunkName);
          if (cInfo) {
            const optionsIndex = 0;
            output.chunks.push(
              new Chunk(
                new Sprite(
                  new Texture(
                    tiles,
                    new Rectangle(
                      cInfo.options[optionsIndex].x * 32,
                      cInfo.options[optionsIndex].y * 32,
                      32,
                      32
                    )
                  )
                ),
                `${chunkName}${optionsIndex}`,
                [x * 32, y * 32],
                angle
              )
            );
          }
        }
      }
    }
  }
  return output;
  // const mapPixInfo = await getPixelInfo(`/game/map/${index}-map.png`);
  // if (!mapPixInfo) {
  //   throw Error(`Cannot load map pixel info for map ${index}`);
  // }
  // const groundTexture = BaseTexture.from(`/game/map/${index}-map.png`);
  // const output: GameMap = {
  //   pWidth: mapPixInfo.width,
  //   pHeight: mapPixInfo.height,
  //   width: mapPixInfo.width / 32,
  //   height: mapPixInfo.height / 32,
  //   chunks: [],
  // };
  // for (let x = 0; x < output.pWidth; x += 32) {
  //   for (let y = 0; y < output.pHeight; y += 32) {
  //     const position: Point = [x, y];
  //     output.chunks.push(
  //       new Chunk(
  //         new Sprite(new Texture(groundTexture, new Rectangle(x, y, 32, 32))),
  //         'r',
  //         position
  //       )
  //     );
  //   }
  // }
  // return output;
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
