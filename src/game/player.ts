import {
  AnimatedSprite,
  BLEND_MODES,
  BaseTexture,
  Container,
  Rectangle,
  Sprite,
  Texture,
} from 'pixi.js';
import { Keyboard, KeyboardEventType, KeyboardState } from './keyboard';
import { Ticker } from './ticker';
import { invoke } from '@tauri-apps/api';
import { RustPlayer } from './rust';
import { LmCharacterEntryMeta } from '../types';
import { bcms } from './bcms';

export async function createPlayer(characterId: string): Promise<Player> {
  const character = bcms.characters.find((e) => e.slug === characterId);
  if (!character) {
    throw Error(`Failed to find character "${characterId}"`);
  }
  return new Player(
    await invoke<RustPlayer>('player_load', {
      characterId: 'demo',
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
    }),
    character
  );
}

export class Player {
  container: Container;
  light: Sprite;

  private unsubs: Array<() => void> = [];

  constructor(public rust: RustPlayer, public character: LmCharacterEntryMeta) {
    this.light = Sprite.from('/game/map/p-light.png');
    this.light.blendMode = BLEND_MODES.ADD;
    this.light.pivot.set(250, 250);
    this.container = new Container();
    this.container.addChild(this.light);
    this.unsubs.push(
      Ticker.subscribe(async () => {
        await this.update();
      }),
      Keyboard.subscribe(KeyboardEventType.KEY_DOWN, async (state) => {
        await this.setMove(state);
      }),
      Keyboard.subscribe(KeyboardEventType.KEY_UP, async (state) => {
        await this.setMove(state);
      })
    );

    const idleBaseTexture = BaseTexture.from(
      character.animations.idle.sheet.src
    );
    const frameCount =
      character.animations.idle.sheet.width / character.animations.idle.width;
    const idleFrames: Texture[] = [];
    for (let i = 0; i < frameCount; i++) {
      idleFrames.push(
        new Texture(
          idleBaseTexture,
          new Rectangle(
            i * character.animations.idle.width,
            0,
            character.animations.idle.width,
            character.animations.idle.height
          )
        )
      );
    }
    const idleAnim = new AnimatedSprite(idleFrames);
    idleAnim.play();
    idleAnim.pivot.set(
      character.animations.idle.width / 2,
      character.animations.idle.height / 2
    );
    idleAnim.animationSpeed = 0.25;
    this.container.addChild(idleAnim);
  }

  async setMove(state: KeyboardState) {
    const move: [number, number] = [0, 0];
    if (state.w) {
      move[1] = -1;
    } else if (state.s) {
      move[1] = 1;
    } else {
      move[1] = 0;
    }
    if (state.a) {
      move[0] = -1;
    } else if (state.d) {
      move[0] = 1;
    } else {
      move[0] = 0;
    }
    await invoke('player_motion', { m: move });
  }

  async update() {
    this.rust = await invoke<RustPlayer>('player_get');
  }

  destroy() {
    this.container.removeChildren(0, this.container.children.length);
    this.unsubs.forEach((e) => e());
  }
}
