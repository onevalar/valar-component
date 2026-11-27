<script setup lang="ts">
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
import { useId } from "vue";

defineProps<{ chinese?: boolean }>();
const frameId = useId();
const stack = `TypeError: Cannot read properties of undefined (reading 'total')
  at formatInvoice (src/billing.ts:42:31)
  at InvoiceRow (src/invoice-row.tsx:18:12)
  at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)
  at beginWork (node_modules/react-dom/cjs/react-dom.development.js:19049:16)
  at process.processTicksAndRejections (node:internal/process/task_queues:105:5)`;
const [error, ...frames] = stack.split("\n").map((line) => line.trim());
const isInternal = (frame: string) => frame.includes("node_modules/") || frame.includes("node:");
const internalFrames = frames.filter(isInternal);
const appFrames = frames.filter((frame) => !isInternal(frame));
const snippets = ["return formatMoney(invoice.total);", "const total = formatInvoice(invoice);"];
</script>

<template>
	<section :lang="chinese ? 'zh-CN' : 'en'" class="w-full max-w-sm min-w-0 p-4">
		<Trace>
			<TraceCollapsible default-open>
				<TraceCollapsibleTrigger>
					<TraceLine status="error">
						<TraceIcon>×</TraceIcon>
						<TraceTitle>{{ chinese ? `失败：${error}` : `Failed: ${error}` }}</TraceTitle>
					</TraceLine>
				</TraceCollapsibleTrigger>
				<TraceCollapsibleContent class="grid gap-2">
					<p class="font-mono text-xs text-destructive">{{ error }}</p>
					<Trace>
						<a
							v-for="(frame, index) in appFrames"
							:key="frame"
							:href="`#${frameId}-frame-${index}`"
							class="rounded-md focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset"
						>
							<TraceLine
								><TraceIcon>↳</TraceIcon><TraceTitle>{{ frame }}</TraceTitle></TraceLine
							>
						</a>
						<TraceCollapsible>
							<TraceCollapsibleTrigger>
								<TraceLine>
									<TraceIcon>≡</TraceIcon>
									<TraceTitle>{{
										chinese
											? `${internalFrames.length} 个框架堆栈帧`
											: `${internalFrames.length} framework frames`
									}}</TraceTitle>
								</TraceLine>
							</TraceCollapsibleTrigger>
							<TraceCollapsibleContent>
								<CodeBlock size="sm"
									><CodeBlockContent wrap :code="internalFrames.join('\n')"
								/></CodeBlock>
							</TraceCollapsibleContent>
						</TraceCollapsible>
					</Trace>
					<ol
						:aria-label="chinese ? '示例源代码' : 'Sample source lines'"
						class="grid gap-1 rounded-lg border-[0.5px] border-border bg-muted p-2 font-mono text-xs text-foreground"
					>
						<li
							v-for="(frame, index) in appFrames"
							:id="`${frameId}-frame-${index}`"
							:key="frame"
							tabindex="-1"
							class="rounded-sm p-1 target:bg-accent target:outline-1 target:-outline-offset-1 target:outline-ring"
						>
							<div class="text-muted-foreground">{{ frame.match(/\(([^)]+)\)$/)?.[1] }}</div>
							<code>{{ snippets[index] }}</code>
						</li>
					</ol>
				</TraceCollapsibleContent>
			</TraceCollapsible>
		</Trace>
	</section>
</template>
