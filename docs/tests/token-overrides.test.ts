import { describe, expect, it } from "vitest";
import {
	applyTokenOverride,
	globalTokenBridgeCss,
	hexToOklch,
	oklchToHex,
	serializeTokenOverrides,
	tokenOverridePayloadSchema,
} from "../src/lib/features/workbench/token-overrides.js";

describe("global token write-back", () => {
	it("converts between hex and oklch using reference values", () => {
		// Reference: CSS Color 4 conversion of pure sRGB red.
		expect(hexToOklch("#ff0000")).toBe("oklch(0.628 0.258 29.234)");
		expect(oklchToHex("oklch(0.628 0.258 29.234)")).toBe("#ff0000");
		// Grays carry no hue and are written like the upstream themes.
		expect(hexToOklch("#ffffff")).toBe("oklch(1 0 0)");
		expect(oklchToHex("oklch(1 0 0)")).toBe("#ffffff");
		// Alpha survives a color change, so translucent borders stay translucent.
		expect(hexToOklch("#000000", "10%")).toBe("oklch(0 0 0 / 10%)");
		expect(oklchToHex("oklch(1 0 0 / 15%)")).toBe("#ffffff");
	});

	it("only accepts oklch colors, known tokens and bounded rem values", () => {
		const ok = {
			base: "neutral",
			override: { light: { primary: "oklch(0.5 0.2 260)", radius: "0.5rem" } },
		};
		expect(tokenOverridePayloadSchema.safeParse(ok).success).toBe(true);
		for (const override of [
			{ light: { primary: "red" } },
			{ light: { primary: "oklch(0.5 0.2 260); } body { display:none" } },
			{ light: { "not-a-token": "oklch(0.5 0.2 260)" } },
			{ dark: { radius: "0.5rem" } },
			{ light: { radius: "5rem" } },
			{ theme: { "text-sm": "99px" } },
		]) {
			expect(tokenOverridePayloadSchema.safeParse({ base: "neutral", override }).success).toBe(
				false
			);
		}
		expect(tokenOverridePayloadSchema.safeParse({ ...ok, base: "amber" }).success).toBe(false);
	});

	it("merges overrides over the base theme without dropping untouched tokens", () => {
		const base = {
			name: "neutral",
			cssVars: {
				light: { primary: "oklch(0.205 0 0)", border: "oklch(0.922 0 0)" },
				dark: { primary: "oklch(0.922 0 0)" },
			},
		};
		const merged = applyTokenOverride(base, {
			light: { primary: "oklch(0.5 0.2 260)" },
			theme: { "text-sm": "0.9375rem" },
		});
		expect(merged.cssVars).toEqual({
			light: { primary: "oklch(0.5 0.2 260)", border: "oklch(0.922 0 0)" },
			dark: { primary: "oklch(0.922 0 0)" },
			theme: { "text-sm": "0.9375rem" },
		});
		expect(base.cssVars.light.primary).toBe("oklch(0.205 0 0)");
	});

	it("writes only real changes in a stable order", () => {
		const out = serializeTokenOverrides({
			stone: {
				light: { ring: "oklch(0.7 0 0)", primary: "oklch(0.5 0.2 260)" },
				dark: {},
				theme: {},
			},
			neutral: { light: {}, dark: {} },
		});
		expect(out).toBe(
			JSON.stringify(
				{ stone: { light: { primary: "oklch(0.5 0.2 260)", ring: "oklch(0.7 0 0)" } } },
				null,
				"\t"
			) + "\n"
		);
	});

	it("accepts motion and border tokens only in safe formats", () => {
		const ok = (light: Record<string, string>) =>
			tokenOverridePayloadSchema.safeParse({ base: "neutral", override: { light } }).success;
		expect(
			ok({
				"motion-duration-fast": "120ms",
				"motion-ease-enter": "cubic-bezier(0.34, 1.56, 0.64, 1)",
				"motion-ease-exit": "linear",
				"border-width": "1.5px",
			})
		).toBe(true);
		for (const light of <Record<string, string>[]>[
			{ "motion-duration-fast": "0.1s" },
			{ "motion-duration-fast": "5000ms" },
			{ "motion-ease-enter": "ease" },
			{ "motion-ease-enter": "cubic-bezier(0,0,1,1); } body{x:y" },
			{ "border-width": "10px" },
			{ "motion-duration-unknown": "100ms" },
		])
			expect(ok(light)).toBe(false);
		// Motion is mode-independent: it is not accepted in the dark section.
		expect(
			tokenOverridePayloadSchema.safeParse({
				base: "neutral",
				override: { dark: { "motion-duration-fast": "100ms" } },
			}).success
		).toBe(false);
	});

	it("ships motion and border defaults that equal the literals they replace", async () => {
		const { DEFAULT_BASE_THEMES, UPSTREAM_BASE_THEMES } =
			await import("../src/lib/registry/themes.js");
		const light = (list: typeof DEFAULT_BASE_THEMES) =>
			list.find((theme) => theme.name === "stone")!.cssVars.light as Record<string, string>;
		expect(light(DEFAULT_BASE_THEMES)).toMatchObject({
			"motion-duration-fast": "100ms",
			"motion-duration-normal": "200ms",
			"motion-duration-slow": "300ms",
			"motion-duration-interaction": "150ms",
			"motion-ease-enter": "cubic-bezier(0.22, 1, 0.36, 1)",
			"border-width": "1px",
		});
		// Upstream theme data itself stays untouched.
		expect(light(UPSTREAM_BASE_THEMES)).not.toHaveProperty("motion-duration-fast");
	});

	it("builds global CSS and component bridge variables only when tokens are overridden", () => {
		expect(globalTokenBridgeCss(undefined)).toBe("");
		expect(globalTokenBridgeCss({ light: {}, dark: {}, theme: {} })).toBe("");
		const css = globalTokenBridgeCss({
			light: {
				primary: "oklch(0.55 0.22 250)",
				card: "oklch(0.99 0 0)",
				popover: "oklch(0.98 0 0)",
				ring: "oklch(0.6 0.2 250)",
				radius: "0.75rem",
			},
			dark: {
				primary: "oklch(0.7 0.2 250)",
			},
		});
		expect(css).toContain(":root {");
		expect(css).toContain("--primary: oklch(0.55 0.22 250);");
		expect(css).toContain("--radius: 0.75rem;");
		expect(css).toContain("--valar-button-primary: var(--primary);");
		expect(css).toContain("--valar-card-bg: var(--card);");
		expect(css).toContain("--valar-popover-bg: var(--popover);");
		expect(css).toContain("--valar-focus-ring: var(--ring);");
		expect(css).toContain(".dark {");
		expect(css).toContain("--primary: oklch(0.7 0.2 250);");
	});

	it("ships Linear Blue primary on neutral and full Linear semantic/chromatic tokens on all 7 base themes", async () => {
		const { BASE_THEME_NAMES, COLOR_TOKENS } = await import(
			"../src/lib/features/workbench/token-overrides.js"
		);
		const { DEFAULT_BASE_THEMES } = await import("../src/lib/registry/themes.js");
		const neutral = DEFAULT_BASE_THEMES.find((theme) => theme.name === "neutral")!;
		expect(neutral.cssVars.light.primary).toBe("oklch(0.57 0.191 255.5)");
		expect(neutral.cssVars.dark.primary).toBe("oklch(0.587 0.197 255.457)");
		const extendedTokens = [
			"info",
			"info-foreground",
			"success",
			"success-foreground",
			"warning",
			"warning-foreground",
			"destructive",
			"destructive-foreground",
			"blue",
			"teal",
			"green",
			"yellow",
			"orange",
			"red",
			"indigo",
			"pink",
			"slate",
		] as const;
		for (const base of BASE_THEME_NAMES) {
			const theme = DEFAULT_BASE_THEMES.find((item) => item.name === base)!;
			for (const token of COLOR_TOKENS) {
				expect(theme.cssVars.light).toHaveProperty(token);
				expect(theme.cssVars.dark).toHaveProperty(token);
			}
			for (const token of extendedTokens) {
				expect((theme.cssVars.light as Record<string, string>)[token]).toMatch(/^oklch\(/);
				expect((theme.cssVars.dark as Record<string, string>)[token]).toMatch(/^oklch\(/);
			}
		}
	});
});
