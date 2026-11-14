import { readFileSync } from "node:fs";
import { DEFAULT_PRESET_CONFIG } from "@valar/svelte-cli/preset";
import { expect, it } from "vitest";
import { sharedBlocks } from "../scripts/shared-blocks.js";
import { buildRegistryBase } from "../src/lib/registry/config.js";

it("initializes styles without replacing the required local CLI with an unpublished npm package", () => {
	const item = buildRegistryBase(DEFAULT_PRESET_CONFIG);
	expect(item.devDependencies).toContain("tw-animate-css");
	expect(item.devDependencies.some((dependency) => dependency.startsWith("@valar/"))).toBe(false);
	expect(item.css).toHaveProperty('@import "@valar/svelte-cli/tailwind.css"');
});

it("installs shared blocks in separate routes alongside the app index", () => {
	for (const block of sharedBlocks) {
		const item = JSON.parse(readFileSync(`static/registry/styles/valar/${block}.json`, "utf8"));
		expect(item.files).toContainEqual(
			expect.objectContaining({ type: "registry:page", target: `${block}/+page.svelte` })
		);
		expect(
			item.files.every((file: { target: string }) => file.target.startsWith(`${block}/`))
		).toBe(true);
	}
});
