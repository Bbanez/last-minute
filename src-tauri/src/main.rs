// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    fs::File,
    path::Path, io::Error,
};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// #[tauri::command]
// fn storage_write(data: &str) -> Result<String, Error> {
//     let mut file: File;
//     if Path::new("db.txt").exists() {
//         let res = File::open("db.txt");
//         file = match res {
//             Ok(f) => f,
//             Err(e) => return Err(e),
//         };
//     } else {
//         let res = File::create("db.txt");
//         file = match res {
//             Ok(f) => f,
//             Err(e) => return Err(e),
//         };
//     }
//     file.write_all(data.as_bytes());
//     String::from("Ok")
// }

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        // .invoke_handler(tauri::generate_handler![storage_write])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
