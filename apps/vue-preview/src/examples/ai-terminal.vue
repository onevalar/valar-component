<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import { CodeBlock, CodeBlockContent } from "@valar/vue-ui/code-block";
import {
	Trace,
	TraceCollapsible,
	TraceCollapsibleContent,
	TraceCollapsibleTrigger,
	TraceIcon,
	TraceLine,
	TraceTitle,
} from "@valar/vue-ui/trace";
import { computed, onUnmounted, ref } from "vue";

const props = defineProps<{ chinese?: boolean }>();

// Recorded fixture text only; replay never invokes a shell.
const commands = [
	{
		command: "pnpm test",
		lines: [
			"> vitest run",
			"✓ cart.test.ts (3 tests)",
			"✓ payment.test.ts (2 tests)",
			"Tests  5 passed",
		],
		exitCode: 0,
	},
	{
		command: "pnpm lint",
		lines: [
			"> eslint .",
			"src/cart.ts:14:7",
			"  'total' is assigned a value but never used.",
			"1 problem (1 error)",
		],
		exitCode: 1,
	},
];
const end = commands.reduce((total, command) => total + command.lines.length + 1, 0);
const tick = ref(end);
const hasReplayed = ref(false);
const openByCommand = ref<Record<string, boolean>>({});
const busy = computed(() => tick.value < end);
const rows = computed(() => {
	let start = 0;
	return commands.flatMap(({ command, lines, exitCode }, index) => {
		const elapsed = tick.value - start;
		start += lines.length + 1;
		if (elapsed < 0) return [];
		const running = elapsed <= lines.length;
		const output = lines.slice(0, elapsed).join("\n");
		const failed = !running && exitCode !== 0;
		const title = running
			? props.chinese
				? `正在运行 ${command}`
				: `Running ${command}`
			: failed
				? props.chinese
					? `${command} 退出，退出码 ${exitCode}`
					: `${command} exited with code ${exitCode}`
				: props.chinese
					? `已运行 ${command}`
					: `Ran ${command}`;
		return [
			{ command, running, output, failed, title, initialOpen: index === commands.length - 1 },
		];
	});
});

let timer: ReturnType<typeof setInterval> | undefined;
function replay() {
	if (busy.value) return;
	openByCommand.value = {};
	hasReplayed.value = true;
	tick.value = 0;
	timer = setInterval(() => {
		if (++tick.value === end) clearInterval(timer);
	}, 400);
}
onUnmounted(() => clearInterval(timer));
</script>

<template>
	<section :lang="chinese ? 'zh-CN' : 'en'" class="grid w-full max-w-sm min-w-0 gap-3 p-4 text-sm">
		<p class="text-muted-foreground">
			{{
				chinese
					? "模拟终端输出，不执行命令。"
					: "Simulated terminal output. No commands are executed."
			}}
		</p>
		<Trace>
			<TraceCollapsible
				v-for="row in rows"
				:key="row.command"
				:open="openByCommand[row.command] ?? (hasReplayed ? row.output !== '' : row.initialOpen)"
				@update:open="
					(open) => {
						openByCommand[row.command] = open;
					}
				"
			>
				<TraceCollapsibleTrigger>
					<TraceLine :status="row.running ? 'running' : row.failed ? 'error' : undefined">
						<TraceIcon class="font-mono">&gt;_</TraceIcon>
						<TraceTitle>{{ row.title }}</TraceTitle>
					</TraceLine>
				</TraceCollapsibleTrigger>
				<TraceCollapsibleContent>
					<CodeBlock size="sm">
						<CodeBlockContent
							wrap
							class="max-h-64"
							:code="row.output || (chinese ? '正在等待输出…' : 'Waiting for output…')"
						/>
					</CodeBlock>
				</TraceCollapsibleContent>
			</TraceCollapsible>
		</Trace>
		<Button
			variant="outline"
			size="sm"
			class="justify-self-start"
			:aria-disabled="busy"
			@click="replay"
		>
			{{ chinese ? "重播" : "Replay" }}
		</Button>
		<span role="status" class="sr-only">{{
			busy
				? chinese
					? "正在播放终端输出"
					: "Replaying terminal output"
				: chinese
					? "终端输出已完成"
					: "Terminal output complete"
		}}</span>
	</section>
</template>
