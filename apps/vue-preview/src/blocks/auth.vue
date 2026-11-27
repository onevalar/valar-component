<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import { Card, CardContent } from "@valar/vue-ui/card";
import { Field, FieldDescription, FieldLabel, FieldSeparator } from "@valar/vue-ui/field";
import { Input } from "@valar/vue-ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
	REGEXP_ONLY_DIGITS,
} from "@valar/vue-ui/input-otp";
import { computed, nextTick, ref, useId } from "vue";

type Action =
	| "Apple"
	| "Google"
	| "GitHub"
	| "Meta"
	| "recover"
	| "resend"
	| "switch"
	| "terms"
	| "privacy";
const props = defineProps<{
	block: string;
	chinese?: boolean;
	onSubmit?: (data: FormData) => void;
	onAction?: (action: Action) => void;
}>();
const kind = computed(() => props.block.split("-")[0]);
const variant = computed(() => props.block.split("-")[1]);
const signup = computed(() => kind.value === "signup");
const otp = computed(() => kind.value === "otp");
const emailOnly = computed(() => variant.value === "05");
const split = computed(() => variant.value === "04");
const fullSplit = computed(() => variant.value === "02");
const panel = computed(() => ["01", "03", "04"].includes(variant.value!));
const showBrand = computed(
	() => variant.value === "03" || emailOnly.value || (fullSplit.value && !otp.value)
);
const providerFirst = computed(() => kind.value === "login" && variant.value === "03");
const showTerms = computed(
	() => split.value || emailOnly.value || (!otp.value && variant.value === "03")
);
const providers = computed<Action[]>(() =>
	otp.value || (signup.value && variant.value === "03")
		? []
		: variant.value === "01"
			? ["Google"]
			: fullSplit.value
				? ["GitHub"]
				: split.value
					? ["Apple", "Google", "Meta"]
					: ["Apple", "Google"]
);
const groups = computed(() =>
	fullSplit.value
		? [
				[0, 1],
				[2, 3],
				[4, 5],
			]
		: split.value || emailOnly.value
			? [
					[0, 1, 2],
					[3, 4, 5],
				]
			: [[0, 1, 2, 3, 4, 5]]
);
const id = useId();
const code = ref("");
const error = ref("");
const status = ref("");
const t = (en: string, zh: string) => (props.chinese ? zh : en);
const heading = computed(() =>
	otp.value
		? t("Enter verification code", "输入验证码")
		: emailOnly.value
			? t("Welcome to Acme Inc.", "欢迎来到 Acme Inc.")
			: signup.value
				? t("Create an account", "创建账号")
				: variant.value === "03" || split.value
					? t("Welcome back", "欢迎回来")
					: t("Log in to your account", "登录账号")
);
const submitLabel = computed(() =>
	otp.value
		? t("Verify", "验证")
		: signup.value
			? t("Create account", "创建账号")
			: t("Log in", "登录")
);
const linkStyle =
	"rounded-sm text-xs text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:bg-accent";

function action(value: Action, label: string) {
	if (props.onAction) props.onAction(value);
	else
		status.value = t(
			`${label}: connect this action in your app.`,
			`${label}：请在宿主应用中接入此操作。`
		);
}

async function submit(event: Event) {
	const form = event.currentTarget as HTMLFormElement;
	const data = new FormData(form);
	if (signup.value && !emailOnly.value && data.get("password") !== data.get("confirmPassword")) {
		error.value = t("Passwords do not match.", "两次输入的密码不一致。");
		await nextTick();
		form.querySelector<HTMLInputElement>("[name=confirmPassword]")?.focus();
		return;
	}
	error.value = "";
	// No credentials or OTPs leave this form unless the host supplies onSubmit.
	if (props.onSubmit) props.onSubmit(data);
	else status.value = t("Form validated. No data was sent.", "表单已通过验证，未发送任何数据。");
}
</script>

<template>
	<main
		:data-native-block="block"
		:class="
			fullSplit
				? 'grid min-h-svh bg-background lg:grid-cols-2'
				: [
						'grid min-h-svh place-items-center px-4 py-6 sm:px-8',
						variant === '03' || split ? 'bg-muted' : 'bg-background',
					]
		"
	>
		<div
			:class="
				fullSplit
					? 'flex flex-col gap-5 p-6 sm:p-10'
					: ['grid w-full gap-5', split ? 'max-w-3xl' : 'max-w-sm']
			"
		>
			<div
				v-if="showBrand && !emailOnly"
				class="flex items-center justify-center gap-2 text-sm font-medium"
			>
				<span
					aria-hidden="true"
					class="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground"
					>A</span
				>Acme Inc.
			</div>
			<component
				:is="panel ? Card : 'div'"
				:class="[
					split && 'gap-0 overflow-hidden p-0',
					fullSplit && 'mx-auto my-auto w-full max-w-xs',
				]"
			>
				<component :is="panel ? CardContent : 'div'" :class="split && 'grid p-0 md:grid-cols-2'">
					<form
						class="grid min-w-0 gap-4"
						:class="split && 'p-5 sm:p-8'"
						@submit.prevent="submit"
						@input="
							error = '';
							status = '';
						"
					>
						<div
							v-if="emailOnly"
							class="flex items-center justify-center gap-2 text-sm font-medium"
						>
							<span
								aria-hidden="true"
								class="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground"
								>A</span
							>Acme Inc.
						</div>
						<header class="grid gap-1" :class="variant !== '01' && 'text-center'">
							<h1 class="text-xl font-semibold tracking-tight">{{ heading }}</h1>
							<p v-if="!emailOnly || otp" class="text-sm text-muted-foreground">
								{{
									otp
										? t(
												"Enter the six-digit code sent to your email.",
												"请输入发送至你邮箱的六位验证码。"
											)
										: signup
											? t("Enter your details to create an account.", "填写信息以创建账号。")
											: t("Enter your details to access your account.", "填写信息以登录账号。")
								}}
							</p>
						</header>
						<p v-if="emailOnly && !otp" class="text-center text-xs text-muted-foreground">
							{{
								signup
									? t("Already have an account?", "已有账号？")
									: t("Don't have an account?", "还没有账号？")
							}}
							<button
								type="button"
								:class="linkStyle"
								@click="action('switch', signup ? t('Log in', '登录') : t('Sign up', '注册'))"
							>
								{{ signup ? t("Log in", "登录") : t("Sign up", "注册") }}
							</button>
						</p>
						<template v-if="providerFirst">
							<div class="grid gap-2">
								<Button
									v-for="provider in providers"
									:key="provider"
									type="button"
									variant="outline"
									:aria-label="t(`Continue with ${provider}`, `使用 ${provider} 继续`)"
									@click="action(provider, provider)"
									>{{ provider }}</Button
								>
							</div>
							<FieldSeparator>{{ t("Or continue with", "或通过以下方式继续") }}</FieldSeparator>
						</template>
						<Field v-if="otp" class="items-center">
							<FieldLabel :for="`${id}-code`" :class="variant !== '01' && 'sr-only'">{{
								t("Verification code", "验证码")
							}}</FieldLabel>
							<InputOTP
								:id="`${id}-code`"
								v-model="code"
								name="code"
								:maxlength="6"
								:pattern="REGEXP_ONLY_DIGITS"
								:paste-transformer="(text: string) => text.replace(/[^0-9]/g, '')"
								required
								autocomplete="one-time-code"
								dir="ltr"
							>
								<template v-for="(group, index) in groups" :key="group[0]">
									<InputOTPSeparator v-if="index > 0" />
									<InputOTPGroup
										><InputOTPSlot
											v-for="slot in group"
											:key="slot"
											:index="slot"
											:class="emailOnly ? 'h-12 w-8 text-lg' : 'w-7'"
									/></InputOTPGroup>
								</template>
							</InputOTP>
						</Field>
						<template v-else>
							<Field v-if="signup && !split && !emailOnly"
								><FieldLabel :for="`${id}-name`">{{ t("Full name", "姓名") }}</FieldLabel
								><Input
									:id="`${id}-name`"
									name="name"
									placeholder="Alex Lee"
									autocomplete="name"
									required
							/></Field>
							<Field
								><FieldLabel :for="`${id}-email`">{{ t("Email", "邮箱") }}</FieldLabel
								><Input
									:id="`${id}-email`"
									name="email"
									type="email"
									placeholder="you@example.com"
									:autocomplete="signup ? 'email' : 'username'"
									required
							/></Field>
							<div
								v-if="!emailOnly"
								:class="
									signup && (variant === '03' || split)
										? 'grid min-w-0 grid-cols-2 gap-2'
										: 'grid gap-4'
								"
							>
								<Field class="min-w-0"
									><div class="flex flex-wrap items-baseline justify-between gap-1">
										<FieldLabel :for="`${id}-password`">{{ t("Password", "密码") }}</FieldLabel
										><button
											v-if="!signup"
											type="button"
											:class="linkStyle"
											@click="action('recover', t('Forgot password?', '忘记密码？'))"
										>
											{{ t("Forgot password?", "忘记密码？") }}
										</button>
									</div>
									<Input
										:id="`${id}-password`"
										name="password"
										type="password"
										:autocomplete="signup ? 'new-password' : 'current-password'"
										:minlength="signup ? 8 : undefined"
										:aria-describedby="signup ? `${id}-length` : undefined"
										required
								/></Field>
								<Field v-if="signup" class="min-w-0"
									><FieldLabel :for="`${id}-confirm`">{{
										t("Confirm password", "确认密码")
									}}</FieldLabel
									><Input
										:id="`${id}-confirm`"
										name="confirmPassword"
										type="password"
										autocomplete="new-password"
										:aria-invalid="Boolean(error)"
										:aria-describedby="error ? `${id}-mismatch` : undefined"
										required
								/></Field>
								<FieldDescription v-if="signup" :id="`${id}-length`" class="col-span-full">{{
									t("Use at least eight characters.", "请至少输入八个字符。")
								}}</FieldDescription>
							</div>
						</template>
						<p v-if="error" :id="`${id}-mismatch`" role="alert" class="text-sm text-destructive">
							{{ error }}
						</p>
						<Button v-if="!(otp && emailOnly)" type="submit" :disabled="otp && code.length !== 6">{{
							submitLabel
						}}</Button>
						<div v-if="otp" class="text-center">
							<button
								type="button"
								:class="linkStyle"
								@click="action('resend', t('Resend code', '重新发送验证码'))"
							>
								{{ t("Resend code", "重新发送验证码") }}
							</button>
						</div>
						<Button v-if="otp && emailOnly" type="submit" :disabled="code.length !== 6">{{
							submitLabel
						}}</Button>
						<template v-if="!providerFirst && providers.length">
							<FieldSeparator v-if="variant !== '01'">{{
								t("Or continue with", "或通过以下方式继续")
							}}</FieldSeparator>
							<div
								class="grid gap-2"
								:class="split ? 'grid-cols-3' : emailOnly ? 'sm:grid-cols-2' : ''"
							>
								<Button
									v-for="provider in providers"
									:key="provider"
									type="button"
									variant="outline"
									:aria-label="t(`Continue with ${provider}`, `使用 ${provider} 继续`)"
									@click="action(provider, provider)"
									>{{ provider }}</Button
								>
							</div>
						</template>
						<p v-if="!emailOnly && !otp" class="text-center text-xs text-muted-foreground">
							{{
								signup
									? t("Already have an account?", "已有账号？")
									: t("Don't have an account?", "还没有账号？")
							}}
							<button
								type="button"
								:class="linkStyle"
								@click="action('switch', signup ? t('Log in', '登录') : t('Sign up', '注册'))"
							>
								{{ signup ? t("Log in", "登录") : t("Sign up", "注册") }}
							</button>
						</p>
						<p role="status" class="text-center text-xs text-muted-foreground empty:hidden">
							{{ status }}
						</p>
					</form>
					<div
						v-if="split"
						aria-hidden="true"
						data-auth-art
						class="relative hidden min-h-48 overflow-hidden bg-muted md:grid md:place-items-center"
					>
						<div
							class="aspect-square w-2/3 rotate-12 rounded-[32%] border border-border bg-linear-to-br from-background to-muted shadow-sm"
						/>
						<div class="absolute inset-0 grid place-items-center">
							<span
								class="grid size-16 place-items-center rounded-2xl border border-border bg-background text-2xl font-semibold text-foreground"
								>A</span
							>
						</div>
					</div>
				</component>
			</component>
			<p v-if="showTerms" class="text-center text-xs text-muted-foreground">
				{{ t("By continuing, you agree to the", "继续即表示同意") }}
				<button
					type="button"
					:class="linkStyle"
					@click="action('terms', t('Terms of Service', '服务条款'))"
				>
					{{ t("Terms of Service", "服务条款") }}
				</button>
				{{ t("and", "和") }}
				<button
					type="button"
					:class="linkStyle"
					@click="action('privacy', t('Privacy Policy', '隐私政策'))"
				>
					{{ t("Privacy Policy", "隐私政策") }}</button
				>.
			</p>
		</div>
		<div
			v-if="fullSplit"
			aria-hidden="true"
			data-auth-art
			class="relative hidden min-h-48 overflow-hidden bg-muted lg:grid lg:place-items-center"
		>
			<div
				class="aspect-square w-2/3 rotate-12 rounded-[32%] border border-border bg-linear-to-br from-background to-muted shadow-sm"
			/>
			<div class="absolute inset-0 grid place-items-center">
				<span
					class="grid size-16 place-items-center rounded-2xl border border-border bg-background text-2xl font-semibold text-foreground"
					>A</span
				>
			</div>
		</div>
	</main>
</template>
