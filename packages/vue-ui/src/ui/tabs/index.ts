import { cva, type VariantProps } from "class-variance-authority";

export { default as Tabs } from "./Tabs.vue";
export { default as TabsList } from "./TabsList.vue";
export { default as TabsTrigger } from "./TabsTrigger.vue";
export { default as TabsContent } from "./TabsContent.vue";

export const tabsListVariants = cva("cn-tabs-list group/tabs-list inline-flex w-fit max-w-full items-center justify-center-safe text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-horizontal:scrollbar-none data-horizontal:overflow-x-auto", {
	variants: { variant: {
		default: "cn-tabs-list-variant-default",
		line: "gap-1 bg-transparent",
		capsule: "cn-tabs-list-variant-capsule group-data-horizontal/tabs:w-full",
	} },
	defaultVariants: { variant: "default" },
});
export type TabsListVariant = NonNullable<VariantProps<typeof tabsListVariants>["variant"]>;
