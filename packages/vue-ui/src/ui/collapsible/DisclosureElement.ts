import { cloneVNode, Comment, defineComponent, Fragment, h, Text } from "vue";
import type { Component, PropType, VNode } from "vue";

function firstElement(nodes: VNode[]): VNode | undefined {
	for (const node of nodes) {
		if (node.type === Fragment && Array.isArray(node.children)) {
			const child = firstElement(node.children as VNode[]);
			if (child) return child;
		} else if (node.type !== Comment && node.type !== Text) {
			return node;
		}
	}
}

// Vue's SDK render slot owns the part props (including the ref). Keep the legacy
// as/asChild API while sending those props directly to the chosen element.
export default defineComponent({
	inheritAttrs: false,
	props: {
		as: { type: [String, Object, Function] as PropType<string | Component>, required: true },
		asChild: Boolean,
		part: { type: Object as PropType<Record<string, unknown>>, required: true },
	},
	setup(props, { slots, expose }) {
		expose({
			get open() {
				return props.part["data-state"] === "open";
			},
			get dataDisabled() {
				return props.part["data-disabled"] == null ? undefined : "";
			},
		});
		return () => {
			const children = slots.default?.();
			const child =
				props.asChild || props.as === "template" ? firstElement(children ?? []) : undefined;
			if (child) return cloneVNode(child, props.part, true);
			const tag = props.as === "template" ? "div" : props.as;
			return typeof tag === "string"
				? h(tag, props.part, children)
				: h(tag, props.part, { default: () => children });
		};
	},
});
