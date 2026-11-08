import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [svelte({ configFile: false }), tailwindcss()],
	// pnpm peer variants can otherwise give Chart and its SDK tooltip separate
	// context singletons even at the same LayerChart version.
	resolve: { dedupe: ["svelte", "layerchart"] },
	build: {
		rolldownOptions: {
			input: {
				comparison: fileURLToPath(new URL("./index.html", import.meta.url)),
				svelte: fileURLToPath(new URL("./svelte.html", import.meta.url)),
			},
		},
	},
});
