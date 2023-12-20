use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::{math::Math, object::GameObject};

#[derive(Serialize, Debug, Deserialize, Clone)]
pub struct Projectile {
    pub id: String,
    pub friendly: bool,
    pub range: f32,
    pub angle: f32,
    pub speed: f32,
    pub target: GameObject,
    pub obj: GameObject,
    pub at_target: bool,
}

impl Projectile {
    pub fn new(
        position: (f32, f32),
        target: (f32, f32),
        target_size: (f32, f32),
        size: (f32, f32),
        friendly: bool,
        range: f32,
        speed: f32,
    ) -> Projectile {
        let mut target_obj = GameObject::new(target, target_size);
        Projectile {
            id: Uuid::new_v4().to_string(),
            friendly,
            obj: GameObject::new(position, size),
            range,
            speed,
            angle: Math::get_angle(position, target_obj.get_position()),
            target: target_obj,
            at_target: false,
        }
    }

    pub fn update(&mut self) {
        if self.at_target == false {
            let position = self.obj.get_position();
            self.angle = Math::get_angle(position, self.target.get_position());
            self.obj.set_position((
                position.0 + self.speed * self.angle.cos(),
                position.1 + self.speed * self.angle.sin(),
            ));
            self.at_target = Math::are_points_near(
                self.obj.get_position(),
                self.target.get_position(),
                self.target.get_size(),
            );
        }
    }
}
