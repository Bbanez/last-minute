import { computed, defineComponent } from 'vue';
import { useDb } from '../db';
import { Link } from '../components';

export const AccountView = defineComponent({
  setup() {
    const db = useDb();
    const account = computed(() => db.accounts.methods.latest());
    console.log(account.value);

    return () => (
      <div class="flex flex-col">
        <div>
          <Link href="home">Back</Link>
        </div>
        <div>
          <Link href="game">Start Game</Link>
        </div>
      </div>
    );
  },
});
