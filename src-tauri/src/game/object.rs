use serde::{Deserialize, Serialize};

use super::bounding_box::BoundingBox;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GameObject {
    position: (f32, f32),
    size: (f32, f32),
    pub bb: BoundingBox,
}

impl GameObject {
    pub fn new(position: (f32, f32), size: (f32, f32)) -> GameObject {
        GameObject {
            position,
            size,
            bb: BoundingBox::new(size, position),
        }
    }

    pub fn set_position(&mut self, position: (f32, f32)) {
        self.position = position;
        self.bb.set_position(position);
    }

    pub fn get_position(&mut self) -> (f32, f32) {
        self.position
    }

    pub fn set_size(&mut self, size: (f32, f32)) {
        self.size = size;
        self.bb.set_size(self.size.0, self.size.1);
    }

    pub fn get_size(&mut self) -> (f32, f32) {
        self.size
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct BaseStats {
    pub max_hp: f32,
    pub hp: f32,
    pub damage: f32,
    pub move_speed: f32,
    pub attack_speed: f32,
    pub armor: f32,
}

impl BaseStats {
    pub fn new(
        max_hp: f32,
        hp: f32,
        damage: f32,
        move_speed: f32,
        attack_speed: f32,
        armor: f32,
    ) -> BaseStats {
        BaseStats {
            max_hp,
            hp,
            damage,
            move_speed,
            attack_speed,
            armor,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CharacterStats {
    pub recovery: f32,
    pub magnet: f32,
    pub growth: f32,
    pub greed: f32,
    pub curse: f32,
}

impl CharacterStats {
    pub fn new(recovery: f32, magnet: f32, growth: f32, greed: f32, curse: f32) -> CharacterStats {
        CharacterStats {
            recovery,
            magnet,
            growth,
            greed,
            curse,
        }
    }
}
