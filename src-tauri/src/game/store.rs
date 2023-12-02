use super::player::Player;

pub struct Store<'a> {
    pub player: Option<&'a mut Player>,
}

pub const STORE: Store = Store {
    player: None,
};
