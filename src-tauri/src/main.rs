// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod com;
pub mod storage;

use com::{player, yo};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn test() {
    println!("Hello");
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            test,
            yo,
            player::player_position,
            storage::storage_get,
            storage::storage_set
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
