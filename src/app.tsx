import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import { useScreen } from './screen';
import { GameView, Home } from './views';
import { Game } from './game';

export const app = defineComponent({
  setup() {
    const screen = useScreen();
    const el = ref<HTMLDivElement>(null as never);
    let game: Game;

    onMounted(async () => {
      game = new Game();
      await game.load(0);
      el.value.appendChild(game.app.view as HTMLCanvasElement);
    });

    onBeforeUnmount(() => {
      if (app) {
        game.destroy();
      }
    });

    function mountView() {
      switch (screen) {
        case 'home': {
          return <Home />;
        }
        case 'game': {
          return <GameView />;
        }
      }
    }

    return () => (
      <div class="root">
        <div ref={el} class="game" />;<div class="container">{mountView()}</div>
      </div>
    );
  },
});
