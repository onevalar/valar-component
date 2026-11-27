<script setup lang="ts">
import {
	Attachment,
	AttachmentAction,
	AttachmentActions,
	AttachmentContent,
	AttachmentMedia,
	AttachmentTitle,
} from "@valar/vue-ui/attachment";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuGroupHeading,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
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
type AttachmentFile = { id: number; file: File };
const text = ref("");
const files = ref<AttachmentFile[]>([]);
const selection = ref({ model: "GPT-5", effort: "Medium" });
const sent = ref<{ text: string; files: AttachmentFile[]; model: string; effort: string } | null>(
	null
);
const form = ref<HTMLFormElement | null>(null);
const picker = ref<HTMLInputElement | null>(null);
let nextId = 0;

const effortLabel = (value: string) =>
	props.chinese ? ["低", "中", "高"][efforts.indexOf(value)] : value;
const menus = computed(
	() =>
		[
			{ key: "model", label: t("Model", "模型"), format: (value: string) => value, groups: models },
			{
				key: "effort",
				label: t("Effort", "推理强度"),
				format: effortLabel,
				groups: [{ name: t("Effort", "推理强度"), items: efforts }],
			},
		] as const
);

function attach(event: Event) {
	const input = event.currentTarget as HTMLInputElement;
	files.value.push(...Array.from(input.files ?? [], (file) => ({ id: ++nextId, file })));
	input.value = "";
}

function remove(id: number) {
	files.value = files.value.filter((item) => item.id !== id);
	form.value?.querySelector("textarea")?.focus();
}

function submit() {
	if (!text.value.trim()) return;
	sent.value = { text: text.value.trim(), files: files.value, ...selection.value };
	text.value = "";
	files.value = [];
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
		class="mx-auto grid w-full max-w-lg min-w-0 gap-3 px-4 py-6"
		:aria-label="t('Prompt input', '提示词输入框')"
	>
		<form ref="form" @submit.prevent="submit">
			<input ref="picker" type="file" hidden multiple @change="attach" />
			<InputGroup appearance="composer">
				<InputGroupAddon
					v-if="files.length"
					align="block-start"
					class="flex-wrap gap-1.5"
					:aria-label="t('Attachments', '附件')"
				>
					<Attachment v-for="{ id, file } in files" :key="id" size="sm" class="max-w-full min-w-0">
						<AttachmentMedia
							><svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor">
								<path d="M4 2.5h5l3 3v8H4zm5 0v3h3M6 8h4m-4 2h4" /></svg
						></AttachmentMedia>
						<AttachmentContent
							><AttachmentTitle :title="file.name">{{
								file.name
							}}</AttachmentTitle></AttachmentContent
						>
						<AttachmentActions
							><AttachmentAction
								:aria-label="`${t('Remove', '移除')} ${file.name}`"
								@click="remove(id)"
								><span aria-hidden="true">×</span></AttachmentAction
							></AttachmentActions
						>
					</Attachment>
				</InputGroupAddon>
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
						<DropdownMenu v-for="{ key, label, format, groups } in menus" :key="key">
							<DropdownMenuTrigger as-child>
								<InputGroupButton
									size="xs"
									shape="pill"
									class="text-muted-foreground"
									:aria-label="`${label}: ${format(selection[key])}`"
								>
									{{ format(selection[key])
									}}<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor">
										<path d="m4 6 4 4 4-4" />
									</svg>
								</InputGroupButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent appearance="surface" align="start" class="min-w-36">
								<DropdownMenuRadioGroup v-model="selection[key]" :aria-label="label">
									<DropdownMenuGroup v-for="{ name, items } in groups" :key="name">
										<DropdownMenuGroupHeading>{{ name }}</DropdownMenuGroupHeading>
										<DropdownMenuRadioItem
											v-for="item in items"
											:key="item"
											:value="item"
											close-on-select
											>{{ format(item) }}</DropdownMenuRadioItem
										>
									</DropdownMenuGroup>
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
					<div class="ms-auto flex shrink-0 gap-2">
						<InputGroupButton
							size="icon-xs"
							shape="pill"
							:aria-label="t('Attach files', '添加文件')"
							@click="picker?.click()"
						>
							<svg
								aria-hidden="true"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
							>
								<path d="M8 3v10M3 8h10" />
							</svg>
						</InputGroupButton>
						<InputGroupButton
							type="submit"
							size="icon-xs"
							shape="pill"
							variant="default"
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
					</div>
				</InputGroupAddon>
			</InputGroup>
		</form>
		<div role="status" class="grid min-w-0 gap-1 text-xs wrap-anywhere text-muted-foreground">
			<template v-if="sent">
				<p>
					{{ t("Sent locally", "已在本地发送") }} · {{ sent.model }} ·
					{{ t("Effort", "推理强度") }}: {{ effortLabel(sent.effort) }}
				</p>
				<p class="whitespace-pre-wrap text-foreground">{{ sent.text }}</p>
				<p v-if="sent.files.length">
					{{ t("Attachments", "附件") }}: {{ sent.files.map(({ file }) => file.name).join(", ") }}
				</p>
			</template>
			<p v-else>
				{{
					t(
						"Files stay in this preview. Add a message to send.",
						"文件仅保留在此预览中。输入消息后即可发送。"
					)
				}}
			</p>
		</div>
	</section>
</template>
