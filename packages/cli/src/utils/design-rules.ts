import path from "node:path";
import { existsSync, promises as fs } from "node:fs";
import { GLOBAL_RULES, lintSource, type LintFinding } from "./design-rules-core.js";

export { GLOBAL_RULES, lintSource, type LintFinding };

/**
 * Valar ships design rules with its components (`<component>/RULES.md`) so that AI agents
 * working in a consumer project follow them without looking for a separate guide:
 * `add` copies them into a managed block of the project's AGENTS.md, and `lint`
 * reports the rules that can be checked mechanically.
 */

export const RULES_START = "<!-- valar-svelte:rules:start -->";
export const RULES_END = "<!-- valar-svelte:rules:end -->";

/**
 * Builds the compact managed AGENTS.md block: global guardrails + a one-line-per-component
 * index pointing to each installed component's local `RULES.md` (progressive disclosure,
 * avoiding context bloat when a project installs dozens of components).
 */
export async function buildRulesBlock(uiDir: string, cwd: string): Promise<string> {
	const indexLines: string[] = [];
	const entries = existsSync(uiDir) ? await fs.readdir(uiDir, { withFileTypes: true }) : [];
	for (const entry of entries
		.filter((e) => e.isDirectory())
		.sort((a, b) => a.name.localeCompare(b.name))) {
		const file = path.join(uiDir, entry.name, "RULES.md");
		if (!existsSync(file)) continue;
		const firstHeading = (await fs.readFile(file, "utf8"))
			.match(/^#\s+(.+)$/m)?.[1]
			?.trim();
		const rel = path.relative(cwd, file).split(path.sep).join("/");
		indexLines.push(`- \`${entry.name}\`${firstHeading ? `（${firstHeading}）` : ""}：\`${rel}\``);
	}
	return [
		RULES_START,
		"## Valar 设计规范",
		"",
		"由 `valar-svelte` 自动维护，安装或更新组件时会重写本区块，请勿手动修改。",
		"",
		"### 通用底线",
		"",
		GLOBAL_RULES,
		...(indexLines.length
			? [
					"",
					"### 已安装组件规范（按需阅读）",
					"",
					"仅在本次任务实际用到某组件时，再读取对应的本地 `RULES.md`（或调用 MCP `get_component`），不要一次性全量加载：",
					"",
					...indexLines,
				]
			: []),
		RULES_END,
	].join("\n");
}

/** Writes or replaces the managed block in `<cwd>/AGENTS.md`, keeping everything else. */
export async function updateAgentsRules(uiDir: string, cwd: string): Promise<string> {
	const target = path.join(cwd, "AGENTS.md");
	const block = await buildRulesBlock(uiDir, cwd);
	const existing = existsSync(target) ? await fs.readFile(target, "utf8") : "";
	const start = existing.indexOf(RULES_START);
	const end = existing.indexOf(RULES_END);
	const next =
		start !== -1 && end > start
			? existing.slice(0, start) + block + existing.slice(end + RULES_END.length)
			: `${existing.trimEnd()}${existing.trim() ? "\n\n" : ""}${block}\n`;
	if (next !== existing) await fs.writeFile(target, next, "utf8");
	return target;
}

const LINT_EXTENSIONS = new Set([".svelte", ".ts", ".js", ".html"]);

/** Lints every source file under `paths`, skipping installed components and dependencies. */
export async function lintPaths(paths: string[], skipDirs: string[]): Promise<LintFinding[]> {
	const skipped = (file: string) =>
		file.includes(`${path.sep}node_modules${path.sep}`) ||
		skipDirs.some((dir) => file === dir || file.startsWith(dir + path.sep));
	const files: string[] = [];
	async function collect(target: string) {
		if (skipped(target) || !existsSync(target)) return;
		const stat = await fs.stat(target);
		if (stat.isDirectory()) {
			for (const entry of await fs.readdir(target)) {
				if (entry.startsWith(".") || entry === "node_modules") continue;
				await collect(path.join(target, entry));
			}
		} else if (LINT_EXTENSIONS.has(path.extname(target))) files.push(target);
	}
	for (const target of paths) await collect(path.resolve(target));
	const findings: LintFinding[] = [];
	for (const file of files.sort())
		findings.push(...lintSource(file, await fs.readFile(file, "utf8")));
	return findings;
}
