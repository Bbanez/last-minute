use std::f32::consts::PI;

use serde::{Deserialize, Serialize};

use crate::GameState;

use super::{
    consts::{PI12, PI14, PI32, PI34, PI54, PI74},
    object::GameObject,
};

#[derive(Serialize, Deserialize, Debug)]
pub struct Player {
    pub hp: f32,
    pub speed: f32,
    pub angle: f32,
    motion: (f32, f32),
    pub obj: GameObject,
    map_size: (f32, f32),
}

impl Player {
    pub fn new(
        position: (f32, f32),
        size: (f32, f32),
        hp: f32,
        speed: f32,
        map_size: (f32, f32),
    ) -> Player {
        Player {
            hp,
            speed,
            angle: 0.0,
            motion: (0.0, 0.0),
            obj: GameObject::new(position, size),
            map_size,
        }
    }

    pub fn set_hp(&mut self, hp: f32) {
        self.hp = hp;
    }

    pub fn set_speed(&mut self, speed: f32) {
        self.speed = speed;
    }

    pub fn set_motion(&mut self, motion: (f32, f32)) {
        self.motion = motion;
        // Set angle
        if self.motion.0 == 1.0 && self.motion.1 == 0.0 {
            self.angle = 0.0;
        } else if self.motion.0 == 1.0 && self.motion.1 == 1.0 {
            self.angle = PI14;
        } else if self.motion.0 == 0.0 && self.motion.1 == 1.0 {
            self.angle = PI12;
        } else if self.motion.0 == -1.0 && self.motion.1 == 1.0 {
            self.angle = PI34;
        } else if self.motion.0 == -1.0 && self.motion.1 == 0.0 {
            self.angle = PI;
        } else if self.motion.0 == -1.0 && self.motion.1 == -1.0 {
            self.angle = PI54;
        } else if self.motion.0 == 0.0 && self.motion.1 == -1.0 {
            self.angle = PI32;
        } else if self.motion.0 == 1.0 && self.motion.1 == -1.0 {
            self.angle = PI74;
        }
    }

    pub fn calc_position(&mut self) {
        let old_position = self.obj.get_position();
        let position = (
            self.speed * self.angle.cos() * self.motion.0.abs() + old_position.0,
            self.speed * self.angle.sin() * self.motion.1.abs() + old_position.1,
        );
        let mut x = position.0;
        let mut y = position.1;
        if position.0 <= self.obj.size.0 / 2.0 {
            x = self.obj.size.0 / 2.0;
        } else if position.0 >= self.map_size.0 - self.obj.size.0 / 2.0 {
            x = self.map_size.0 - self.obj.size.0 / 2.0;
        }
        if position.1 <= self.obj.size.1 / 2.0 {
            y = self.obj.size.1 / 2.0;
        } else if position.1 >= self.map_size.1 - self.obj.size.1 / 2.0 {
            y = self.map_size.1 - self.obj.size.1 / 2.0;
        }
        self.obj.set_position((x, y))
    }
}

#[tauri::command]
pub fn player_load(
    state: tauri::State<GameState>,
    screen_width: f32,
    screen_height: f32,
    character_id: &str,
) -> Player {
    let mut state_guard = state.0.lock().unwrap();
    let mut player = Player::new(
        state_guard.player.obj.get_position(),
        state_guard.player.obj.size,
        state_guard.player.hp,
        state_guard.player.speed,
        state_guard.player.map_size,
    );
    {
        let char = state_guard.find_character(character_id);
        player.set_hp(char.hp as f32);
        player.set_speed(char.speed as f32);
    }
    player
        .obj
        .set_position((screen_width / 2.0, screen_height / 2.0));
    state_guard.player = player;
    Player::new(
        state_guard.player.obj.get_position(),
        state_guard.player.obj.size,
        state_guard.player.hp,
        state_guard.player.speed,
        state_guard.player.map_size,
    )
}

#[tauri::command]
pub fn player_motion(state: tauri::State<GameState>, m: (f32, f32)) {
    let mut state_guard = state.0.lock().unwrap();
    state_guard.player.set_motion(m);
}

#[tauri::command]
pub fn player_update(state: tauri::State<GameState>) -> Player {
    let mut state_guard = state.0.lock().unwrap();
    state_guard.player.calc_position();
    Player::new(
        state_guard.player.obj.get_position(),
        state_guard.player.obj.size,
        state_guard.player.hp,
        state_guard.player.speed,
        state_guard.player.map_size,
    )
}
