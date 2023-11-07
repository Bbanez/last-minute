#[tauri::command]
pub fn yo() -> String {
    format!("yo 1")
}

pub mod player;
