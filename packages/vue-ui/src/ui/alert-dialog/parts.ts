import {
	AlertDialogDescription as SdkDescription,
	AlertDialogTitle as SdkTitle,
	AlertDialogTrigger as SdkTrigger,
} from "@ui-sdk/vue/alert-dialog";
import { cn } from "cn";
import { defineComponent, h, type Component, type HTMLAttributes, type PropType } from "vue";
import DisclosureElement from "../collapsible/DisclosureElement";
import AlertDialogOverlay from "./AlertDialogOverlay.vue";

function makePart(sdkPart: any, defaultTag: string, slotName: string, baseClass?: string) {
	return defineComponent({
		inheritAttrs: false,
		props: {
			as: { type: [String, Object, Function] as PropType<string | Component>, default: defaultTag },
			asChild: Boolean,
			class: { type: [String, Array, Object] as PropType<HTMLAttributes["class"]>, default: undefined },
		},
		setup(props, { attrs, slots }) {
			return () =>
				h(
					sdkPart,
					{
						...attrs,
						"data-slot": slotName,
						class: baseClass ? cn(baseClass, props.class) : props.class,
					},
					{
						render: ({ props: part, state }: { props: Record<string, unknown>; state?: { open?: boolean } }) =>
							h(
								DisclosureElement,
								{
									as: props.as ?? defaultTag,
									asChild: props.asChild,
									part: {
										...part,
										"data-slot": slotName,
										...(state && "open" in state
											? { "data-state": state.open ? "open" : "closed" }
											: {}),
									},
								},
								slots
							),
					}
				);
		},
	});
}

function makeDivPart(slotName: string, baseClass: string) {
	return defineComponent({
		props: {
			as: { type: [String, Object, Function] as PropType<string | Component>, default: "div" },
			asChild: Boolean,
			class: { type: [String, Array, Object] as PropType<HTMLAttributes["class"]>, default: undefined },
		},
		setup(props, { slots }) {
			return () =>
				h(
					props.as as any,
					{ "data-slot": slotName, class: cn(baseClass, props.class) },
					slots.default?.()
				);
		},
	});
}

export { AlertDialogOverlay };
export { default as AlertDialogCancel } from "./AlertDialogCancel.vue";
export const AlertDialogTrigger = makePart(SdkTrigger, "button", "alert-dialog-trigger");
export const AlertDialogTitle = makePart(
	SdkTitle,
	"h2",
	"alert-dialog-title",
	"cn-font-heading cn-alert-dialog-title"
);
export const AlertDialogDescription = makePart(
	SdkDescription,
	"p",
	"alert-dialog-description",
	"cn-alert-dialog-description"
);
export const AlertDialogHeader = makeDivPart("alert-dialog-header", "cn-alert-dialog-header");
export const AlertDialogMedia = makeDivPart("alert-dialog-media", "cn-alert-dialog-media");
export const AlertDialogFooter = makeDivPart(
	"alert-dialog-footer",
	"cn-alert-dialog-footer flex flex-wrap justify-end gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2"
);
