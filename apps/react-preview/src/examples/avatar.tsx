import {
	Avatar,
	AvatarBadge,
	AvatarFallback,
	AvatarGroup,
	AvatarGroupCount,
	AvatarImage,
} from "@valar/react-ui/avatar";

const profileImage = `data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#d8e5ff"/><circle cx="16" cy="11" r="5" fill="#435978"/><path d="M5 32v-3a11 11 0 0 1 22 0v3" fill="#435978"/></svg>'
)}`;

export default function AvatarExample() {
	return (
		<section aria-label="Avatar examples" className="grid max-w-sm gap-4 p-6 text-sm">
			<div className="flex items-center gap-3">
				<Avatar appearance="member">
					<AvatarFallback aria-hidden="true">JD</AvatarFallback>
					<AvatarBadge aria-hidden="true" className="bg-success ring-background" />
				</Avatar>
				<span>
					Jordan Davis <span className="text-xs text-muted-foreground">· Available</span>
				</span>
			</div>
			<div className="flex flex-wrap items-center gap-3">
				<span className="text-muted-foreground">Subscribers</span>
				<AvatarGroup>
					<Avatar appearance="subscriber" size="sm">
						<AvatarImage src={profileImage} alt="Mina Park" />
						<AvatarFallback role="img" aria-label="Mina Park">
							MP
						</AvatarFallback>
					</Avatar>
					<Avatar appearance="subscriber" size="sm">
						<AvatarFallback role="img" aria-label="Sam Lee">
							SL
						</AvatarFallback>
					</Avatar>
					<AvatarGroupCount>
						<span aria-hidden="true">+2</span>
						<span className="sr-only">2 more subscribers</span>
					</AvatarGroupCount>
				</AvatarGroup>
			</div>
		</section>
	);
}
