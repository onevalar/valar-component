<script lang="ts">
	import { getLocale } from "$lib/i18n/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import * as Card from "$lib/registry/ui/card/index.js";
	import { RulerSlider } from "$lib/registry/ui/ruler-slider/index.js";

	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	let budget = $state(12.5);
	let saved = $state("");

	function save(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
		event.preventDefault();
		saved = String(new FormData(event.currentTarget).get("budget") ?? "");
	}
</script>

<Card.Root class="w-full max-w-md">
	<Card.Header>
		<Card.Title>{text("项目预算", "Project budget")}</Card.Title>
		<Card.Description>
			{text("用尺带调节预算，或聚焦后按方向键。", "Drag the tape, or focus it and use the arrow keys.")}
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<form class="grid min-w-0 gap-3" onsubmit={save}>
			<RulerSlider
				label={text("每日预算上限", "Daily budget limit")}
				name="budget"
				bind:value={budget}
				max={24.75}
				step={0.5}
				majorEvery={5}
				largeStep={5}
				unit="USD"
			/>
			<RulerSlider
				label={text("团队级上限", "Team limit")}
				defaultValue={20}
				unit="USD"
				disabled
			/>
			<div class="flex flex-wrap items-center gap-2">
				<Button type="submit">{text("保存", "Save")}</Button>
				<Button type="button" variant="outline" onclick={() => (budget = 12.5)}>
					{text("恢复默认", "Restore default")}
				</Button>
				<output class="text-xs text-muted-foreground">
					{#if saved}{text("已保存", "Saved")} {saved} USD{/if}
				</output>
			</div>
		</form>
	</Card.Content>
</Card.Root>
