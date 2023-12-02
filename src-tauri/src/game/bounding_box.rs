use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct BoundingBox {
    pub position: (f32, f32),
    pub size: (f32, f32),
    pub top: f32,
    pub right: f32,
    pub bottom: f32,
    pub left: f32,
}

impl BoundingBox {
    pub fn new(size: (f32, f32), position: (f32, f32)) -> BoundingBox {
        let mut bb = BoundingBox {
            size,
            position,
            top: 0.0,
            right: 0.0,
            bottom: 0.0,
            left: 0.0,
        };
        bb.update_position(position);
        bb
    }

    pub fn update_position(&mut self, position: (f32, f32)) {
        self.position = position;
        self.top = self.position.1 - self.size.1 / 2.0;
        self.right = self.position.0 + self.size.0 / 2.0;
        self.bottom = self.position.1 + self.size.1 / 2.0;
        self.left = self.position.0 - self.size.0 / 2.0;
    }

    pub fn is_inside(&mut self, point: (f32, f32)) -> bool {
        point.0 > self.left && point.0 < self.right && point.1 > self.top && point.1 < self.bottom
    }

    pub fn does_intersects_bb(&mut self, bb: BoundingBox) -> bool {
        self.is_inside((bb.left, bb.top))
            || self.is_inside((bb.right, bb.top))
            || self.is_inside((bb.right, bb.bottom))
            || self.is_inside((bb.left, bb.bottom))
    }
}
