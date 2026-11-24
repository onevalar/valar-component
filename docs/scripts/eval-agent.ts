/**
 * Runs Valar golden business blind evals against the local docs site `/api/agent` endpoint.
 *
 * Usage:
 *   AGENT_API_KEY=sk-... AGENT_MODEL=gpt-4.1 pnpm --filter docs exec tsx scripts/eval-agent.ts
 * Optional env vars:
 *   AGENT_BASE_URL=https://api.openai.com/v1
 *   AGENT_SITE_URL=http://localhost:5174
 *   AGENT_EVAL_IDS=1,2,3,4,7
 */
import fs from "node:fs";
import path from "node:path";
import { validateUi, type UiNode } from "../src/lib/agent/ui-catalog.js";
import { uiNodeToSvelte } from "../src/lib/agent/ui-to-svelte.js";
import { lintSource } from "../../packages/cli/src/utils/design-rules-core.js";

type EvalCase = {
	id: number;
	name: string;
	prompt: string;
	expected_pattern: string;
	expected_components: string[];
	expectations: string[];
};

type StreamEvent = {
	type?: string;
	toolCallId?: string;
	toolName?: string;
	input?: Record<string, unknown>;
	output?: unknown;
	delta?: string;
	errorText?: string;
};

const CORE_IDS = new Set(
	(process.env.AGENT_EVAL_IDS ?? "2,1,3,4,7")
		.split(",")
		.map((s) => Number(s.trim()))
		.filter(Boolean)
);

const SITE_URL = (process.env.AGENT_SITE_URL ?? "http://localhost:5174").replace(/\/+$/, "");
const API_KEY = process.env.AGENT_API_KEY?.trim() ?? "";
const MODEL = process.env.AGENT_MODEL?.trim() ?? "";
const BASE_URL = process.env.AGENT_BASE_URL?.trim() || "https://api.openai.com/v1";

function loadEvals(): EvalCase[] {
	const file = path.resolve(process.cwd(), "../skills/valar-svelte/evals/evals.json");
	const raw = JSON.parse(fs.readFileSync(file, "utf8")) as { evals: EvalCase[] };
	return raw.evals.filter((item) => CORE_IDS.has(item.id));
}

async function runCase(item: EvalCase) {
	const started = Date.now();
	const response = await fetch(`${SITE_URL}/api/agent`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			locale: "zh",
			settings: { baseURL: BASE_URL, apiKey: API_KEY, model: MODEL, effort: "default", apiMode: "auto" },
			messages: [
				{
					id: `eval-${item.id}`,
					role: "user",
					parts: [{ type: "text", text: item.prompt }],
				},
			],
		}),
	});
	if (!response.ok || !response.body) {
		throw new Error(`HTTP ${response.status}: ${await response.text()}`);
	}

	const toolCalls: { id: string; name: string; input?: Record<string, unknown>; output?: unknown }[] =
		[];
	const byId = new Map<string, (typeof toolCalls)[number]>();
	let text = "";
	let streamError = "";

	const rawText = await response.text();
	for (const line of rawText.split("\n")) {
		if (!line.startsWith("data:")) continue;
		const payload = line.slice(5).trim();
		if (!payload || payload === "[DONE]") continue;
		let event: StreamEvent;
		try {
			event = JSON.parse(payload) as StreamEvent;
		} catch {
			continue;
		}
		if (event.type === "text-delta" && event.delta) text += event.delta;
		if (event.type === "error" && event.errorText) streamError = event.errorText;
		if (event.type === "tool-input-available" && event.toolCallId && event.toolName) {
			const entry = { id: event.toolCallId, name: event.toolName, input: event.input };
			toolCalls.push(entry);
			byId.set(event.toolCallId, entry);
		}
		if (event.type === "tool-output-available" && event.toolCallId) {
			const entry = byId.get(event.toolCallId);
			if (entry) entry.output = event.output;
		}
	}

	const uiCalls = toolCalls.filter((c) => c.name === "show_ui");
	const rejectedUiCalls = uiCalls.filter((c) => !(c.output as { ok?: boolean })?.ok);
	const acceptedUi = [...uiCalls].reverse().find((c) => (c.output as { ok?: boolean })?.ok);
	const root = acceptedUi?.input?.root as UiNode | undefined;
	const uiValid = root ? validateUi(root).ok : false;
	const exported = root ? uiNodeToSvelte(root) : null;
	const lintFindings = exported ? lintSource(`${item.name}.svelte`, exported.code) : [];

	return {
		id: item.id,
		name: item.name,
		ms: Date.now() - started,
		toolCount: toolCalls.length,
		tools: toolCalls.map((c) => c.name),
		uiAttempts: uiCalls.length,
		uiRejections: rejectedUiCalls.length,
		uiValid,
		exportedComponents: exported?.components ?? [],
		lintErrors: lintFindings.filter((f) => f.severity === "error").length,
		lintWarnings: lintFindings.filter((f) => f.severity === "warning").length,
		textLength: text.length,
		streamError,
		root,
	};
}

async function main() {
	if (!API_KEY || !MODEL) {
		console.error(
			"请先设置环境变量 AGENT_API_KEY 和 AGENT_MODEL（可选 AGENT_BASE_URL、AGENT_EVAL_IDS）。"
		);
		process.exit(1);
	}
	const cases = loadEvals();
	console.log(`正在针对 ${SITE_URL} 使用模型 ${MODEL} 运行 ${cases.length} 个黄金盲测场景…\n`);
	const results = [];
	for (const item of cases) {
		const res = await runCase(item);
		results.push(res);
		console.log(
			`[#${res.id} ${res.name}] ${res.ms}ms | 工具 ${res.toolCount} 次 | 画布 ${res.uiValid ? "通过" : "缺失"}（重试 ${res.uiRejections}）| 导出 Lint: ${res.lintErrors} err / ${res.lintWarnings} warn`
		);
		if (res.streamError) console.error(`  错误: ${res.streamError}`);
	}
	const outPath = path.resolve(process.cwd(), ".eval-agent-report.json");
	fs.writeFileSync(outPath, JSON.stringify({ model: MODEL, baseURL: BASE_URL, results }, null, 2));
	console.log(`\n完整报告已写入 ${outPath}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
