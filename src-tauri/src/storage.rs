use std::{
    fs::File,
    io::{Error, ErrorKind, Read, Write},
    path::Path,
};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Storage {
    test: Option<String>,
}

fn get_storage_file() -> File {
    let file = File::create("storage.toml");
    let file = match file {
        Ok(f) => f,
        Err(e) => match e.kind() {
            ErrorKind::NotFound => match File::create("storage.toml") {
                Ok(f) => f,
                Err(e) => panic!("Failed to create a file {}", e),
            },
            other_error => {
                panic!("Problem with file {}", other_error)
            }
        },
    };
    file
}

fn read_storage() -> Storage {
    let mut file = get_storage_file();
    let mut content = String::new();
    match file.read_to_string(&mut content) {
        Ok(_) => {
            let storage: Storage = toml::from_str(&content).unwrap();
            storage
        }
        Err(e) => {
            println!("{}", e);
            let storage: Storage = toml::from_str("").unwrap();
            storage
        }
    }
}

fn write_storage(storage: Storage) -> () {
    let mut file = get_storage_file();
    let s = toml::to_string(&storage).unwrap();
    println!("{}", s);
    match file.write_all(s.as_bytes()) {
        Ok(r) => r,
        Err(e) => panic!("Failed to write file {}", e),
    }
}

#[tauri::command]
pub fn storage_get(key: &str) -> Option<String> {
    let storage = read_storage();
    if key == "test" {
        return storage.test;
    }
    None
}

#[tauri::command]
pub fn storage_set(key: &str, value: &str) {
    let mut storage = read_storage();
    if key == "test" {
        storage.test = Some(String::from(value));
        write_storage(storage);
    }
}
