use serde::{Serialize, Deserialize};

use super::bounding_box::BoundingBox;

#[derive(Serialize, Deserialize)]
pub struct GameObject {
    position: (f32, f32),
    pub size: (f32, f32),
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

    pub fn get_position(&mut self) -> (f32, f32) {
        self.position
    }

    pub fn set_position(&mut self, position: (f32, f32)) {
        self.position = position;
        self.bb.update_position(position);
    }
}
