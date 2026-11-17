<script lang="ts">
	import * as Accordion from "$lib/registry/ui/accordion/index.js";
	import { getLocale } from "$lib/i18n/index.js";

	const chinese = $derived(getLocale() === "zh");
</script>

<Accordion.Root
	type="multiple"
	value={["implementation"]}
	appearance="section"
	class="max-w-lg gap-4"
	role="group"
	aria-label={chinese ? "文档折叠区块" : "Document sections"}
>
	<Accordion.Item value="implementation">
		<Accordion.Trigger>
			<span>{chinese ? "实现说明" : "Implementation notes"}</span>
		</Accordion.Trigger>
		<Accordion.Content>
			<p>{chinese ? "保存前检查输入。" : "Check inputs before saving."}</p>
		</Accordion.Content>
	</Accordion.Item>
	<Accordion.Item value="validation">
		<Accordion.Trigger>
			<span
				>{chinese
					? "在窄屏上需要完整阅读的补充验证说明"
					: "Additional validation notes for reviewing the narrow layout"}</span
			>
		</Accordion.Trigger>
		<Accordion.Content>
			<p>
				{chinese
					? "用键盘打开区块，检查标题与正文对齐。"
					: "Open the section with the keyboard and check that its content aligns with the title."}
			</p>
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
