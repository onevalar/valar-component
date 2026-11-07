<script lang="ts">
	import BoldIcon from "@lucide/svelte/icons/bold";
	import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
	import ItalicIcon from "@lucide/svelte/icons/italic";
	import UnderlineIcon from "@lucide/svelte/icons/underline";
	import * as Alert from "$lib/registry/ui/alert/index.js";
	import * as Avatar from "$lib/registry/ui/avatar/index.js";
	import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
	import * as Bubble from "$lib/registry/ui/bubble/index.js";
	import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
	import * as Card from "$lib/registry/ui/card/index.js";
	import * as Kbd from "$lib/registry/ui/kbd/index.js";
	import * as Message from "$lib/registry/ui/message/index.js";
	import * as Pagination from "$lib/registry/ui/pagination/index.js";
	import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
	import * as Resizable from "$lib/registry/ui/resizable/index.js";
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
	import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
	import { AspectRatio } from "$lib/registry/ui/aspect-ratio/index.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Progress } from "$lib/registry/ui/progress/index.js";
	import { Separator } from "$lib/registry/ui/separator/index.js";
	import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
	import { Slider } from "$lib/registry/ui/slider/index.js";
	import { Spinner } from "$lib/registry/ui/spinner/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";

	/** A small, non-interactive sample made of the real components of a category. */
	let { category }: { category: string } = $props();
</script>

<!-- `inert` keeps the samples from taking focus or clicks; the links beside them are the real entry points. -->
<div
	class="pointer-events-none flex size-full items-center justify-center select-none"
	aria-hidden="true"
	inert
>
	{#if category === "form"}
		<div class="flex w-56 flex-col gap-3">
			<Input placeholder="name@example.com" aria-label="示例输入框" tabindex={-1} />
			<div class="flex items-center gap-4">
				<Checkbox checked aria-label="示例复选框" />
				<Switch checked aria-label="示例开关" />
				<RadioGroup.Root value="a" class="flex w-auto gap-2">
					<RadioGroup.Item value="a" aria-label="示例单选 A" />
					<RadioGroup.Item value="b" aria-label="示例单选 B" />
				</RadioGroup.Root>
			</div>
			<Slider type="single" value={60} max={100} aria-label="示例滑块" />
		</div>
	{:else if category === "actions"}
		<div class="flex flex-col items-center gap-3">
			<div class="flex gap-2">
				<Button size="sm">主要</Button>
				<Button size="sm" variant="outline">次要</Button>
				<Button size="sm" variant="secondary">弱化</Button>
			</div>
			<ButtonGroup.Root>
				<Button size="sm" variant="outline">左</Button>
				<Button size="sm" variant="outline">中</Button>
				<Button size="sm" variant="outline">右</Button>
			</ButtonGroup.Root>
			<ToggleGroup.Root variant="outline" type="multiple" value={["bold"]} aria-label="示例格式">
				<ToggleGroup.Item value="bold" aria-label="加粗"><BoldIcon /></ToggleGroup.Item>
				<ToggleGroup.Item value="italic" aria-label="斜体"><ItalicIcon /></ToggleGroup.Item>
				<ToggleGroup.Item value="underline" aria-label="下划线"><UnderlineIcon /></ToggleGroup.Item>
			</ToggleGroup.Root>
		</div>
	{:else if category === "navigation"}
		<div class="flex flex-col items-center gap-4">
			<Tabs.Root value="a">
				<Tabs.List>
					<Tabs.Trigger value="a">概览</Tabs.Trigger>
					<Tabs.Trigger value="b">分析</Tabs.Trigger>
					<Tabs.Trigger value="c">设置</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>
			<Breadcrumb.Root>
				<Breadcrumb.List>
					<Breadcrumb.Item>首页</Breadcrumb.Item>
					<Breadcrumb.Separator />
					<Breadcrumb.Item>组件</Breadcrumb.Item>
					<Breadcrumb.Separator />
					<Breadcrumb.Item><Breadcrumb.Page>按钮</Breadcrumb.Page></Breadcrumb.Item>
				</Breadcrumb.List>
			</Breadcrumb.Root>
			<Pagination.Root count={30} perPage={10} page={2}>
				{#snippet children({ pages, currentPage })}
					<Pagination.Content>
						{#each pages as page (page.key)}
							{#if page.type === "page"}
								<Pagination.Item>
									<Pagination.Link {page} isActive={currentPage === page.value}
										>{page.value}</Pagination.Link
									>
								</Pagination.Item>
							{/if}
						{/each}
					</Pagination.Content>
				{/snippet}
			</Pagination.Root>
		</div>
	{:else if category === "overlay"}
		<Card.Root size="sm" class="w-52 shadow-lg">
			<Card.Header>
				<Card.Title>删除项目？</Card.Title>
				<Card.Description>此操作无法撤销。</Card.Description>
				<Card.Action><Badge variant="secondary">提示</Badge></Card.Action>
			</Card.Header>
			<Card.Footer class="justify-end gap-2">
				<Button size="xs" variant="outline">取消</Button>
				<Button size="xs">确认</Button>
			</Card.Footer>
		</Card.Root>
	{:else if category === "data"}
		<div class="flex flex-col items-center gap-3">
			<Card.Root size="sm" class="w-52">
				<Card.Header>
					<Card.Title>本月收入</Card.Title>
					<Card.Description>较上月增长 12%</Card.Description>
				</Card.Header>
			</Card.Root>
			<div class="flex items-center gap-2">
				<Badge>新</Badge>
				<Badge variant="secondary">草稿</Badge>
				<Badge variant="outline">已发布</Badge>
				<Kbd.Group><Kbd.Root>⌘</Kbd.Root><Kbd.Root>K</Kbd.Root></Kbd.Group>
			</div>
			<Avatar.Group>
				<Avatar.Root><Avatar.Fallback>AV</Avatar.Fallback></Avatar.Root>
				<Avatar.Root><Avatar.Fallback>LR</Avatar.Fallback></Avatar.Root>
				<Avatar.GroupCount>+3</Avatar.GroupCount>
			</Avatar.Group>
		</div>
	{:else if category === "layout"}
		<div class="flex w-56 flex-col items-center gap-3">
			<Resizable.PaneGroup direction="horizontal" class="h-16 rounded-md border">
				<Resizable.Pane defaultSize={35}>
					<Skeleton class="size-full rounded-none" />
				</Resizable.Pane>
				<Resizable.Handle withHandle />
				<Resizable.Pane defaultSize={65} />
			</Resizable.PaneGroup>
			<Separator />
			<AspectRatio ratio={16 / 9} class="w-24 rounded-md">
				<Skeleton class="size-full" />
			</AspectRatio>
		</div>
	{:else if category === "feedback"}
		<div class="flex w-60 flex-col gap-3">
			<Alert.Root>
				<CircleCheckIcon />
				<Alert.Title>保存成功</Alert.Title>
			</Alert.Root>
			<Progress value={64} max={100} aria-label="示例进度" />
			<div class="flex items-center gap-3">
				<Spinner />
				<Skeleton class="h-3 flex-1" />
			</div>
		</div>
	{:else if category === "chat"}
		<div class="flex w-56 flex-col gap-3">
			<Message.Root>
				<Message.Content>
					<Bubble.Root variant="muted"
						><Bubble.Content>今天有什么安排？</Bubble.Content></Bubble.Root
					>
				</Message.Content>
			</Message.Root>
			<Message.Root align="end">
				<Message.Content>
					<Bubble.Root><Bubble.Content>先整理组件库</Bubble.Content></Bubble.Root>
				</Message.Content>
			</Message.Root>
		</div>
	{:else}
		<div class="flex gap-2">
			<Skeleton class="size-10" />
			<Skeleton class="size-10" />
			<Skeleton class="size-10" />
		</div>
	{/if}
</div>
