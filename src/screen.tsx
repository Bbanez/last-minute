import { ref } from 'vue';

export type Screens = 'home' | 'game';

const screen = ref<Screens>('game');

export function useScreen() {
  return screen.value;
}

export function setScreen(s: Screens) {
  screen.value = s;
}
