import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import { globalRegister } from "@/global";

import App from "./App.vue";
import router from "./router";
// import './assets/dict-gui.css'
import "./assets/style.css";
import { useConfigStore } from "@/stores/configStore";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.use(globalRegister);
app.use(pinia);
app.use(router);

// Load config via shared utility (browser)
const configStore = useConfigStore();
configStore.loadConfig().then(() => {
  app.mount("#app");
});
