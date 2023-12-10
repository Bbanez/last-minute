// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;

use bcms::entry::lm_tile_set::{LmTileSetEntryMetaItem, LM_TILE_SET_META_ITEMS};

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
    tauri::Builder::default()
        .manage(
            GameState(Mutex::new(game::store::Store {
                tile_sets,
                characters,
                player: game::player::Player::new(
                    (100.0, 100.0),
                    (32.0, 80.0),
                    11.0,
                    8.0,
                    (3200.0, 3200.0),
                ),
            })), //     Store {
                 //     player: Player::new((100.0, 100.0), (32.0, 80.0), 11.0, 8.0, (3200.0, 3200.0)),
                 // }
        )
        .invoke_handler(tauri::generate_handler![
            storage::storage_get,
            storage::storage_set,
            game::player::player_load,
            game::player::player_motion,
            game::player::player_update
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
