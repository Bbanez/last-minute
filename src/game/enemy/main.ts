import { Container } from 'pixi.js';
import { BB, Point } from '../math';
import { Ticker } from '../ticker';

export class Enemy {
  container: Container;
  size: [number, number] = [32, 80];
  destination: Point;
  speed = 1;
  move = 0;
  angle = 0;
  bb: BB;

  private unsubs: Array<() => void> = [];

  constructor(public position: Point, public hp: number) {
    this.destination = [this.position[0], this.position[1]];
    this.container = new Container();
    this.container.pivot.set(0.5, 0.5);
    this.bb = new BB(32, 80, this.position);
    this.unsubs.push(
      Ticker.subscribe(() => {
        this.update();
      })
    );
  }

  update() {
    const dx = this.destination[0] - this.position[0];
    const absDx = Math.abs(dx);
    const dy = this.destination[1] - this.position[1];
    const absDy = Math.abs(dy);
    if (absDx <= 0.1 && absDy <= 0.1) {
      return;
    }
    let alpha = Math.atan(absDy / absDx);
    if (isNaN(alpha)) {
      alpha = 0;
    }
    const absAlpha = Math.abs(alpha);
    if (dx > 0 && dy < 0) {
      alpha = 2 * Math.PI - absAlpha;
    } else if (dx < 0 && dy < 0) {
      alpha = Math.PI + absAlpha;
    } else if (dx < 0 && dy > 0) {
      alpha = Math.PI - absAlpha;
    }
    this.position[0] = this.position[0] + this.speed * Math.cos(alpha);
    this.position[1] = this.position[1] + this.speed * Math.sin(alpha);
    this.container.position.set(...this.position);
    this.bb.updatePosition([this.position[0] - 16, this.position[1] - 40]);
  }
}
