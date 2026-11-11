import type { Page } from "@playwright/test";

export function tunerButton(page: Page, title: string) {
	return page
		.getByRole("region", { name: `${title} 样式调节`, exact: true })
		.getByRole("button", { name: "样式调节器", exact: true });
}
