import { mount } from "svelte";
import App from "./migrated.svelte";
import "./migrated.css";
mount(App, { target: document.getElementById("app")! });
