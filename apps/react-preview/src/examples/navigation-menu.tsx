import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@valar/react-ui/navigation-menu";
import { useId } from "react";

export default function NavigationMenuExample() {
	const id = useId();

	return (
		<section
			aria-label="Navigation Menu examples"
			className="grid w-full max-w-sm justify-items-start gap-3 p-6 text-sm"
		>
			<NavigationMenu aria-label="Workspace navigation">
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuLink active href={`#${id}-overview`}>
							Overview
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Projects</NavigationMenuTrigger>
						<NavigationMenuContent>
							<ul>
								<li>
									<NavigationMenuLink href={`#${id}-projects`}>All projects</NavigationMenuLink>
								</li>
								<li>
									<NavigationMenuLink href={`#${id}-launch`}>Launch plan</NavigationMenuLink>
								</li>
							</ul>
						</NavigationMenuContent>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
			<div className="grid w-full gap-3 rounded-lg border-[0.5px] border-border bg-card p-3">
				<div>
					<h2 id={`${id}-overview`} className="font-medium">
						Workspace overview
					</h2>
					<p className="text-muted-foreground">Design Systems team</p>
				</div>
				<div>
					<h2 id={`${id}-projects`} className="font-medium">
						All projects
					</h2>
					<p className="text-muted-foreground">One active project</p>
				</div>
				<div>
					<h2 id={`${id}-launch`} className="font-medium">
						Launch plan
					</h2>
					<p className="text-muted-foreground">Review the release checklist.</p>
				</div>
			</div>
		</section>
	);
}
