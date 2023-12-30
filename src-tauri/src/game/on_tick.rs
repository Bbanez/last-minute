use crate::GameState;

#[tauri::command]
pub fn on_tick(state: tauri::State<GameState>) {
    let mut state_guard = state.0.lock().unwrap();
    state_guard.player.on_tick();
    let mut i = 0;
    while i < state_guard.enemies.len() {
        if state_guard.enemies[i].base_stats.hp <= 0.0 {
            state_guard.enemies.remove(i);
        } else {
            state_guard.enemies[i].destination = state_guard.player.obj.get_position();
            state_guard.enemies[i].update();
            i += 1;
        }
    }
}
