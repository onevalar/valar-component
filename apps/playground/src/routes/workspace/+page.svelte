<script lang="ts">
	import * as AlertDialog from "@valar/svelte-ui/alert-dialog";
	import { Badge } from "@valar/svelte-ui/badge";
	import * as Breadcrumb from "@valar/svelte-ui/breadcrumb";
	import { Button } from "@valar/svelte-ui/button";
	import { Checkbox } from "@valar/svelte-ui/checkbox";
	import * as Dialog from "@valar/svelte-ui/dialog";
	import * as Empty from "@valar/svelte-ui/empty";
	import * as Field from "@valar/svelte-ui/field";
	import { Input } from "@valar/svelte-ui/input";
	import * as PageLayout from "@valar/svelte-ui/page-layout";
	import * as RadioGroup from "@valar/svelte-ui/radio-group";
	import * as Sheet from "@valar/svelte-ui/sheet";
	import * as Table from "@valar/svelte-ui/table";
	import * as ToggleGroup from "@valar/svelte-ui/toggle-group";

	type Role = "所有者" | "管理员" | "成员" | "访客";
	type Member = {
		id: string;
		name: string;
		email: string;
		role: Role;
		status: "已加入" | "待接受";
		joinedAt: string;
	};

	const ROLES: readonly Role[] = ["所有者", "管理员", "成员", "访客"];

	let members = $state<Member[]>([
		{ id: "m1", name: "林知夏", email: "zhixia.lin@valar.dev", role: "所有者", status: "已加入", joinedAt: "2024-11-08" },
		{ id: "m2", name: "陈叙白", email: "xubai.chen@valar.dev", role: "管理员", status: "已加入", joinedAt: "2025-01-16" },
		{ id: "m3", name: "顾明川", email: "mingchuan.gu@valar.dev", role: "管理员", status: "已加入", joinedAt: "2025-03-22" },
		{ id: "m4", name: "周明远", email: "mingyuan.zhou@valar.dev", role: "成员", status: "已加入", joinedAt: "2025-06-05" },
		{ id: "m5", name: "沈清越", email: "qingyue.shen@valar.dev", role: "成员", status: "待接受", joinedAt: "—" },
		{ id: "m6", name: "许嘉禾", email: "jiahe.xu@valar.dev", role: "访客", status: "已加入", joinedAt: "2026-01-19" },
	]);

	let query = $state("");
	let roleFilter = $state("全部");
	let selectedIds = $state<string[]>([]);
	let dark = $state(false);
	let feedback = $state("");

	// Invite dialog state
	let inviteOpen = $state(false);
	let inviteName = $state("");
	let inviteEmail = $state("");
	let inviteRole = $state<Role>("成员");
	let inviteError = $state("");

	// Detail sheet state
	let activeMemberId = $state<string | null>(null);
	const activeMember = $derived(members.find((m) => m.id === activeMemberId) ?? null);

	$effect(() => {
		document.documentElement.classList.toggle("dark", dark);
	});

	const filtered = $derived(
		members.filter((item) => {
			const matchRole = roleFilter === "全部" || item.role === roleFilter;
			const q = query.trim().toLowerCase();
			const matchQuery =
				!q || item.name.toLowerCase().includes(q) || item.email.toLowerCase().includes(q);
			return matchRole && matchQuery;
		})
	);

	const selectableIds = $derived(filtered.filter((m) => m.role !== "所有者").map((m) => m.id));
	const allSelected = $derived(
		selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id))
	);

	function toggleOne(id: string, checked: boolean) {
		selectedIds = checked
			? [...new Set([...selectedIds, id])]
			: selectedIds.filter((item) => item !== id);
	}

	function toggleAll(checked: boolean) {
		selectedIds = checked ? [...selectableIds] : [];
	}

	function submitInvite(event: SubmitEvent) {
		event.preventDefault();
		const name = inviteName.trim();
		const email = inviteEmail.trim();
		if (!name || !email.includes("@")) {
			inviteError = "请填写成员姓名与有效邮箱地址（如 name@company.com）。";
			return;
		}
		members = [
			...members,
			{
				id: `m-${Date.now()}`,
				name,
				email,
				role: inviteRole,
				status: "待接受",
				joinedAt: "—",
			},
		];
		inviteName = "";
		inviteEmail = "";
		inviteRole = "成员";
		inviteError = "";
		inviteOpen = false;
		feedback = `已向 ${email} 发送邀请`;
	}

	function removeSelected() {
		const count = selectedIds.length;
		members = members.filter((item) => !selectedIds.includes(item.id));
		if (activeMemberId && selectedIds.includes(activeMemberId)) activeMemberId = null;
		selectedIds = [];
		feedback = `已移除 ${count} 位成员`;
	}

	function updateRole(id: string, role: Role) {
		members = members.map((item) => (item.id === id ? { ...item, role } : item));
		feedback = "已更新成员角色";
	}
</script>

<svelte:head>
	<title>成员与权限 · Valar 业务落地方案</title>
</svelte:head>

<main class="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item>
					<Breadcrumb.Link href="/">消费端首页</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
					<Breadcrumb.Page>成员与权限</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>

		<div class="flex items-center gap-2">
			<Button variant="ghost" size="sm" href="/settings">工作区设置</Button>
			<Button variant="outline" size="sm" aria-pressed={dark} onclick={() => (dark = !dark)}>
				{dark ? "浅色" : "深色"}
			</Button>
		</div>
	</div>

	<PageLayout.Root width="full">
		<PageLayout.Header>
			<PageLayout.Title>成员与权限</PageLayout.Title>
			<PageLayout.Actions>
				<Dialog.Root bind:open={inviteOpen}>
					<Dialog.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="default" size="sm">邀请成员</Button>
						{/snippet}
					</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>邀请成员</Dialog.Title>
						</Dialog.Header>
						<form class="flex flex-col gap-4" onsubmit={submitInvite}>
							<Field.FieldGroup>
								<Field.Field data-invalid={inviteError ? true : undefined}>
									<Field.Label for="invite-name">姓名</Field.Label>
									<Input
										id="invite-name"
										bind:value={inviteName}
										placeholder="林知夏"
										aria-invalid={inviteError ? true : undefined}
									/>
								</Field.Field>
								<Field.Field data-invalid={inviteError ? true : undefined}>
									<Field.Label for="invite-email">工作邮箱</Field.Label>
									<Input
										id="invite-email"
										type="email"
										bind:value={inviteEmail}
										placeholder="name@company.com"
										aria-invalid={inviteError ? true : undefined}
									/>
									{#if inviteError}
										<Field.Error>{inviteError}</Field.Error>
									{/if}
								</Field.Field>
								<Field.Set>
									<Field.Legend variant="label">分配角色</Field.Legend>
									<RadioGroup.Root bind:value={inviteRole}>
										{#each ["管理员", "成员", "访客"] as role (role)}
											<Field.Field orientation="horizontal">
												<RadioGroup.Item value={role} id={`invite-role-${role}`} />
												<Field.Label for={`invite-role-${role}`}>{role}</Field.Label>
											</Field.Field>
										{/each}
									</RadioGroup.Root>
								</Field.Set>
							</Field.FieldGroup>
							<Dialog.Footer>
								<Dialog.Close>
									{#snippet child({ props })}
										<Button {...props} type="button" variant="outline">取消</Button>
									{/snippet}
								</Dialog.Close>
								<Button type="submit">发送邀请</Button>
							</Dialog.Footer>
						</form>
					</Dialog.Content>
				</Dialog.Root>
			</PageLayout.Actions>
		</PageLayout.Header>

		<PageLayout.Toolbar>
			<div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
				<Input
					aria-label="按姓名或邮箱筛选成员"
					placeholder="林知夏 / name@company.com"
					bind:value={query}
					class="w-full sm:w-64"
				/>
				<ToggleGroup.Root
					type="single"
					variant="outline"
					aria-label="按角色筛选"
					value={roleFilter}
					onValueChange={(value) => {
						if (value) roleFilter = value;
					}}
				>
					<ToggleGroup.Item value="全部">全部</ToggleGroup.Item>
					{#each ROLES as role (role)}
						<ToggleGroup.Item value={role}>{role}</ToggleGroup.Item>
					{/each}
				</ToggleGroup.Root>
			</div>

			<div class="flex shrink-0 items-center gap-2">
				{#if selectedIds.length > 0}
					<Badge variant="secondary" class="tabular-nums">已选 {selectedIds.length} 位</Badge>
					<Button variant="ghost" size="sm" onclick={() => (selectedIds = [])}>取消选择</Button>
					<AlertDialog.Root>
						<AlertDialog.Trigger>
							{#snippet child({ props })}
								<Button {...props} variant="destructive" size="sm">批量移除</Button>
							{/snippet}
						</AlertDialog.Trigger>
						<AlertDialog.Content appearance="danger" focusCancel>
							<AlertDialog.Header>
								<AlertDialog.Title>移除所选成员</AlertDialog.Title>
								<AlertDialog.Description>
									将移除已选的 {selectedIds.length} 位成员，他们将立即失去此工作区访问权限。
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel>取消</AlertDialog.Cancel>
								<AlertDialog.Action variant="destructive" onclick={removeSelected}>
									移除成员
								</AlertDialog.Action>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				{:else}
					<Badge variant="secondary" class="tabular-nums">共 {filtered.length} 位成员</Badge>
				{/if}
			</div>
		</PageLayout.Toolbar>

		{#if feedback}
			<p role="status" class="text-xs text-muted-foreground">{feedback}</p>
		{/if}

		{#if filtered.length === 0}
			<Empty.Root>
				<Empty.Header>
					<Empty.Title>没有匹配的成员</Empty.Title>
					<Empty.Description>调整搜索关键词或切换角色筛选后再试。</Empty.Description>
				</Empty.Header>
				<Empty.Content>
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							query = "";
							roleFilter = "全部";
						}}
					>
						清除筛选
					</Button>
				</Empty.Content>
			</Empty.Root>
		{:else}
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-10">
							<Checkbox
								aria-label="全选当前列表成员"
								checked={allSelected}
								onCheckedChange={(v) => toggleAll(Boolean(v))}
							/>
						</Table.Head>
						<Table.Head>成员</Table.Head>
						<Table.Head>邮箱</Table.Head>
						<Table.Head>角色</Table.Head>
						<Table.Head>状态</Table.Head>
						<Table.Head class="text-end">加入时间</Table.Head>
						<Table.Head class="text-end">操作</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each filtered as member (member.id)}
						<Table.Row>
							<Table.Cell>
								<Checkbox
									aria-label={`选择 ${member.name}`}
									disabled={member.role === "所有者"}
									checked={selectedIds.includes(member.id)}
									onCheckedChange={(v) => toggleOne(member.id, Boolean(v))}
								/>
							</Table.Cell>
							<Table.Cell class="font-medium">{member.name}</Table.Cell>
							<Table.Cell class="text-muted-foreground">{member.email}</Table.Cell>
							<Table.Cell>
								<Badge variant="secondary">{member.role}</Badge>
							</Table.Cell>
							<Table.Cell>
								<Badge variant="outline">{member.status}</Badge>
							</Table.Cell>
							<Table.Cell class="text-end tabular-nums text-muted-foreground">
								{member.joinedAt}
							</Table.Cell>
							<Table.Cell class="text-end">
								<Button
									variant="ghost"
									size="xs"
									onclick={() => (activeMemberId = member.id)}
								>
									详情
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		{/if}
	</PageLayout.Root>

	<Sheet.Root
		open={activeMember !== null}
		onOpenChange={(open) => {
			if (!open) activeMemberId = null;
		}}
	>
		<Sheet.Content side="right">
			{#if activeMember}
				<Sheet.Header>
					<Sheet.Title>{activeMember.name}</Sheet.Title>
				</Sheet.Header>
				<div class="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4">
					<PageLayout.PropertyList layout="detail">
						<PageLayout.PropertyRow layout="detail" label="邮箱">
							{activeMember.email}
						</PageLayout.PropertyRow>
						<PageLayout.PropertyRow layout="detail" label="状态">
							{activeMember.status}
						</PageLayout.PropertyRow>
						<PageLayout.PropertyRow layout="detail" label="加入时间">
							{activeMember.joinedAt}
						</PageLayout.PropertyRow>
					</PageLayout.PropertyList>

					{#if activeMember.role !== "所有者"}
						<Field.Set>
							<Field.Legend variant="label">调整角色</Field.Legend>
							<RadioGroup.Root
								value={activeMember.role}
								onValueChange={(value) => updateRole(activeMember.id, value as Role)}
							>
								{#each ["管理员", "成员", "访客"] as role (role)}
									<Field.Field orientation="horizontal">
										<RadioGroup.Item value={role} id={`sheet-role-${role}`} />
										<Field.Label for={`sheet-role-${role}`}>{role}</Field.Label>
									</Field.Field>
								{/each}
							</RadioGroup.Root>
						</Field.Set>
					{/if}
				</div>
			{/if}
		</Sheet.Content>
	</Sheet.Root>
</main>
