import { createApp } from "vue";
import "./styles/_main.scss";
import { app } from "./app";

(window as any).tauri_tick = () => {
  console.log('From tauri')
}

createApp(app).mount("#app");
