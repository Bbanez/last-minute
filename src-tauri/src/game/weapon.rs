pub struct Weapon {
    pub id: String,
    attacking: bool,
    attack_speed: f32,
    attack_latch: bool,
    attack_ticks: u32,
    attack_duration_in_ticks: u32,
}

impl Weapon {
    pub fn new(id: String, attack_speed: f32) -> Weapon {
        Weapon {
            id,
            attacking: false,
            attack_latch: false,
            attack_ticks: 0,
            attack_speed,
            attack_duration_in_ticks: (60.0 * attack_speed) as u32,
        }
    }

    pub fn attack(&mut self) {
        self.attacking = true;
        self.attack_latch = false;
        self.attack_ticks = 0;
    }

    pub fn is_attacking(&mut self) -> bool {
        self.attacking
    }

    pub fn set_attack_speed(&mut self, attack_speed: f32) {
        self.attack_speed = attack_speed;
        self.attack_duration_in_ticks = (60.0 * attack_speed) as u32;
    }

    pub fn update(&mut self) {
        if self.attacking == true && self.attack_latch == false {
            self.attack_ticks = self.attack_ticks + 1;
            if self.attack_ticks == self.attack_duration_in_ticks {
                self.attack_latch = true;
            }
        }
    }
}
