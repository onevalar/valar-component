export function blockTemplate(block: string) {
	if (/^(login|signup|otp)-0[1-5]$/.test(block)) return "auth";
	if (/^calendar-(0[1-9]|[12][0-9]|3[0-2])$/.test(block)) return "calendar";
	if (
		/^sidebar-(0[1-9]|1[0-6])$/.test(block) ||
		/^demo-sidebar(?:-(?:controlled|footer|group(?:-action|-collapsible)?|header|icon|menu(?:-action|-badge|-collapsible|-sub)?))?$/.test(
			block
		)
	)
		return "sidebar";
	if (block === "dashboard-01" || block === "new-components-01") return block;
}
