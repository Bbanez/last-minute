import {
  AnimatedSprite,
  BaseTexture,
  Container,
  Rectangle,
  Texture,
} from 'pixi.js';
import { Ticker } from './ticker';
import { RustEnemy } from './rust';
import { LmAnimationGroup, LmEnemyEntryMeta } from '../types';
import { invoke } from '@tauri-apps/api';
import { bcms } from './bcms';
import { PI12, PI32, PI_2 } from './consts';

export async function createEnemy(
  enemyDataId: string,
  onDestroy: () => void
): Promise<Enemy> {
  const enemyData = bcms.enemiesData.find((e) => e.slug === enemyDataId);
  if (!enemyData) {
    throw Error(`Enemy data for "${enemyDataId}" does not exist`);
  }
  return new Enemy(
    await invoke<RustEnemy>('enemy_create', {
      screen: [window.innerWidth, window.innerHeight],
      enemyDataId,
    }),
    enemyData,
    onDestroy
  );
}

export class Enemy {
  dead = false;
  container: Container;
  anims: {
    idle: {
      anim: AnimatedSprite;
    };
  } = {
    idle: {} as never,
  };

  private unsubs: Array<() => void> = [];

  constructor(
    public rust: RustEnemy,
    public enemy_data: LmEnemyEntryMeta,
    public onDestroy: () => void
  ) {
    this.container = new Container();
    this.container.pivot.set(0.5, 0.5);
    for (const k in enemy_data.animations) {
      const key = k as keyof LmAnimationGroup;
      const data = enemy_data.animations[key];
      const baseTexture = BaseTexture.from(data.sheet.src);
      const frameCount = data.sheet.width / data.width;
      const frames: Texture[] = [];
      for (let i = 0; i < frameCount; i++) {
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
    this.container.position.set(...this.rust.obj.position);
    this.unsubs.push(
      Ticker.subscribe(() => {
        this.update();
      })
    );
  }

  destroy() {
    this.unsubs.forEach(e => e());
    this.unsubs = [];
  }

  async update() {
    if (this.dead === false) {
      const rust = await invoke<RustEnemy | null>('enemy_get', {
        enemyId: this.rust.id,
      });
      if (rust) {
        this.rust = rust;
        if (
          (this.rust.alpha > PI32 && this.rust.alpha <= PI_2) ||
          (this.rust.alpha >= 0 && this.rust.alpha < PI12)
        ) {
          this.container.scale.set(-1, 1);
        } else {
          this.container.scale.set(1, 1);
        }
        this.container.position.set(...this.rust.obj.position);
      } else {
        this.dead = true;
        this.onDestroy();
      }
    }
  }
}
