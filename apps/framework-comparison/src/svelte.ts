import { mount } from "svelte";
import "@fontsource-variable/geist";
import "./svelte.css";
import Demo from "./Demo.svelte";

document.documentElement.classList.toggle(
	"dark",
	new URLSearchParams(location.search).get("theme") === "dark"
);
mount(Demo, { target: document.getElementById("app")! });
