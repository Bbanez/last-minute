use rand::Rng;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::GameState;

use super::{
    consts::PI,
    object::{BaseStats, GameObject},
};

#[derive(Serialize, Debug, Deserialize, Clone)]
pub struct Enemy {
    pub id: String,
    pub destination: (f32, f32),
    pub obj: GameObject,
    pub base_stats: BaseStats,
}

impl Enemy {
    pub fn new(position: (f32, f32), size: (f32, f32), base_stats: BaseStats) -> Enemy {
        Enemy {
            id: Uuid::new_v4().to_string(),
            destination: (position.0, position.1),
            obj: GameObject::new(position, size),
            base_stats,
        }
    }

    pub fn update(&mut self) {
        let position = self.obj.get_position();
        let dx = self.destination.0 - position.0;
        let dy = self.destination.1 - position.1;
        if dx.abs() <= 0.1 && dy.abs() <= 0.1 {
            return;
        }
        let mut alpha: f32 = 0.0;
        if dx.abs() > 0.0 {
            alpha = (dy.abs() / dx.abs()).atan();
        }
        if dx > 0.0 && dy < 0.0 {
            alpha = 2.0 * PI - alpha.abs();
        } else if dx < 0.0 && dy < 0.0 {
            alpha = PI + alpha.abs();
        } else if dx < 0.0 && dy > 0.0 {
            alpha = PI - alpha.abs();
        }
        self.obj.set_position((
            position.0 + self.base_stats.move_speed * alpha.cos(),
            position.1 + self.base_stats.move_speed * alpha.sin(),
        ));
    }
}

#[tauri::command]
pub fn enemy_create(
    state: tauri::State<GameState>,
    screen: (i32, i32),
    enemy_data_id: &str,
) -> Enemy {
    let mut state_guard = state.0.lock().unwrap();
    let enemy_data = state_guard.find_enemy_data(enemy_data_id);
    let top_or_bottom = rand::thread_rng().gen_range(0..1);
    let left_or_right = rand::thread_rng().gen_range(0..1);
    let x: f32;
    let y: f32;
    if top_or_bottom == 0 {
        x = rand::thread_rng().gen_range(-150.0..-50.0);
    } else {
        x = rand::thread_rng().gen_range((screen.0 as f32 + 50.0)..(screen.0 as f32 + 150.0));
    }
    if left_or_right == 0 {
        y = rand::thread_rng().gen_range(-150.0..-50.0);
    } else {
        y = rand::thread_rng().gen_range((screen.1 as f32 + 50.0)..(screen.1 as f32 + 150.0));
    }
    let enemy = Enemy::new(
        (x, y),
        (
            enemy_data.animations.idle.bb_width as f32,
            enemy_data.animations.idle.bb_height as f32,
        ),
        BaseStats::new(
            enemy_data.base_stats.hp as f32,
            enemy_data.base_stats.hp as f32,
            enemy_data.base_stats.damage as f32,
            enemy_data.base_stats.move_speed as f32,
            enemy_data.base_stats.attack_speed as f32,
            enemy_data.base_stats.armor as f32,
        ),
    );
    println!("{}, {}, {:?}", x, y, enemy);
    state_guard.enemies.push(enemy.clone());
    enemy
}
