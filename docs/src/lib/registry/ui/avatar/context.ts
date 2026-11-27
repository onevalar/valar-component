import { getContext, setContext } from "svelte";

const avatarBackend = Symbol("avatar-backend");

export function setAvatarBackend(legacy: () => boolean, status: () => "loading" | "loaded" | "error") {
	setContext(avatarBackend, { legacy, status });
}

export function useAvatarBackend() {
	return getContext<{
		legacy: () => boolean;
		status: () => "loading" | "loaded" | "error";
	}>(avatarBackend);
}
