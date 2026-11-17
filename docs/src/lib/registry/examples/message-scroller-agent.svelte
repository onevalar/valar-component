<script lang="ts">
	import * as Bubble from "$lib/registry/ui/bubble/index.js";
	import * as Scroller from "$lib/registry/ui/message-scroller/index.js";
	import * as Message from "$lib/registry/ui/message/index.js";
	import { getLocale } from "$lib/i18n/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	let lines = $state(6);
</script>

<Scroller.Provider defaultScrollPosition="start">
	<div class="grid w-full max-w-xl min-w-0 gap-3">
		<Scroller.Root class="h-72 rounded-xl border border-border">
			<Scroller.Viewport aria-label={text("对话回看", "Conversation history")}>
				<Scroller.Content class="px-3 py-4">
					{#each Array.from({ length: lines }, (_, i) => i + 1) as line (line)}
						<Scroller.Item messageId={`sample-${line}`}>
							<Message.Root appearance="agent" align={line === 1 ? "end" : "start"}>
								<Message.Content>
									<Bubble.Root appearance={line === 1 ? "agent-user" : "agent-assistant"}>
										<Bubble.Content>
											{line === 1
												? text("请检查对话的滚动。", "Review how this conversation scrolls.")
												: text(
														`回复 ${line}。回看历史时，新内容会继续追加。`,
														`Reply ${line}. New lines can arrive while you read earlier messages.`
													)}
										</Bubble.Content>
									</Bubble.Root>
								</Message.Content>
							</Message.Root>
						</Scroller.Item>
					{/each}
				</Scroller.Content>
			</Scroller.Viewport>
			<Scroller.Button
				appearance="latest"
				label={text("最新", "Latest")}
				aria-label={text("跳到最新消息", "Scroll to latest message")}
			/>
		</Scroller.Root>
		<Button class="justify-self-start" variant="outline" size="xs" onclick={() => (lines += 1)}>
			{text("追加回复", "Append reply")}
		</Button>
	</div>
</Scroller.Provider>
