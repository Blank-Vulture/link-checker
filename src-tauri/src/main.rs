// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
// use tauri::Manager;
use tauri_plugin_cors_fetch;
use tauri_plugin_dialog;
use tauri_plugin_fs;

use std::env;

#[tauri::command]
fn current_exe_dir() -> String {
    let path = env::current_exe()
        .unwrap_or_else(|_| std::path::PathBuf::from("."))
        .parent()
        .unwrap()
        .to_path_buf();
    path.to_string_lossy().into_owned()
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_cors_fetch::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![current_exe_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}