import { mount } from "svelte";
import "@fontsource-variable/geist";
import "./svelte.css";
import Comparison from "./Comparison.svelte";

mount(Comparison, { target: document.getElementById("app")! });
