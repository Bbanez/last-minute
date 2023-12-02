// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use game::player::Player;

pub mod game;
pub mod storage;

fn main() {
    let mut player = Player::new(
        (100.0, 100.0),
        (32.0, 80.0),
        10.0,
        4.0,
        (3200.0, 3200.0),
    );
    let a = Some(&mut player);
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            storage::storage_get,
            storage::storage_set
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
