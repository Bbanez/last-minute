use std::f32::consts::PI;

use super::{
    consts::{PI12, PI14, PI32, PI34, PI54, PI74},
    object::GameObject,
};

pub struct Player {
    pub hp: f32,
    pub speed: f32,
    angle: f32,
    motion: (f32, f32),
    pub obj: GameObject,
    map_size: (f32, f32),
}

impl Player {
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
