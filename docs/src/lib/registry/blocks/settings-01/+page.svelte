<script lang="ts">
	import * as Card from "$lib/registry/ui/card/index.js";
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as Select from "$lib/registry/ui/select/index.js";
	import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Separator } from "$lib/registry/ui/separator/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";

	let { chinese = false }: { chinese?: boolean } = $props();
	const id = $props.id();
	const shellId = `${id}-shell`;
	let section = $state("general");
	let theme = $state("system");
	let emoji = $state(true);
	let pointer = $state(false);
	const sections = $derived([
		{ key: "general", label: chinese ? "常规" : "General" },
		{ key: "appearance", label: chinese ? "界面与主题" : "Appearance" },
		{ key: "access", label: chinese ? "访问权限" : "Access" },
	]);
	const themes = $derived([
		{ value: "system", label: chinese ? "跟随系统" : "System preference" },
		{ value: "light", label: chinese ? "浅色" : "Light" },
		{ value: "dark", label: chinese ? "深色" : "Dark" },
	]);
	const row = "min-h-16 items-start! justify-between gap-3 p-4 @md/field-group:items-center!";
	const tokens = `
		--sidebar: light-dark(lch(93.83% .5 282), lch(2.5% .4 272));
		--sidebar-foreground: light-dark(lch(37.776% 1.25 282), lch(61.803% 1.2 272));
		--sidebar-accent: light-dark(lch(89.54% .5 282), lch(13.845% 1.3 272));
		--sidebar-accent-foreground: light-dark(lch(9.444% 0 282), white);
		--card: light-dark(white, lch(9.232% .85 272));
		--valar-settings-card-surface: var(--card);
		--card-foreground: light-dark(lch(9.794% 0 282), white);
		--muted-foreground: light-dark(lch(39.176% 1.25 282), lch(61.803% 1.2 272));
		--border: light-dark(lch(92.5% 0 282), lch(18.5% .85 272));
		--settings-panel: light-dark(lch(97.94% .5 282), lch(5.52% .4 272));
		--settings-card-shadow: 0 0 0 .5px light-dark(rgb(0 0 0 / .088), rgb(255 255 255 / .083)), 0 .5px 1px 1px light-dark(transparent, rgb(0 0 0 / .3)), 0 3px 6px -2px light-dark(rgb(0 0 0 / .02), transparent), 0 1px 1px light-dark(rgb(0 0 0 / .04), transparent);
		--settings-control: light-dark(white, lch(13.861% 1.139 272));
		--settings-control-hover: light-dark(lch(95% .5 282), lch(18.49% 1.525 272));
		--settings-control-text: light-dark(lch(20% 1 282), lch(90.826% 1.425 272));
		--settings-control-shadow: 0 0 0 .5px light-dark(#00000024, #ffffff26);
		--settings-menu: light-dark(white, lch(16.433% 1.3 272));
		--settings-menu-highlight: light-dark(lch(94% .5 282), lch(25.69% 1.975 272));
		--settings-menu-border: light-dark(lch(86.5% 0 282), lch(38.032% 2.38 272));
		--settings-menu-shadow: 0 0 0 .5px var(--settings-menu-border), 0 6px 18px light-dark(rgb(0 0 0 / .02), transparent), 0 3px 9px light-dark(rgb(0 0 0 / .04), transparent), 0 3px 8px light-dark(transparent, rgb(0 0 0 / .125)), 0 2px 5px light-dark(transparent, rgb(0 0 0 / .125)), 0 1px 1px light-dark(rgb(0 0 0 / .04), rgb(0 0 0 / .125));
		--settings-focus: light-dark(lch(53% 52.26 286.91), lch(47.918% 59.303 288.421));
		--settings-switch-off: light-dark(lch(82.484% .054 281.837), lch(47.551% .913 271.998));
	`;
</script>

<Sidebar.Provider
	id={shellId}
	style="--sidebar-width: 204px; {tokens} {theme === 'system' ? '' : `color-scheme: ${theme};`}"
	persistState={false}
	keyboardShortcut={false}
	class="min-h-0 flex-col rounded-xl border bg-sidebar [color-scheme:light] md:h-[680px] md:flex-row dark:[color-scheme:dark]"
>
	<Sidebar.Root
		collapsible="none"
		class="w-full rounded-t-xl md:w-(--sidebar-width) md:rounded-l-xl md:rounded-tr-none"
	>
		<Sidebar.Header class="gap-1 px-3 pt-4 pb-2">
			<span class="px-2.5 text-[13px] font-semibold text-sidebar-accent-foreground">
				{chinese ? "个人设置" : "Personal settings"}
			</span>
		</Sidebar.Header>
		<Sidebar.Content class="px-3 pb-3">
			<nav aria-label={chinese ? "设置导航" : "Settings navigation"}>
				<Sidebar.Menu class="flex-row flex-wrap gap-1 md:flex-col">
					{#each sections as item (item.key)}
						<Sidebar.MenuItem class="shrink-0">
							<Sidebar.MenuButton
								size="sm"
								isActive={section === item.key}
								class="rounded-[8px] px-2.5 py-0 text-[13px] [&_svg]:size-3.5"
							>
								{#snippet child({ props })}
									<a
										{...props}
										href="#{id}-{item.key}"
										aria-current={section === item.key ? "location" : undefined}
										onclick={() => (section = item.key)}
									>
										{#if item.key === "general"}
											<IconPlaceholder
												lucide="Settings2Icon"
												tabler="IconSettings"
												hugeicons="Settings05Icon"
												phosphor="GearIcon"
												remixicon="RiSettingsLine"
												aria-hidden="true"
											/>
										{:else if item.key === "appearance"}
											<IconPlaceholder
												lucide="SunIcon"
												tabler="IconSun"
												hugeicons="Sun03Icon"
												phosphor="SunIcon"
												remixicon="RiSunLine"
												aria-hidden="true"
											/>
										{:else}
											<IconPlaceholder
												lucide="ShieldIcon"
												tabler="IconShield"
												hugeicons="ShieldIcon"
												phosphor="ShieldIcon"
												remixicon="RiShieldLine"
												aria-hidden="true"
											/>
										{/if}
										<span>{item.label}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</nav>
		</Sidebar.Content>
	</Sidebar.Root>

	<div
		class="min-w-0 flex-1 rounded-b-xl border-t bg-(--settings-panel) text-card-foreground md:overflow-y-auto md:rounded-l-none md:rounded-r-xl md:border-t-0 md:border-l"
	>
		<div class="mx-auto max-w-[688px] space-y-8 px-4 py-6 sm:px-6 sm:py-9">
			<h2 class="text-2xl font-semibold tracking-tight">{chinese ? "偏好设置" : "Preferences"}</h2>
			<section id="{id}-general" class="scroll-mt-20 space-y-3">
				<h3 class="px-4 text-[15px] font-semibold">{sections[0].label}</h3>
				<Card.Root size="settings">
					<Card.Content>
						<Field.Group class="gap-0">
							<Field.Field orientation="responsive" class={row}>
								<Field.Content>
									<Field.Label for="{id}-emoji" class="text-[13px]"
										>{chinese
											? "将表情符号转换为 Emoji"
											: "Convert emoticons to emoji"}</Field.Label
									>
									<Field.Description id="{id}-emoji-description" class="text-[13px]"
										>{chinese
											? "输入时自动转换常见表情。"
											: "Replace common emoticons as you type."}</Field.Description
									>
								</Field.Content>
								<div class="flex shrink-0 items-center">
									<Switch
										id="{id}-emoji"
										appearance="settings"
										aria-describedby="{id}-emoji-description"
										bind:checked={emoji}
									/>
								</div>
							</Field.Field>
						</Field.Group>
					</Card.Content>
				</Card.Root>
			</section>

			<section id="{id}-appearance" class="scroll-mt-20 space-y-3">
				<h3 class="px-4 text-[15px] font-semibold">{sections[1].label}</h3>
				<Card.Root size="settings">
					<Card.Content>
						<Field.Group class="gap-0">
							<Field.Field orientation="responsive" class={row}>
								<Field.Content>
									<Field.Label for="{id}-theme" class="text-[13px]"
										>{chinese ? "界面主题" : "Interface theme"}</Field.Label
									>
									<Field.Description id="{id}-theme-description" class="text-[13px]"
										>{chinese
											? "选择偏好选项。"
											: "Choose your preferred appearance."}</Field.Description
									>
								</Field.Content>
								<Select.Root type="single" items={themes} bind:value={theme}>
									<Select.Trigger
										id="{id}-theme"
										size="settings"
										aria-describedby="{id}-theme-description"
										class="w-full @md/field-group:w-auto"
									>
										<Select.Value />
									</Select.Trigger>
									<Select.Content
										appearance="settings"
										portalProps={{ to: `[id="${shellId}"]` }}
										style="--valar-select-menu-border: var(--settings-menu-border)"
										align="end"
										class="min-w-[202px]"
									>
										{#each themes as item (item.value)}
											<Select.Item value={item.value} label={item.label} />
										{/each}
									</Select.Content>
								</Select.Root>
							</Field.Field>
							<Separator decorative class="mx-4 data-horizontal:w-auto" />
							<Field.Field orientation="responsive" class={row}>
								<Field.Label for="{id}-pointer" class="text-[13px]"
									>{chinese ? "使用指针光标" : "Use pointer cursors"}</Field.Label
								>
								<div class="flex shrink-0 items-center">
									<Switch id="{id}-pointer" appearance="settings" bind:checked={pointer} />
								</div>
							</Field.Field>
						</Field.Group>
					</Card.Content>
				</Card.Root>
			</section>

			<section id="{id}-access" class="scroll-mt-20 space-y-3">
				<h3 class="px-4 text-[15px] font-semibold">{sections[2].label}</h3>
				<Card.Root size="settings">
					<Card.Content>
						<Field.Group class="gap-0">
							<Field.Field orientation="responsive" data-disabled="true" class={row}>
								<Field.Content>
									<Field.Label for="{id}-access-switch" class="text-[13px]"
										>{chinese ? "限制工作区访问" : "Restrict workspace access"}</Field.Label
									>
									<Field.Description id="{id}-access-description" class="text-[13px]"
										>{chinese
											? "需要管理员权限"
											: "Administrator access required"}</Field.Description
									>
								</Field.Content>
								<div class="flex shrink-0 items-center">
									<Switch
										id="{id}-access-switch"
										appearance="settings"
										aria-describedby="{id}-access-description"
										disabled
									/>
								</div>
							</Field.Field>
						</Field.Group>
					</Card.Content>
				</Card.Root>
			</section>
		</div>
	</div>
</Sidebar.Provider>
