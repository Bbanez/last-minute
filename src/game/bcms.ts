import {
  LmCharacterEntryMeta,
  LmEnemyEntryMeta,
  LmTileSetEntryMeta,
} from '../types';

export interface BCMS {
  tileSet: LmTileSetEntryMeta[];
  characters: LmCharacterEntryMeta[];
  enemiesData: LmEnemyEntryMeta[];
}

export const bcms: BCMS = {
  tileSet: [],
  characters: [],
  enemiesData: [],
};

export async function loadBcmsData() {
  const items: Array<{
    key: keyof BCMS;
    name: string;
  }> = [
    {
      key: 'tileSet',
      name: 'lm_tile_set.json',
    },
    {
      key: 'characters',
      name: 'lm_character.json',
    },
    {
      key: 'enemiesData',
      name: 'lm_enemy.json',
    },
  ];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const res = await fetch(`/bcms/content/${item.name}`);
    const data = await res.json();
    bcms[item.key] = (data as any[]).map((e) => e.meta.en);
  }
}
