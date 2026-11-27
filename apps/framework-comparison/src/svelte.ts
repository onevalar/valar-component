import { mount } from "svelte";
import "@fontsource-variable/geist";
import "./svelte.css";
import Demo from "./Demo.svelte";

const params = new URLSearchParams(location.search);
document.documentElement.classList.toggle("dark", params.get("theme") === "dark");
const target = document.getElementById("app")!;
if (params.get("example") === "icon-picker") {
	document.documentElement.lang = "en";
	void import("./IconPickerExample.svelte").then(({ default: Example }) =>
		mount(Example, { target })
	);
} else {
	mount(Demo, { target });
}
