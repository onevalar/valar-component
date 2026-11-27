<script lang="ts">
	import * as AlertDialog from "@valar/svelte-ui/alert-dialog";
	import * as Breadcrumb from "@valar/svelte-ui/breadcrumb";
	import * as Field from "@valar/svelte-ui/field";
	import * as PageLayout from "@valar/svelte-ui/page-layout";
	import * as Select from "@valar/svelte-ui/select";
	import { Button } from "@valar/svelte-ui/button";
	import { Input } from "@valar/svelte-ui/input";
	import { Separator } from "@valar/svelte-ui/separator";
	import { Switch } from "@valar/svelte-ui/switch";
	import { tick } from "svelte";

	const LANGUAGES = [
		{ value: "zh-CN", label: "简体中文" },
		{ value: "zh-TW", label: "繁體中文" },
		{ value: "en-US", label: "English" },
		{ value: "ja-JP", label: "日本語" },
		{ value: "ko-KR", label: "한국어" },
		{ value: "de-DE", label: "Deutsch" },
	];
	const nameSegmenter = new Intl.Segmenter("zh");

	let workspaceName = $state("Valar 产品组");
	let nameInput = $state<HTMLInputElement | null>(null);
	let language = $state("zh-CN");
	let emailNotice = $state(true);
	let desktopPush = $state(false);
	let nameError = $state("");
	let savedNote = $state("");
	let dark = $state(false);

	$effect(() => {
		document.documentElement.classList.toggle("dark", dark);
	});

	async function handleSave(event: SubmitEvent) {
		event.preventDefault();
		const length = Array.from(nameSegmenter.segment(workspaceName.trim())).length;
		if (length < 2 || length > 40) {
			savedNote = "";
			nameError = length === 0 ? "工作区名称不能为空。" : "工作区名称必须为 2–40 字。";
			await tick();
			nameInput?.focus();
			return;
		}
		nameError = "";
		savedNote = "已保存工作区设置";
	}

	function handleReset() {
		workspaceName = "Valar 产品组";
		language = "zh-CN";
		emailNotice = true;
		desktopPush = false;
		nameError = "";
		savedNote = "已重置为默认配置";
	}
</script>

<svelte:head>
	<title>工作区设置 · Valar 业务落地方案</title>
</svelte:head>

<main class="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-8">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item>
					<Breadcrumb.Link href="/">消费端首页</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
					<Breadcrumb.Page>工作区设置</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>

		<div class="flex items-center gap-2">
			<Button variant="ghost" size="sm" href="/workspace">成员与权限</Button>
			<Button variant="outline" size="sm" aria-pressed={dark} onclick={() => (dark = !dark)}>
				{dark ? "浅色" : "深色"}
			</Button>
		</div>
	</div>

	<PageLayout.Root width="narrow">
		<form class="flex flex-col gap-6" novalidate onsubmit={handleSave}>
			<PageLayout.Header>
				<PageLayout.Title>工作区设置</PageLayout.Title>
				<PageLayout.Actions>
					<Button type="button" variant="outline" size="sm" onclick={handleReset}>重置</Button>
					<Button type="submit" size="sm">保存更改</Button>
				</PageLayout.Actions>
			</PageLayout.Header>

			<p role="status" class="text-xs text-muted-foreground empty:sr-only">{savedNote}</p>

			<PageLayout.Section>
				<PageLayout.SectionTitle>基础信息</PageLayout.SectionTitle>
				<PageLayout.Section surface="card" class="gap-4 p-4">
					<Field.FieldGroup>
						<Field.Field data-invalid={nameError ? true : undefined}>
							<Field.Label for="ws-name">工作区名称</Field.Label>
							<Input
								id="ws-name"
								name="workspaceName"
								bind:ref={nameInput}
								bind:value={workspaceName}
								placeholder="产品研发组"
								required
								aria-invalid={nameError ? true : undefined}
								aria-describedby={nameError ? "ws-name-help ws-name-error" : "ws-name-help"}
							/>
							<Field.Description id="ws-name-help">请输入 2–40 字的工作区名称。</Field.Description>
							{#if nameError}
								<Field.Error id="ws-name-error">{nameError}</Field.Error>
							{/if}
						</Field.Field>

						<Field.Field>
							<Field.Label for="ws-lang">默认语言</Field.Label>
							<Select.Root type="single" bind:value={language} items={LANGUAGES}>
								<Select.Trigger id="ws-lang">
									<Select.Value placeholder="选择语言" />
								</Select.Trigger>
								<Select.Content>
									{#each LANGUAGES as option (option.value)}
										<Select.Item value={option.value} label={option.label}>
											{option.label}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</Field.Field>
					</Field.FieldGroup>
				</PageLayout.Section>
			</PageLayout.Section>

			<PageLayout.Section>
				<PageLayout.SectionTitle>通知偏好</PageLayout.SectionTitle>
				<PageLayout.Section surface="card">
					<PageLayout.PropertyList layout="settings">
						<PageLayout.PropertyRow label="邮件通知">
							<Switch aria-label="邮件通知" bind:checked={emailNotice} />
						</PageLayout.PropertyRow>
						<PageLayout.PropertyRow
							label="桌面推送"
							description="仅在浏览器授权后生效"
							descriptionId="desktop-push-help"
						>
							<Switch
								aria-label="桌面推送"
								aria-describedby="desktop-push-help"
								bind:checked={desktopPush}
							/>
						</PageLayout.PropertyRow>
					</PageLayout.PropertyList>
				</PageLayout.Section>
			</PageLayout.Section>
		</form>

		<Separator />

		<PageLayout.Section>
			<PageLayout.SectionTitle>危险操作</PageLayout.SectionTitle>
			<PageLayout.Section surface="card">
				<PageLayout.PropertyList layout="settings">
					<PageLayout.PropertyRow
						label="注销工作区"
						description="永久清除当前工作区及全部数据，此操作不可恢复。"
					>
						<AlertDialog.Root>
							<AlertDialog.Trigger>
								{#snippet child({ props })}
									<Button {...props} variant="destructive" size="sm">注销工作区</Button>
								{/snippet}
							</AlertDialog.Trigger>
							<AlertDialog.Content appearance="danger" focusCancel>
								<AlertDialog.Header>
									<AlertDialog.Title>注销工作区</AlertDialog.Title>
									<AlertDialog.Description>
										注销后，当前工作区内的项目、成员与历史数据将被永久清除，且无法恢复。
									</AlertDialog.Description>
								</AlertDialog.Header>
								<AlertDialog.Footer>
									<AlertDialog.Cancel>取消</AlertDialog.Cancel>
									<AlertDialog.Action
										variant="destructive"
										onclick={() => (savedNote = "已触发注销确认（演示环境不执行删除）")}
									>
										注销工作区
									</AlertDialog.Action>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>
					</PageLayout.PropertyRow>
				</PageLayout.PropertyList>
			</PageLayout.Section>
		</PageLayout.Section>
	</PageLayout.Root>
</main>
