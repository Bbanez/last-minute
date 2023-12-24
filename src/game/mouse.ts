import { v4 as uuidv4 } from 'uuid';

export interface MouseState {
  left: boolean;
  middle: boolean;
  right: boolean;
  x: number;
  y: number;
  delta: {
    x: number;
    y: number;
  };
}

// eslint-disable-next-line no-shadow
export enum MouseEventType {
  MOUSE_DOWN = 'MOUSE_DOWN',
  MOUSE_UP = 'MOUSE_UP',
  MOUSE_MOVE = 'MOUSE_MOVE',
  ALL = 'ALL',
}

export interface MouseEventCallback {
  (state: MouseState, event: MouseEvent): Promise<void>;
}

export interface MouseSubscription {
  id: string;
  callback: MouseEventCallback;
}

export interface MouseUnsubscribe {
  (): void;
}

export class Mouse {
  static state: MouseState = {
    left: false,
    middle: false,
    right: false,
    x: 0,
    y: 0,
    delta: {
      x: 0,
      y: 0,
    },
  };
  private static subs: {
    [MouseEventType.ALL]: Array<MouseSubscription>;
    [MouseEventType.MOUSE_DOWN]: Array<MouseSubscription>;
    [MouseEventType.MOUSE_MOVE]: Array<MouseSubscription>;
    [MouseEventType.MOUSE_UP]: Array<MouseSubscription>;
  } = {
    [MouseEventType.ALL]: [],
    [MouseEventType.MOUSE_DOWN]: [],
    [MouseEventType.MOUSE_MOVE]: [],
    [MouseEventType.MOUSE_UP]: [],
  };

  private static async trigger(type: MouseEventType, event: MouseEvent) {
    for (let i = 0; i < Mouse.subs[type].length; i++) {
      const sub = Mouse.subs[type][i];
      await sub.callback(Mouse.state, event);
    }
    for (let i = 0; i < Mouse.subs[MouseEventType.ALL].length; i++) {
      const sub = Mouse.subs[MouseEventType.ALL][i];
      await sub.callback(Mouse.state, event);
    }
  }

  private static async onMouseDown(event: MouseEvent) {
    if (event.button === 0) {
      if (!Mouse.state.left) {
        Mouse.state.left = true;
        await Mouse.trigger(MouseEventType.MOUSE_DOWN, event);
      }
    } else if (event.button === 1) {
      if (!Mouse.state.middle) {
        Mouse.state.middle = true;
        await Mouse.trigger(MouseEventType.MOUSE_DOWN, event);
      }
    } else if (event.button === 2) {
      if (!Mouse.state.right) {
        Mouse.state.right = true;
        await Mouse.trigger(MouseEventType.MOUSE_DOWN, event);
      }
    }
  }

  private static async onMouseUp(event: MouseEvent) {
    if (event.button === 0) {
      if (Mouse.state.left) {
        Mouse.state.left = false;
        await Mouse.trigger(MouseEventType.MOUSE_UP, event);
      }
    } else if (event.button === 1) {
      if (Mouse.state.middle) {
        Mouse.state.middle = false;
        await Mouse.trigger(MouseEventType.MOUSE_UP, event);
      }
    } else if (event.button === 2) {
      if (Mouse.state.right) {
        Mouse.state.right = false;
        await Mouse.trigger(MouseEventType.MOUSE_UP, event);
      }
    }
  }

  private static async onMouseMove(event: MouseEvent) {
    Mouse.state.delta.x = event.clientX - Mouse.state.x;
    Mouse.state.delta.y = event.clientY - Mouse.state.y;
    Mouse.state.x = event.clientX;
    Mouse.state.y = event.clientY;
    await Mouse.trigger(MouseEventType.MOUSE_MOVE, event);
  }

  // private static onContext(event: MouseEvent) {
  //   event.preventDefault();
  // }

  static init() {
    window.addEventListener('mousedown', Mouse.onMouseDown);
    window.addEventListener('mouseup', Mouse.onMouseUp);
    window.addEventListener('mousemove', Mouse.onMouseMove);
    // window.addEventListener('contextmenu', Mouse.onContext);
  }
  static destroy() {
    window.removeEventListener('mousedown', Mouse.onMouseDown);
    window.removeEventListener('mouseup', Mouse.onMouseUp);
    window.removeEventListener('mousemove', Mouse.onMouseMove);
    // window.removeEventListener('contextmenu', Mouse.onContext);
  }
  static subscribe(
    type: MouseEventType,
    callback: MouseEventCallback
  ): () => void {
    const id = uuidv4();
    Mouse.subs[type].push({ id, callback });

    return () => {
      for (let i = 0; i < Mouse.subs[type].length; i++) {
        const sub = Mouse.subs[type][i];
        if (sub.id === id) {
          Mouse.subs[type].splice(i, 1);
        }
      }
    };
  }
}
