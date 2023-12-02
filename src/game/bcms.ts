import { LmTileSetEntryMeta } from '../types';

export interface MapData {
  tileSet: LmTileSetEntryMeta[];
}

export const bcms: {
  map: MapData;
} = {
  map: {
    tileSet: [],
  },
};

export async function loadBcmsData() {
  const items: Array<{
    key: keyof MapData;
    name: string;
  }> = [
    {
      key: 'tileSet',
      name: 'lm_tile_set.json',
    },
  ];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const res = await fetch(`/bcms/content/${item.name}`);
    const data = await res.json();
    bcms.map[item.key] = (data as any[]).map(e => e.meta.en);
  }
}
