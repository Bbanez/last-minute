use crate::bcms::entry::{
    lm_character::LmCharacterEntryMetaItem, lm_tile_set::LmTileSetEntryMetaItem,
};

use super::player::Player;

#[derive(Debug)]
pub struct Store {
    pub player: Player,
    pub tile_sets: Vec<LmTileSetEntryMetaItem>,
    pub characters: Vec<LmCharacterEntryMetaItem>,
}
impl Store {
    pub fn find_character(&mut self, character_id: &str) -> &LmCharacterEntryMetaItem {
        self.characters
            .iter()
            .find(|item| item.slug == character_id)
            .unwrap()
    }
}
