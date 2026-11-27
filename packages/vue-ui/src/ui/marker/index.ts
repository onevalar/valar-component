// Adapted from Valar's MIT Svelte registry (cfd989c). See LICENSE.
import { cva, type VariantProps } from "class-variance-authority";

export { default as Marker } from "./Marker.vue";
export { default as MarkerIcon } from "./MarkerIcon.vue";
export { default as MarkerContent } from "./MarkerContent.vue";

export const markerVariants = cva(
	"cn-marker group/marker relative flex w-full items-center [button,a]:focus-visible:outline-1 [button,a]:focus-visible:-outline-offset-1 [button,a]:focus-visible:outline-ring",
	{
		variants: {
			variant: {
				default: "",
				separator:
					"cn-marker-variant-separator rtl:before:mr-0 rtl:before:ml-1 rtl:after:ml-0 rtl:after:mr-1",
				border: "cn-marker-variant-border",
			},
		},
		defaultVariants: { variant: "default" },
	}
);

export type MarkerVariant = NonNullable<VariantProps<typeof markerVariants>["variant"]>;
