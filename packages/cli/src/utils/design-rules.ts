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

/** Builds the managed AGENTS.md block from every installed component's RULES.md. */
export async function buildRulesBlock(uiDir: string, cwd: string): Promise<string> {
	const sections: string[] = [];
	const entries = existsSync(uiDir) ? await fs.readdir(uiDir, { withFileTypes: true }) : [];
	for (const entry of entries
		.filter((e) => e.isDirectory())
		.sort((a, b) => a.name.localeCompare(b.name))) {
		const file = path.join(uiDir, entry.name, "RULES.md");
		if (!existsSync(file)) continue;
		const body = (await fs.readFile(file, "utf8"))
			.trim()
			// Nest each component's own top-level heading under this block.
			.replace(
				/^# (.+)$/m,
				`### $1\n\n来源：\`${path.relative(cwd, file).split(path.sep).join("/")}\``
			);
		sections.push(body);
	}
	return [
		RULES_START,
		"## Valar 设计规范",
		"",
		"由 valar-svelte 根据已安装组件自动生成，安装或更新组件时会重写本区块，请勿手动修改区块内容。编写或修改界面前先阅读并遵守。",
		"",
		"### 通用",
		"",
		GLOBAL_RULES,
		...sections.flatMap((section) => ["", section]),
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
