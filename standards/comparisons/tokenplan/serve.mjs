import path from "node:path";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, "../../..");
const source = path.resolve(
	process.env.TOKENPLAN_SOURCE ?? path.join(root, "../token-plan/platforms/tauri")
);
const revision = "c588b28cc1a19a1bdd5964db5c791e2ec66d5ec4";
const baseline = path.join(root, ".amp/in/tokenplan-source", revision);
// Exact free-MIT inputs only. Never extract an Arc directory or the Pro tick-ring.
const freeInputs = [
	"DitherFill.tsx",
	"components/arc/foundation.css",
	"components/arc/motion-tokens.ts",
	"components/arc/lib/motion-tokens.ts",
	"components/arc/button/button.tsx",
	"components/arc/button/button.module.css",
	"components/arc/gauge/gauge.tsx",
	"components/arc/gauge/gauge.module.css",
	"components/arc/waffle-chart/waffle-chart.tsx",
	"components/arc/waffle-chart/waffle-chart.module.css",
	"components/arc/static-donut/static-donut.tsx",
	"components/arc/sparkline/static-sparkline.tsx",
	"components/arc/ruler-slider/ruler-slider.tsx",
	"components/arc/ruler-slider/ruler-slider.module.css",
	"components/arc/segmented-control/segmented-control.tsx",
	"components/arc/segmented-control/segmented-control.module.css",
];
for (const input of freeInputs) {
	const content = execFileSync("git", ["show", `${revision}:platforms/tauri/src/${input}`], {
		cwd: source,
	});
	const destination = path.join(baseline, input);
	mkdirSync(path.dirname(destination), { recursive: true });
	writeFileSync(destination, content);
}
const requireSource = createRequire(path.join(source, "package.json"));
const runtime = path.resolve(
	process.env.TOKENPLAN_REACT_RUNTIME ?? path.join(root, ".amp/in/tokenplan-react")
);
const requireRuntime = createRequire(path.join(runtime, "package.json"));
const { createServer } = await import(pathToFileURL(requireSource.resolve("vite")));
const { svelte } = await import(
	pathToFileURL(requireSource.resolve("@sveltejs/vite-plugin-svelte"))
);
const { default: tailwindcss } = await import(
	pathToFileURL(requireSource.resolve("@tailwindcss/vite"))
);
const svelteDirectory = path.dirname(requireSource.resolve("svelte/package.json"));
const svelteExports = JSON.parse(
	readFileSync(path.join(svelteDirectory, "package.json"), "utf8")
).exports;
const aliases = [
	{ find: "@source", replacement: baseline },
	{
		find: /^@valar\/svelte-ui\/(.+)$/,
		replacement: path.join(root, "packages/ui/dist/valar/ui/$1/index.ts"),
	},
	...Object.entries(svelteExports).flatMap(([key, conditions]) => {
		const target =
			typeof conditions === "string" ? conditions : (conditions.browser ?? conditions.default);
		if (!target) return [];
		const name = key === "." ? "svelte" : `svelte/${key.slice(2)}`;
		return [
			{
				find: new RegExp(`^${name.replaceAll("/", "\\/")}$`),
				replacement: path.join(svelteDirectory, target),
			},
		];
	}),
	...["react", "react-dom", "motion", "lucide-react"].map((name) => ({
		find: name,
		replacement: path.dirname(requireRuntime.resolve(`${name}/package.json`)),
	})),
	{ find: "tailwindcss", replacement: path.join(source, "node_modules/tailwindcss") },
];
const server = await createServer({
	configFile: false,
	root: directory,
	cacheDir: path.join(root, ".amp/in/comparison-vite"),
	plugins: [svelte({ configFile: false }), tailwindcss()],
	resolve: { alias: aliases, dedupe: ["svelte", "react", "react-dom"] },
	esbuild: { jsx: "automatic" },
	server: {
		host: "127.0.0.1",
		port: 5198,
		strictPort: true,
		fs: { allow: [root, source, runtime] },
	},
});
await server.listen();
server.printUrls();
for (const signal of ["SIGINT", "SIGTERM"])
	process.once(signal, async () => {
		await server.close();
		process.exit(0);
	});
