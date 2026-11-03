<script lang="ts">
	import * as Dialog from "@valar/svelte-ui/dialog";
	import * as Questionnaire from "@valar/svelte-ui/questionnaire";
	import { Button } from "@valar/svelte-ui/button";
	import { Input } from "@valar/svelte-ui/input";
	import { Label } from "@valar/svelte-ui/label";

	let count = $state(0);
	let name = $state("");
	let dark = $state(false);
	let submitted = $state("尚未提交");

	const items = [
		{
			name: "priority",
			required: true,
			choices: [{ value: "interaction" }, { value: "theme" }],
		},
	] as const;

	$effect(() => {
		document.documentElement.classList.toggle("dark", dark);
	});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;
		submitted = JSON.stringify(Object.fromEntries(new FormData(form)));
	}
</script>

<svelte:head>
	<title>Valar Svelte · 消费端联调</title>
	<meta name="description" content="通过 workspace 包验证 Valar Svelte 组件、主题与热更新。" />
</svelte:head>

<main class="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-8 sm:py-12">
	<header class="flex flex-wrap items-start justify-between gap-4">
		<div class="max-w-xl space-y-2">
			<p class="text-sm text-muted-foreground">Valar Svelte / Workspace Playground</p>
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">组件消费端联调</h1>
			<p class="text-sm leading-relaxed text-muted-foreground">
				本页只通过共享 UI
				包使用组件。先增加计数并输入文字，再修改库组件或样式，观察热更新与本地状态。
			</p>
		</div>
		<Button variant="outline" aria-pressed={dark} onclick={() => (dark = !dark)}>
			深色模式：{dark ? "开" : "关"}
		</Button>
	</header>

	<div class="grid items-start gap-6 md:grid-cols-2">
		<section
			aria-labelledby="basic-heading"
			class="space-y-6 rounded-xl border bg-card p-5 text-card-foreground sm:p-6"
		>
			<div class="space-y-2">
				<h2 id="basic-heading" class="text-lg font-semibold">本地状态与弹层</h2>
				<p class="text-sm text-muted-foreground">计数和输入内容由此应用保存，不发送到服务器。</p>
			</div>

			<div class="flex flex-wrap items-center gap-3">
				<Button onclick={() => (count += 1)}>增加计数</Button>
				<output aria-live="polite" class="text-sm tabular-nums">本地计数：{count}</output>
			</div>

			<div class="space-y-2">
				<Label for="playground-name">你的称呼</Label>
				<Input
					id="playground-name"
					name="displayName"
					bind:value={name}
					placeholder="输入一段中文"
					aria-describedby="playground-name-help"
				/>
				<p id="playground-name-help" class="text-sm break-words text-muted-foreground">
					当前值：{name || "（空）"}
				</p>
			</div>

			<Dialog.Root>
				<Dialog.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline">打开验证对话框</Button>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content class="max-w-[calc(100%-2rem)] sm:max-w-md">
					<Dialog.Header>
						<Dialog.Title>焦点与键盘验证</Dialog.Title>
						<Dialog.Description>
							使用 Tab 在弹层内移动焦点，按 Escape 或点击关闭；关闭后焦点应返回打开按钮。
						</Dialog.Description>
					</Dialog.Header>
					<p class="text-sm break-words">你好，{name || "访客"}。本地计数为 {count}。</p>
					<Dialog.Footer>
						<Dialog.Close>
							{#snippet child({ props })}
								<Button {...props}>关闭对话框</Button>
							{/snippet}
						</Dialog.Close>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		</section>

		<section
			aria-labelledby="questionnaire-heading"
			class="space-y-6 rounded-xl border bg-card p-5 text-card-foreground sm:p-6"
		>
			<div class="space-y-2">
				<h2 id="questionnaire-heading" class="text-lg font-semibold">问卷与原语依赖</h2>
				<p class="text-sm text-muted-foreground">
					可先空提交以验证必填错误，再选择答案提交；重置会清空选择和提交结果。
				</p>
			</div>

			<Questionnaire.Root
				id="playground-questionnaire"
				{items}
				onSubmit={handleSubmit}
				onReset={() => (submitted = "已重置，尚未提交")}
				class="gap-4"
			>
				<Questionnaire.Progress />
				<Questionnaire.Item name="priority" required>
					<Questionnaire.Title>你想优先验证什么？（必填）</Questionnaire.Title>
					<Questionnaire.Description>选择一项，提交结果仅保留在本页。</Questionnaire.Description>
					<Questionnaire.Choices>
						<Questionnaire.Choice value="interaction">组件交互</Questionnaire.Choice>
						<Questionnaire.Choice value="theme">主题样式</Questionnaire.Choice>
					</Questionnaire.Choices>
					<Questionnaire.Error />
				</Questionnaire.Item>
				<Questionnaire.Actions>
					<Button type="reset" variant="outline" class="justify-self-start">重置问卷</Button>
					<Questionnaire.Submit>提交答案</Questionnaire.Submit>
				</Questionnaire.Actions>
			</Questionnaire.Root>

			<div class="space-y-2 rounded-lg border bg-muted p-3">
				<p class="text-sm font-medium">本地 FormData 结果</p>
				<p role="status" class="font-mono text-sm break-all">{submitted}</p>
			</div>
		</section>
	</div>

	<footer class="text-sm text-muted-foreground">
		独立 SvelteKit 消费端 · workspace:* · 无文档站运行时依赖
	</footer>
</main>
