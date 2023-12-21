import {
  AnimatedSprite,
  Application,
  BLEND_MODES,
  BaseTexture,
  Container,
  Filter,
  Rectangle,
  Sprite,
  Texture,
} from 'pixi.js';
import { Keyboard, KeyboardEventType, KeyboardState } from './keyboard';
import { Ticker } from './ticker';
import { invoke } from '@tauri-apps/api';
import { RustPlayer } from './rust';
import { LmAnimationGroup, LmCharacterEntryMeta } from '../types';
import { bcms } from './bcms';
import { PI12, PI32, PI_2 } from './consts';
import { Layers } from './layers';
import demoFrag from './shaders/demo.frag';
import demoVert from './shaders/demo.vert';

export async function createPlayer(
  app: Application,
  characterId: string
): Promise<Player> {
  const character = bcms.characters.find((e) => e.slug === characterId);
  if (!character) {
    throw Error(`Failed to find character "${characterId}"`);
  }
  return new Player(
    app,
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
  anims: {
    idle: {
      anim: AnimatedSprite;
    };
  } = {
    idle: {} as never,
  };

  private unsubs: Array<() => void> = [];

  constructor(
    private app: Application,
    public rust: RustPlayer,
    public character: LmCharacterEntryMeta
  ) {
    this.light = Sprite.from('/game/map/p-light.png');
    this.light.blendMode = BLEND_MODES.ADD;
    this.light.pivot.set(250, 250);
    this.container = new Container();
    // this.container.addChild(this.light);
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

    for (const k in character.animations) {
      const key = k as keyof LmAnimationGroup;
      const data = character.animations[key];
      const baseTexture = BaseTexture.from(data.sheet.src);
      const frameCount = data.sheet.width / data.width;
      const frames: Texture[] = [];
      for (let i = 0; i < frameCount; i++) {
        if (i === 0) {
          const t = Sprite.from(
            new Texture(
              baseTexture,
              new Rectangle(
                i * data.bb_width + 32,
                32,
                data.bb_width,
                data.bb_height
              )
            )
          );
          const uniforms = {
            x: 0,
            y: 0,
            uSampler2: Texture.from('/game/s-test.png'),
          };
          t.position.set(50, 250);
          t.filters = [new Filter(demoVert, demoFrag, uniforms)];
          Layers[1].addChild(t);
          this.unsubs.push(
            Ticker.subscribe((time) => {
              uniforms.x = Math.abs(Math.cos(time / 1000));
              uniforms.y = Math.abs(Math.sin(time / 1000));
            })
          );
        }
        frames.push(
          new Texture(
            baseTexture,
            new Rectangle(i * data.width, 0, data.width, data.height)
          )
        );
      }
      this.anims[key].anim = new AnimatedSprite(frames);
      this.anims[key].anim.pivot.set(data.width / 2, data.height / 2);
      this.anims[key].anim.animationSpeed = 0.25;
    }
    this.anims.idle.anim.play();
    this.container.addChild(this.anims.idle.anim);
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
    if (
      (this.rust.angle > PI32 + 0.1 && this.rust.angle <= PI_2) ||
      (this.rust.angle >= 0 && this.rust.angle < PI12 - 0.1)
    ) {
      this.container.scale.set(-1, 1);
    } else if (this.rust.angle > PI12 && this.rust.angle < PI32) {
      this.container.scale.set(1, 1);
    }
  }

  destroy() {
    this.container.removeChildren(0, this.container.children.length);
    this.unsubs.forEach((e) => e());
  }
}
