import { invoke, event } from '@tauri-apps/api';
import { defineComponent } from 'vue';

export const GameView = defineComponent({
  setup() {
    return () => (
      <div>
        <h1>Game</h1>
        <button
          onClick={async () => {
            await invoke('storage_set', { key: 'test', value: 'pera' });
            const res = await invoke('storage_get', { key: 'test' });
            console.log(res);
          }}
        >
          Click
        </button>
      </div>
    );
  },
});
