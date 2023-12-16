// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;

use bcms::entry::{
    lm_enemy::{LmEnemyEntryMetaItem, LM_ENEMY_META_ITEMS},
    lm_tile_set::{LmTileSetEntryMetaItem, LM_TILE_SET_META_ITEMS},
};
use game::object::{BaseStats, CharacterStats};

use crate::bcms::entry::lm_character::{LmCharacterEntryMetaItem, LM_CHARACTER_META_ITEMS};

pub mod bcms;
pub mod game;
pub mod storage;

pub struct GameState(pub Mutex<game::store::Store>);

fn main() {
    let tile_sets: Vec<LmTileSetEntryMetaItem> =
        serde_json::from_str(LM_TILE_SET_META_ITEMS).unwrap();
    let characters: Vec<LmCharacterEntryMetaItem> =
        serde_json::from_str(LM_CHARACTER_META_ITEMS).unwrap();
    let enemies_data: Vec<LmEnemyEntryMetaItem> =
        serde_json::from_str(LM_ENEMY_META_ITEMS).unwrap();
    tauri::Builder::default()
        .manage(GameState(Mutex::new(game::store::Store {
            tile_sets,
            characters,
            enemies_data,
            enemies: vec![],
            player: game::player::Player::new(
                (100.0, 100.0),
                (32.0, 80.0),
                (3200.0, 3200.0),
                BaseStats::new(1.0, 1.0, 1.0, 1.0, 1.0, 0.0),
                CharacterStats::new(0.0, 32.0, 0.0, 0.0, 0.0),
            ),
        })))
        .invoke_handler(tauri::generate_handler![
            storage::storage_get,
            storage::storage_set,
            game::player::player_load,
            game::player::player_motion,
            game::player::player_get,
            game::on_tick::on_tick,
            game::enemy::enemy_create,
            game::enemy::enemy_get,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
