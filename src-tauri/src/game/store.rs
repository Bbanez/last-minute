use crate::bcms::entry::lm_enemy::LmEnemyEntryMetaItem;
use crate::bcms::entry::{
    lm_character::LmCharacterEntryMetaItem, lm_tile_set::LmTileSetEntryMetaItem,
};
use crate::game::enemy::Enemy;

use super::player::Player;
use super::projectile::Projectile;

#[derive(Debug)]
pub struct Store {
    pub player: Player,
    pub tile_sets: Vec<LmTileSetEntryMetaItem>,
    pub characters: Vec<LmCharacterEntryMetaItem>,
    pub enemies_data: Vec<LmEnemyEntryMetaItem>,
    pub enemies: Vec<Enemy>,
    pub projectiles: Vec<Projectile>,
}

impl Store {
    pub fn find_character(&mut self, character_id: &str) -> &LmCharacterEntryMetaItem {
        self.characters
            .iter()
            .find(|item| item.slug == character_id)
            .unwrap()
    }

    pub fn find_enemy_data(&mut self, enemy_data_id: &str) -> &LmEnemyEntryMetaItem {
        self.enemies_data
            .iter()
            .find(|item| item.slug == enemy_data_id)
            .unwrap()
    }

    pub fn find_enemy(&mut self, enemy_id: &str) -> Option<&Enemy> {
        self.enemies.iter().find(|item| item.id == enemy_id)
    }

    pub fn find_projectile(&mut self, projectile_id: String) -> Option<&Projectile> {
        for projectile in self.projectiles.iter() {
            if projectile.id == projectile_id {
                Some(projectile);
            }
        }
        None
    }
}
