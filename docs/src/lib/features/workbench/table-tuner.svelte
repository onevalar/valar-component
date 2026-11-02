<script lang="ts">
	import * as Empty from "$lib/registry/ui/empty/index.js";
	import * as Table from "$lib/registry/ui/table/index.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { TABLE_SPEC } from "./table-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const invoices = [
		{ id: "INV-103", project: "组件文档", status: "已支付", amount: 1280 },
		{ id: "INV-207", project: "图标资源", status: "待支付", amount: 83.2 },
		{ id: "INV-312", project: "测试服务", status: "已退款", amount: 12.5 },
	];
	const money = new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" });
	const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
	let checked = $state({
		current: { header: false, first: true },
		before: { header: false, first: true },
	});
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			表头高度是下限，内容较高时行会自然长高；数据格留白同样作用于页脚。只调整几何，不改变列定义、排序、筛选或分页。
		</p>
		<Table.Root class="min-w-[40rem]" data-table-invoices>
			<Table.Caption>近期账单 · 金额使用人民币，窄画布在表格容器内横向滚动</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head scope="col">账单编号</Table.Head>
					<Table.Head scope="col">项目名称</Table.Head>
					<Table.Head scope="col">状态</Table.Head>
					<Table.Head scope="col" class="text-end">金额</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each invoices as invoice (invoice.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{invoice.id}</Table.Cell>
						<Table.Cell>{invoice.project}</Table.Cell>
						<Table.Cell><Badge variant="secondary">{invoice.status}</Badge></Table.Cell>
						<Table.Cell class="text-end tabular-nums">{money.format(invoice.amount)}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
			<Table.Footer>
				<Table.Row>
					<Table.Cell colspan={3}>合计</Table.Cell>
					<Table.Cell class="text-end tabular-nums">{money.format(total)}</Table.Cell>
				</Table.Row>
			</Table.Footer>
		</Table.Root>
		<Table.Root class="min-w-[30rem]" data-table-controls>
			<Table.Caption>嵌入控件的留白示例 · 复选框独立，不执行行选择或全选</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head scope="col">
						<Checkbox aria-label="核对表头示例" bind:checked={checked[pane].header} />
					</Table.Head>
					<Table.Head scope="col">样式示例</Table.Head>
					<Table.Head scope="col">状态说明</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<Table.Row data-state="selected">
					<Table.Cell
						><Checkbox aria-label="核对第一项" bind:checked={checked[pane].first} /></Table.Cell
					>
					<Table.Cell>已选行背景</Table.Cell>
					<Table.Cell>固定展示 data-state，不与复选框绑定</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell><Checkbox aria-label="不可核对项" disabled /></Table.Cell>
					<Table.Cell>禁用控件</Table.Cell>
					<Table.Cell>保留控件自身键盘与焦点行为</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
		<Table.Root data-table-empty>
			<Table.Caption>空账单示例</Table.Caption>
			<Table.Header>
				<Table.Row
					><Table.Head scope="col">账单</Table.Head><Table.Head scope="col">金额</Table.Head
					></Table.Row
				>
			</Table.Header>
			<Table.Body>
				<Table.Row>
					<Table.Cell colspan={2} class="whitespace-normal">
						<Empty.Root class="border-0 p-4">
							<Empty.Header>
								<Empty.Title>暂无账单</Empty.Title>
								<Empty.Description>新的账单会显示在这里。</Empty.Description>
							</Empty.Header>
						</Empty.Root>
					</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
	</div>
{/snippet}

<ComponentTuner spec={TABLE_SPEC} {canvas}>{@render children()}</ComponentTuner>
