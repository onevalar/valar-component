<script lang="ts">
	import CircleAlert from "@lucide/svelte/icons/circle-alert";
	import { getLocale } from "$lib/i18n/index.js";
	import * as Trace from "$lib/registry/ui/trace/index.js";

	const chinese = $derived(getLocale() === "zh");
	const text = (zh: string, en: string) => (chinese ? zh : en);
	let attempts = 0;

	async function retrySearch() {
		const attempt = ++attempts;
		await new Promise<void>((resolve) => setTimeout(resolve, 700));
		if (attempt === 1) throw new Error("Example tool error");
	}
</script>

<section
	aria-label={text("本地工具重试示例", "Local tool retry example")}
	class="w-full max-w-sm min-w-0"
>
	<Trace.Root appearance="agent">
		<Trace.Collapsible>
			<Trace.CollapsibleTrigger>
				<Trace.Line status="error">
					<Trace.Icon><CircleAlert /></Trace.Icon>
					<Trace.Title>{text("搜索问题失败", "Issue search failed")}</Trace.Title>
				</Trace.Line>
			</Trace.CollapsibleTrigger>
			<Trace.CollapsibleContent class="grid gap-2">
				<p class="text-[13px] wrap-anywhere">
					{text("示例工具暂时不可用。", "The example tool is temporarily unavailable.")}
				</p>
				<Trace.Retry
					class="justify-self-start"
					label={text("重新搜索", "Retry search")}
					messages={{
						pending: text("正在重新搜索…", "Retrying search…"),
						success: text("重新搜索成功。", "Search retried successfully."),
						error: text("重新搜索失败，可以再次尝试。", "Retry failed. Try again.")
					}}
					onRetry={retrySearch}
				/>
				<Trace.Action class="justify-self-start" variant="link" href={text("#状态", "#status")}>
					{text("查看步骤状态说明", "Read about tool states")}
				</Trace.Action>
			</Trace.CollapsibleContent>
		</Trace.Collapsible>
	</Trace.Root>
</section>
