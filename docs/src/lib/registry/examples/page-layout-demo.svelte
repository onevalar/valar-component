<script lang="ts">
	import SearchIcon from "@lucide/svelte/icons/search";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";
	import * as PageLayout from "$lib/registry/ui/page-layout/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";

	let query = $state("");
	let emailNotice = $state(true);
	let desktopPush = $state(false);
</script>

<PageLayout.Root width="narrow" class="py-2">
	<PageLayout.Header>
		<PageLayout.Title>工作区设置</PageLayout.Title>
		<PageLayout.Actions>
			<Button variant="outline" size="sm">重置</Button>
			<Button size="sm">保存更改</Button>
		</PageLayout.Actions>
	</PageLayout.Header>

	<PageLayout.Toolbar>
		<InputGroup.Root class="w-full sm:max-w-xs">
			<InputGroup.Addon>
				<SearchIcon />
			</InputGroup.Addon>
			<InputGroup.Input
				aria-label="筛选配置项"
				placeholder="通知、权限"
				bind:value={query}
			/>
		</InputGroup.Root>
		<Badge variant="secondary">共 2 项</Badge>
	</PageLayout.Toolbar>

	<PageLayout.Section>
		<PageLayout.SectionTitle>通知偏好</PageLayout.SectionTitle>
		<PageLayout.Section surface="card">
			<PageLayout.PropertyList layout="settings">
				<PageLayout.PropertyRow label="邮件通知">
					<Switch aria-label="邮件通知" bind:checked={emailNotice} />
				</PageLayout.PropertyRow>
				<PageLayout.PropertyRow label="桌面推送" description="仅在浏览器授权后生效">
					<Switch aria-label="桌面推送" bind:checked={desktopPush} />
				</PageLayout.PropertyRow>
			</PageLayout.PropertyList>
		</PageLayout.Section>
	</PageLayout.Section>

	<PageLayout.Section>
		<PageLayout.SectionTitle>基本信息</PageLayout.SectionTitle>
		<PageLayout.PropertyList layout="detail">
			<PageLayout.PropertyRow layout="detail" label="工作区标识">valar-core</PageLayout.PropertyRow>
			<PageLayout.PropertyRow layout="detail" label="成员数量">18</PageLayout.PropertyRow>
		</PageLayout.PropertyList>
	</PageLayout.Section>
</PageLayout.Root>
