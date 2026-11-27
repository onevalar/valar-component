import { mount } from "svelte";
import "./svelte.css";
import ColorPickerFixture from "./ColorPickerFixture.svelte";

const params = new URLSearchParams(location.search);
document.documentElement.classList.toggle("dark", params.get("theme") === "dark");
mount(ColorPickerFixture, { target: document.getElementById("app")! });
