<script setup lang="ts">
import { cva } from "class-variance-authority";
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
import type { CodeBlockLineVariant } from ".";

export type CodeBlockLineToken = { content: string; style?: HTMLAttributes["style"]; class?: HTMLAttributes["class"] };

const props = withDefaults(defineProps<{ variant?: CodeBlockLineVariant; code?: string | readonly CodeBlockLineToken[]; class?: HTMLAttributes["class"] }>(), { variant: "default" });
const variants = cva("cn-code-block-line relative block min-h-lh after:absolute after:top-0 after:select-none in-data-numbered:col-span-2 in-data-numbered:grid in-data-numbered:grid-cols-subgrid in-data-numbered:[counter-increment:line] in-data-numbered:before:content-[counter(line)] in-data-numbered:before:select-none in-data-numbered:supports-[content:counter(line)_/_'']:before:content-[counter(line)_/_'']", {
	variants: { variant: {
		default: "cn-code-block-line-variant-default",
		added: "cn-code-block-line-variant-added",
		removed: "cn-code-block-line-variant-removed",
		highlighted: "cn-code-block-line-variant-highlighted",
	} },
});
</script>

<template>
	<span data-slot="code-block-line" :data-variant="variant" :class="cn(variants({ variant }), props.class)"><span data-slot="code-block-line-content" class="min-w-0"><template v-if="typeof code === 'string'">{{ code || '\n' }}</template><template v-else-if="code?.length"><span v-for="(token, index) in code" :key="index" :style="token.style" :class="token.class">{{ token.content }}</span></template><slot v-else>{{ '\n' }}</slot></span></span>
</template>
