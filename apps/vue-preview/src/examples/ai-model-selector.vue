<script setup lang="ts">
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuGroupHeading,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@valar/vue-ui/dropdown-menu";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupTextarea,
} from "@valar/vue-ui/input-group";
import { computed, ref } from "vue";

const props = defineProps<{ chinese?: boolean }>();
const t = (english: string, zh: string) => (props.chinese ? zh : english);
const models = [
	{ name: "OpenAI", items: ["GPT-5", "GPT-5 mini"] },
	{ name: "Anthropic", items: ["Claude Sonnet 4.5", "Claude Haiku 4.5"] },
];
const efforts = ["Low", "Medium", "High"];
const selection = ref({ model: "GPT-5", effort: "Medium" });
const text = ref("");
const form = ref<HTMLFormElement | null>(null);
const sent = ref<typeof selection.value | null>(null);
const effortLabel = (value: string) =>
	props.chinese ? ["低", "中", "高"][efforts.indexOf(value)] : value;
const menus = computed(
	() =>
		[
			{ key: "model", label: t("Model", "模型"), display: selection.value.model, groups: models },
			{
				key: "effort",
				label: t("Effort", "推理强度"),
				display: effortLabel(selection.value.effort),
				groups: [{ name: t("Effort", "推理强度"), items: efforts }],
			},
		] as const
);

function submit() {
	if (!text.value.trim()) return;
	sent.value = { ...selection.value };
	text.value = "";
	form.value?.querySelector("textarea")?.focus();
}

function onEnter(event: KeyboardEvent) {
	if (event.shiftKey || event.isComposing || event.keyCode === 229) return;
	event.preventDefault();
	form.value?.requestSubmit();
}
</script>

<template>
	<section
		class="mx-auto grid w-full max-w-lg min-w-0 gap-2 px-4 py-6"
		:aria-label="t('Model selector', '模型选择器')"
	>
		<form ref="form" @submit.prevent="submit">
			<InputGroup appearance="composer">
				<InputGroupTextarea
					v-model="text"
					name="message"
					:aria-label="t('Message', '消息')"
					:placeholder="t('Ask the agent to change your code…', '请助手修改你的代码…')"
					:rows="2"
					@keydown.enter="onEnter"
				/>
				<InputGroupAddon align="block-end" class="gap-2">
					<div class="flex min-w-0 flex-wrap gap-1">
						<DropdownMenu v-for="{ key, label, display, groups } in menus" :key="key">
							<DropdownMenuTrigger as-child>
								<InputGroupButton
									size="xs"
									shape="pill"
									:aria-label="`${label}: ${display}`"
									class="text-muted-foreground"
								>
									{{ display
									}}<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor">
										<path d="m4 6 4 4 4-4" />
									</svg>
								</InputGroupButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent appearance="surface" align="start" class="min-w-36">
								<DropdownMenuRadioGroup v-model="selection[key]" :aria-label="label">
									<DropdownMenuGroup v-for="({ name, items }, index) in groups" :key="name">
										<DropdownMenuSeparator v-if="index > 0" />
										<DropdownMenuGroupHeading>{{ name }}</DropdownMenuGroupHeading>
										<DropdownMenuRadioItem
											v-for="item in items"
											:key="item"
											:value="item"
											close-on-select
											>{{ key === "model" ? item : effortLabel(item) }}</DropdownMenuRadioItem
										>
									</DropdownMenuGroup>
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
					<InputGroupButton
						type="submit"
						size="icon-xs"
						shape="pill"
						variant="default"
						class="ms-auto shrink-0"
						:disabled="!text.trim()"
						:aria-label="t('Send', '发送')"
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M8 13V3m-4 4 4-4 4 4" />
						</svg>
					</InputGroupButton>
				</InputGroupAddon>
			</InputGroup>
		</form>
		<p role="status" class="text-xs text-muted-foreground">
			{{
				sent
					? `${t("Sent locally", "已在本地发送")} · ${sent.model} · ${t("Effort", "推理强度")}: ${effortLabel(sent.effort)}`
					: t(
							"Choose a model and effort, then send a local sample.",
							"选择模型和推理强度，再发送一条本地示例消息。"
						)
			}}
		</p>
	</section>
</template>
