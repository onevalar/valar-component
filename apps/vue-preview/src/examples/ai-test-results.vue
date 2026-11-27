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

type Test = {
	name: string;
	zh: string;
} & ({ status: "passed" | "skipped" } | { status: "failed"; error: string });

const suites: { name: string; tests: Test[] }[] = [
	{
		name: "cart.test.ts",
		tests: [
			{ name: "adds an item", zh: "添加商品", status: "passed" },
			{ name: "removes an item", zh: "移除商品", status: "passed" },
		],
	},
	{
		name: "payment.test.ts",
		tests: [
			{ name: "charges the saved card", zh: "向已保存的卡扣款", status: "passed" },
			{
				name: "retries a declined card",
				zh: "重试被拒绝的卡",
				status: "failed",
				error: "Expected 2 charge attempts, received 1\n\n  at src/payment.test.ts:58:22",
			},
			{ name: "accepts an international card", zh: "接受国际信用卡", status: "skipped" },
		],
	},
];

function summarize(tests: Test[]) {
	const passed = tests.filter((test) => test.status === "passed").length;
	const failed = tests.filter((test) => test.status === "failed").length;
	const skipped = tests.length - passed - failed;
	return {
		failed,
		label: props.chinese
			? `${tests.length} 项测试，${passed} 通过，${failed} 失败，${skipped} 跳过`
			: `${tests.length} tests, ${passed} passed, ${failed} failed, ${skipped} skipped`,
	};
}
const summary = computed(() => summarize(suites.flatMap((suite) => suite.tests)));
const results = computed(() => suites.map((suite) => ({ ...suite, ...summarize(suite.tests) })));
const running = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;
function replay() {
	if (running.value) return;
	running.value = true;
	timer = setTimeout(() => {
		running.value = false;
	}, 1000);
}
onUnmounted(() => clearTimeout(timer));
</script>

<template>
	<section :lang="chinese ? 'zh-CN' : 'en'" class="grid w-full max-w-sm min-w-0 gap-3 p-4 text-sm">
		<Trace>
			<TraceLine v-if="running" status="running"
				><TraceIcon>◌</TraceIcon
				><TraceTitle>{{
					chinese ? "正在运行结账测试…" : "Running checkout tests…"
				}}</TraceTitle></TraceLine
			>
			<TraceCollapsible v-else :default-open="summary.failed > 0">
				<TraceCollapsibleTrigger>
					<TraceLine :status="summary.failed > 0 ? 'error' : undefined">
						<TraceIcon>≡</TraceIcon
						><TraceTitle class="whitespace-normal">{{
							chinese ? `已运行 ${summary.label}` : `Ran ${summary.label}`
						}}</TraceTitle>
					</TraceLine>
				</TraceCollapsibleTrigger>
				<TraceCollapsibleContent>
					<Trace>
						<TraceCollapsible
							v-for="suite in results"
							:key="suite.name"
							:default-open="suite.failed > 0"
						>
							<TraceCollapsibleTrigger>
								<TraceLine :status="suite.failed > 0 ? 'error' : undefined">
									<TraceIcon>≡</TraceIcon
									><TraceTitle class="whitespace-normal"
										>{{ suite.name }}{{ chinese ? "，" : ", " }}{{ suite.label }}</TraceTitle
									>
								</TraceLine>
							</TraceCollapsibleTrigger>
							<TraceCollapsibleContent>
								<Trace>
									<template v-for="test in suite.tests" :key="test.name">
										<TraceCollapsible v-if="test.status === 'failed'" default-open>
											<TraceCollapsibleTrigger>
												<TraceLine status="error"
													><TraceIcon>×</TraceIcon
													><TraceTitle>{{
														chinese ? `失败：${test.zh}` : `Failed: ${test.name}`
													}}</TraceTitle></TraceLine
												>
											</TraceCollapsibleTrigger>
											<TraceCollapsibleContent
												><CodeBlock size="sm"
													><CodeBlockContent wrap :code="test.error" /></CodeBlock
											></TraceCollapsibleContent>
										</TraceCollapsible>
										<TraceLine v-else>
											<TraceIcon>{{ test.status === "passed" ? "✓" : "–" }}</TraceIcon>
											<TraceTitle>{{
												test.status === "passed"
													? chinese
														? `通过：${test.zh}`
														: `Passed: ${test.name}`
													: chinese
														? `跳过：${test.zh}`
														: `Skipped: ${test.name}`
											}}</TraceTitle>
										</TraceLine>
									</template>
								</Trace>
							</TraceCollapsibleContent>
						</TraceCollapsible>
					</Trace>
				</TraceCollapsibleContent>
			</TraceCollapsible>
		</Trace>
		<Button
			variant="outline"
			size="sm"
			class="justify-self-start"
			:aria-disabled="running"
			@click="replay"
			>{{ chinese ? "重播" : "Replay" }}</Button
		>
		<span role="status" class="sr-only">{{
			running ? (chinese ? "正在运行结账测试" : "Running checkout tests") : summary.label
		}}</span>
	</section>
</template>
