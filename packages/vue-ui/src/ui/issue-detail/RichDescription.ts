import { defineComponent, h, type PropType, type VNode } from "vue";
import { richNodes } from "./editor-core.js";
import { richTextClass } from "./model.js";
import type { JSONContent } from "@tiptap/core";

export default defineComponent({
	props: {
		content: { type: Object as PropType<JSONContent>, required: true },
		slot: { type: String, default: "issue-description" },
	},
	setup(props) {
		return () =>
			h(
				"div",
				{ "data-slot": props.slot, class: richTextClass },
				richNodes<VNode>(props.content, (tag, attrs, children) => h(tag, attrs, children))
			);
	},
});
