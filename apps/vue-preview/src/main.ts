import { createApp, defineAsyncComponent, type Component } from "vue";
import "@fontsource-variable/geist";
import "./style.css";
import App from "./App.vue";
import PopoverExample from "./PopoverExample.vue";
import SeparatorExample from "./SeparatorExample.vue";
import { blockTemplate } from "../../block-template.js";

const query = new URLSearchParams(location.search);
document.documentElement.classList.toggle("dark", query.get("theme") === "dark");
const example = query.get("example");
const template = example && blockTemplate(example);
const composition = template || example?.startsWith("ai-") || example?.endsWith("-01");
const chinese = query.get("lang") === "zh";
if (composition) document.documentElement.lang = chinese ? "zh-CN" : "en";
const examples = import.meta.glob<Component>("./examples/*.vue", { import: "default" });
const templates = import.meta.glob<Component>("./blocks/*.vue", { import: "default" });
const loadTemplate = template && templates[`./blocks/${template}.vue`];
const loadExample = examples[`./examples/${example}.vue`];
const Preview = loadTemplate
	? defineAsyncComponent(loadTemplate)
	: template
		? { template: '<p role="alert">Template unavailable</p>' }
		: example === "popover"
			? PopoverExample
			: example === "separator"
				? SeparatorExample
				: loadExample
					? defineAsyncComponent(loadExample)
					: App;
createApp(
	Preview,
	composition
		? {
				chinese,
				...(template ? { block: example } : {}),
				...(example === "projects-01" || example === "inbox-01"
					? { empty: query.get("scenario") === "empty" }
					: {}),
				...(example === "projects-01" ? { singleTeam: query.get("scenario") === "single" } : {}),
			}
		: undefined
).mount("#app");
