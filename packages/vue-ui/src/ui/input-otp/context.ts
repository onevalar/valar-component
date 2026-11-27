import type { InjectionKey, Ref } from "vue";

export const REGEXP_ONLY_DIGITS = "^\\d+$";
export const REGEXP_ONLY_CHARS = "^[a-zA-Z]+$";
export const REGEXP_ONLY_DIGITS_AND_CHARS = "^[a-zA-Z0-9]+$";

export type Selection = [start: number, end: number];
export const otpContext: InjectionKey<
	Readonly<
		Ref<{
			value: string;
			selection: Selection | null;
			maxLength: number;
			invalid: boolean;
		}>
	>
> = Symbol("InputOTP");
