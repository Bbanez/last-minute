import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import { Link } from '../components';
import { Game } from '../game';

export const GameView = defineComponent({
  setup() {
    const el = ref<HTMLDivElement>(null as never);
    let game: Game;

    onMounted(async () => {
      game = new Game();
      await game.load(0);
      el.value.appendChild(game.app.view as HTMLCanvasElement);
    });

    onUnmounted(() => {
      if (game) {
        game.destroy();
      }
    });

    return () => (
      <div>
        <h1>Game</h1>
        <Link href="home">Go to Home</Link>
        <div class="absolute top-0 left-0 w-full h-full -z-10" ref={el} />
      </div>
    );
  },
});
