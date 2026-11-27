import * as React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/geist/index.css";
import "./style.css";
import PopoverExample from "./PopoverExample.tsx";
import SeparatorExample from "./SeparatorExample.tsx";
import { App } from "./App.tsx";
import { blockTemplate } from "../../block-template.ts";

const params = new URLSearchParams(window.location.search);
document.documentElement.classList.toggle("dark", params.get("theme") === "dark");
const example = params.get("example");
const chinese = params.get("lang") === "zh";
const template = example && blockTemplate(example);
if (template || example?.startsWith("ai-") || example?.endsWith("-01")) {
	document.documentElement.lang = chinese ? "zh-CN" : "en";
}
const examples = import.meta.glob<
	React.ComponentType<{
		chinese?: boolean;
		empty?: boolean;
		singleTeam?: boolean;
	}>
>("./examples/*.tsx", {
	import: "default",
});
const templates = import.meta.glob<React.ComponentType<{ block: string; chinese?: boolean }>>(
	"./blocks/*.tsx",
	{ import: "default" }
);
const loadExample = examples[`./examples/${example}.tsx`];
const Preview =
	example === "popover" ? PopoverExample : example === "separator" ? SeparatorExample : App;

async function mount() {
	const Template = template ? await templates[`./blocks/${template}.tsx`]?.() : undefined;
	const Fixture = !template && loadExample && (await loadExample());
	createRoot(document.getElementById("root")!).render(
		<React.StrictMode>
			{Template && example ? (
				<Template block={example} chinese={chinese} />
			) : template ? (
				<p role="alert">Template unavailable</p>
			) : Fixture ? (
				<Fixture
					chinese={chinese}
					empty={params.get("scenario") === "empty"}
					singleTeam={params.get("scenario") === "single"}
				/>
			) : (
				<Preview disabled={params.get("disabled") === "1"} />
			)}
		</React.StrictMode>
	);
}

void mount();
