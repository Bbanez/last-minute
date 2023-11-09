import { Container, Graphics } from 'pixi.js';
import { Point } from '.';

export class BB {
  top = 0;
  right = 0;
  bottom = 0;
  left = 0;
  g: Graphics;

  constructor(public width: number, public height: number, position: Point) {
    this.g = new Graphics();
    this.updatePosition(position);
    this.g.beginFill(0xff0000, 0.5);
    this.g.drawRect(0, 0, this.width, this.height);
    this.g.endFill();
    this.g.pivot.set(0.5, 0.5);
  }

  updatePosition(position: Point) {
    this.top = position[1];
    this.right = position[0];
    this.bottom = position[1];
    this.left = position[0];
    this.g.position.set(this.left, this.top);
  }

  isInside(point: Point): boolean {
    return (
      point[0] > this.left &&
      point[0] < this.right &&
      point[1] > this.top &&
      point[1] < this.bottom
    );
  }

  show(container: Container) {
    container.addChild(this.g);
  }

  hide(container: Container) {
    container.removeChild(this.g);
  }
}
