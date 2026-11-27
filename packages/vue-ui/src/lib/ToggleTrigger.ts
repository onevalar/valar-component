import { cloneVNode, Comment, defineComponent, Fragment, h, Text } from "vue";
import type { Component, ComponentPublicInstance, PropType, VNode } from "vue";

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

// Render a Valar element through the SDK's render slot without dropping its ref.
export default defineComponent({
	inheritAttrs: false,
	props: {
		as: { type: [String, Object, Function] as PropType<string | Component>, default: "button" },
		asChild: Boolean,
		part: { type: Object as PropType<Record<string, unknown>>, required: true },
		setElement: Function as PropType<(element: HTMLElement | null) => void>,
	},
	setup(props, { slots }) {
		function bind(value: Element | ComponentPublicInstance | null) {
			(props.part.ref as ((value: unknown) => void) | undefined)?.(value);
			const element = value && "$el" in value ? value.$el : value;
			props.setElement?.(element?.nodeType === 1 ? element : null);
		}
		return () => {
			const children = slots.default?.();
			const child =
				props.asChild || props.as === "template" ? firstElement(children ?? []) : undefined;
			const target = child?.type ?? props.as;
			const attributes: Record<string, unknown> = { ...props.part, ref: bind };
			if (typeof target === "string" && target !== "button" && attributes.type === "button") {
				delete attributes.type;
			}
			if (child) return cloneVNode(child, attributes, true);
			const tag = props.as === "template" ? "button" : props.as;
			return typeof tag === "string"
				? h(tag, attributes, children)
				: h(tag, attributes, { default: () => children });
		};
	},
});
