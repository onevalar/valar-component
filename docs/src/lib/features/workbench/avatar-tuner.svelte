<script lang="ts">
	import CheckIcon from "@lucide/svelte/icons/check";
	import UsersIcon from "@lucide/svelte/icons/users";
	import * as Avatar from "$lib/registry/ui/avatar/index.js";
	import * as Item from "$lib/registry/ui/item/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { AVATAR_SIZES, AVATAR_SPEC } from "./avatar-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const brokenImage = "data:image/png;base64,broken";
	let failed = $state({ current: false, before: false });
	const members = [
		{ name: "林晓", initial: "林", image: "/avatars/01.png", detail: "设计负责人 · 在线" },
		{ name: "陈雨", initial: "陈", image: "/avatars/02.png", detail: "前端工程师 · 在线" },
		{ name: "周宁", initial: "周", image: "/avatars/03.png", detail: "产品经理 · 暂离" },
	];
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			使用本地图片和真实加载失败状态。只调整 Avatar，自带字体、状态图标与头像组重叠保持不变。
		</p>
		<section class="min-w-0 space-y-3" aria-labelledby={`${id}-${pane}-sizes`}>
			<h3 id={`${id}-${pane}-sizes`} class="text-xs text-muted-foreground">
				三档尺寸 · 图片与后备
			</h3>
			<div class="flex flex-wrap gap-6">
				{#each AVATAR_SIZES as size (size.id)}
					<div class="min-w-0 space-y-3">
						<p class="text-xs text-muted-foreground">{size.label}</p>
						<div class="flex flex-wrap items-center gap-4">
							<Avatar.Root size={size.id}>
								<Avatar.Image src="/avatars/01.png" alt="林晓" />
								<Avatar.Fallback>林</Avatar.Fallback>
							</Avatar.Root>
							<Avatar.Root size={size.id} aria-label="陈雨，图片加载失败">
								<Avatar.Image src={brokenImage} alt="陈雨" />
								<Avatar.Fallback>陈</Avatar.Fallback>
							</Avatar.Root>
						</div>
					</div>
				{/each}
			</div>
		</section>
		<section class="min-w-0 space-y-3" aria-labelledby={`${id}-${pane}-badge`}>
			<h3 id={`${id}-${pane}-badge`} class="text-xs text-muted-foreground">
				状态标记 · 有图标／无图标
			</h3>
			<div class="flex flex-wrap gap-6">
				{#each AVATAR_SIZES as size (size.id)}
					<div class="min-w-0 space-y-3">
						<p class="text-xs text-muted-foreground">{size.label}</p>
						<div class="flex flex-wrap items-center gap-4">
							<Avatar.Root size={size.id} aria-label="林晓，已验证">
								<Avatar.Image src="/avatars/01.png" alt="林晓" />
								<Avatar.Fallback>林</Avatar.Fallback>
								<Avatar.Badge aria-label="已验证"><CheckIcon aria-hidden="true" /></Avatar.Badge>
							</Avatar.Root>
							<Avatar.Root size={size.id} aria-label="陈雨，在线">
								<Avatar.Image src="/avatars/02.png" alt="陈雨" />
								<Avatar.Fallback>陈</Avatar.Fallback>
								<Avatar.Badge aria-label="在线" />
							</Avatar.Root>
						</div>
					</div>
				{/each}
			</div>
		</section>
		<section class="min-w-0 space-y-3" aria-labelledby={`${id}-${pane}-groups`}>
			<h3 id={`${id}-${pane}-groups`} class="text-xs text-muted-foreground">
				头像组 · 数量与图标计数
			</h3>
			<div class="grid min-w-0 gap-4">
				{#each AVATAR_SIZES as size (size.id)}
					<div class="min-w-0 space-y-2">
						<p class="text-xs text-muted-foreground">{size.label}</p>
						<div class="flex min-w-0 flex-wrap gap-6">
							{#each [false, true] as icon (icon)}
								<Avatar.Group aria-label={`${size.label}尺寸协作成员`}>
									{#each members.slice(0, 2) as member (member.name)}
										<Avatar.Root size={size.id}>
											<Avatar.Image src={member.image} alt={member.name} />
											<Avatar.Fallback>{member.initial}</Avatar.Fallback>
										</Avatar.Root>
									{/each}
									<Avatar.GroupCount aria-label="另外 3 位成员">
										{#if icon}<UsersIcon aria-hidden="true" />{:else}+3{/if}
									</Avatar.GroupCount>
								</Avatar.Group>
							{/each}
						</div>
					</div>
				{/each}
				<div class="min-w-0 space-y-2">
					<p class="text-xs text-muted-foreground">混合尺寸 · 计数沿用小尺寸优先级</p>
					<Avatar.Group aria-label="混合尺寸协作成员">
						{#each ["lg", "sm"] as size (size)}
							<Avatar.Root size={size === "lg" ? "lg" : "sm"}>
								<Avatar.Image src="/avatars/03.png" alt="周宁" />
								<Avatar.Fallback>周</Avatar.Fallback>
							</Avatar.Root>
						{/each}
						<Avatar.GroupCount aria-label="另外 3 位成员"
							><UsersIcon aria-hidden="true" /></Avatar.GroupCount
						>
					</Avatar.Group>
				</div>
			</div>
		</section>
		<section class="min-w-0 space-y-3" aria-labelledby={`${id}-${pane}-members`}>
			<h3 id={`${id}-${pane}-members`} class="text-xs text-muted-foreground">
				成员列表 · 真实图片失败／恢复
			</h3>
			<div class="flex flex-wrap">
				<Button
					type="button"
					aria-pressed={failed[pane]}
					onclick={() => (failed[pane] = !failed[pane])}
				>
					{failed[pane] ? "恢复成员图片" : "模拟成员图片失败"}
				</Button>
			</div>
			<p role="status" class="text-xs text-muted-foreground">
				{failed[pane] ? "本画布成员图片加载失败，显示姓名后备。" : "本画布使用本地成员图片。"}
			</p>
			<Item.Group>
				{#each members as member, index (member.name)}
					<Item.Root role="listitem" variant="outline">
						<Item.Media>
							{#key failed[pane]}
								<Avatar.Root size={AVATAR_SIZES[index].id}>
									<Avatar.Image src={failed[pane] ? brokenImage : member.image} alt="" />
									<Avatar.Fallback>{member.initial}</Avatar.Fallback>
									{#if index < 2}<Avatar.Badge aria-label="在线" />{/if}
								</Avatar.Root>
							{/key}
						</Item.Media>
						<Item.Content class="min-w-0 break-words">
							<Item.Title>{member.name}</Item.Title>
							<Item.Description>{member.detail}</Item.Description>
						</Item.Content>
					</Item.Root>
				{/each}
			</Item.Group>
		</section>
	</div>
{/snippet}

<ComponentTuner spec={AVATAR_SPEC} {canvas}>{@render children()}</ComponentTuner>
