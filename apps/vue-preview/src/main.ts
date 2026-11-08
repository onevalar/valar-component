import { createApp } from "vue";
import "@fontsource-variable/geist";
import "./style.css";
import App from "./App.vue";

const query = new URLSearchParams(location.search);
document.documentElement.classList.toggle("dark", query.get("theme") === "dark");
createApp(App).mount("#app");
