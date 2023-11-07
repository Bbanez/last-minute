// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod com;
pub mod storage;

use com::{player, yo};
use std::time::{SystemTime, UNIX_EPOCH};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    let time_offset = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis();
    let mut count = 0;
    for i in 1..1000000000 {
        count = i;
    }
    let tte = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis()
        - time_offset;
    println!("{}, {}", tte, count);
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            yo,
            player::player_position,
            storage::storage_get,
            storage::storage_set
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
