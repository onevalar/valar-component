import { Separator } from "@valar/react-ui/separator";

export default function SeparatorExample() {
	return (
		<section aria-label="Separator examples" className="grid max-w-sm gap-4 p-6 text-sm">
			<p>Project settings</p>
			<Separator />
			<div className="flex items-center gap-3">
				<span>General</span>
				<Separator orientation="vertical" />
				<span>Members</span>
				<Separator orientation="vertical" decorative />
				<span>Access</span>
			</div>
			<div className="[--valar-separator:var(--primary)]">
				<Separator decorative />
			</div>
		</section>
	);
}
