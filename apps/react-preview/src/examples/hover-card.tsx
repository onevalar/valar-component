import { Avatar, AvatarFallback } from "@valar/react-ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@valar/react-ui/hover-card";
import { Separator } from "@valar/react-ui/separator";
import { useId } from "react";

export default function HoverCardExample() {
	const profileId = useId();

	return (
		<section aria-label="Hover Card examples" className="grid w-full max-w-sm gap-4 p-6 text-sm">
			<p>
				<HoverCard openDelay={300} closeDelay={150}>
					<HoverCardTrigger
						href={`#${profileId}`}
						className="rounded-sm font-medium underline underline-offset-2"
					>
						Jordan Davis
					</HoverCardTrigger>
					<HoverCardContent appearance="profile" align="start">
						<div className="flex items-center gap-2 py-1">
							<Avatar aria-hidden="true">
								<AvatarFallback>JD</AvatarFallback>
							</Avatar>
							<div>
								<p className="text-[13px] font-medium">Jordan Davis</p>
								<p className="text-muted-foreground">@jordan</p>
							</div>
						</div>
						<Separator className="my-1" />
						<p>Design Systems · Project lead</p>
					</HoverCardContent>
				</HoverCard>{" "}
				updated the launch checklist.
			</p>
			<article
				id={profileId}
				className="grid gap-1 rounded-lg border-[0.5px] border-border bg-card p-3"
			>
				<h2 className="font-medium">Jordan Davis profile</h2>
				<p className="text-muted-foreground">@jordan · Design Systems · Project lead</p>
				<p>Owns release readiness and the launch checklist.</p>
			</article>
		</section>
	);
}
