// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;

pub mod game;
pub mod storage;

pub struct GameState(pub Mutex<game::store::Store>);

fn main() {
    tauri::Builder::default()
        .manage(
            GameState(Mutex::new(game::store::Store {
                player: game::player::Player::new((100.0, 100.0), (32.0, 80.0), 11.0, 8.0, (3200.0, 3200.0)),
            })), //     Store {
                 //     player: Player::new((100.0, 100.0), (32.0, 80.0), 11.0, 8.0, (3200.0, 3200.0)),
                 // }
        )
        .invoke_handler(tauri::generate_handler![
            storage::storage_get,
            storage::storage_set,
            game::player::player_load,
            game::player::player_motion,
            game::player::player_get_position
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
