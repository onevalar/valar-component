import fs from "node:fs";
import path from "node:path";
import { BASE_THEMES } from "../docs/src/lib/registry/themes.ts";
import { transformCss } from "../packages/cli/src/utils/transform-css.ts";
import {
	injectStyleClasses,
	mergeStyleMaps,
	parseStyleCss,
} from "../packages/parity/src/inject-style-classes.ts";

/** Build-time only: all native SDKs read the existing Valar maintenance source. */
export function getValarStyleMap(root: string, style = "valar"): Record<string, string> {
	const styles = path.join(root, "docs/src/lib/registry/styles");
	return mergeStyleMaps(
		parseStyleCss(fs.readFileSync(path.join(styles, `style-${style}.css`), "utf8")),
		parseStyleCss(fs.readFileSync(path.join(styles, "valar", `style-${style}.css`), "utf8"))
	);
}

export function styleSource(source: string, styleMap: Record<string, string>): string {
	return injectStyleClasses(source, styleMap)
		.replace(/\bcn-font-heading\b/g, "font-heading")
		.replace(/\bcn-menu-(?:target|translucent)\b/g, "");
}

/** Paths are relative to the generated stylesheet, so tarball consumers scan their own SDK. */
export function createThemeCss(root: string, sources = ["./ui", "./hooks", "./lib"]): string {
	const theme = BASE_THEMES.find((entry) => entry.name === "neutral")!;
	const input = [
		'@import "tw-animate-css";',
		"@custom-variant dark (&:is(.dark *));",
		...sources.map((source) => `@source ${JSON.stringify(source)};`),
		"@theme inline { --font-heading: var(--font-sans); }",
		"",
	].join("\n");
	return (
		transformCss(input, {
			cssVars: theme.cssVars,
			css: {
				"@layer base": {
					"*": { "@apply border-border outline-ring/50": {} },
					body: { "@apply bg-background text-foreground": {} },
				},
			},
		}) +
		"\n" +
		fs.readFileSync(path.join(root, "packages/cli/src/tailwind.css"), "utf8")
	);
}
