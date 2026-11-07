import fs from "node:fs/promises";

/**
 * Pulls the upstream Nova style CSS, which Valar ships as its single `valar` style. The file is
 * intentionally not formatted: the order of each `@apply` list is semantic for tailwind-merge, so it
 * must stay identical to shadcn/ui apart from the renamed root selector (`.style-nova` -> `.style-valar`).
 */
async function pullStyles() {
	console.log("Pulling upstream style nova as valar...");
	const url =
		"https://raw.githubusercontent.com/shadcn-ui/ui/refs/heads/main/apps/v4/registry/styles/style-nova.css";
	const res = await fetch(url);
	if (!res.ok) {
		console.error(`Failed to pull style nova: ${url} -> ${res.status}`);
		process.exitCode = 1;
		return;
	}
	const css = (await res.text()).replaceAll(".style-nova", ".style-valar");
	const filepath = "src/lib/registry/styles/style-valar.css";
	await fs.writeFile(filepath, css);
	console.log(`Wrote style valar to ${filepath}`);
}

pullStyles();
