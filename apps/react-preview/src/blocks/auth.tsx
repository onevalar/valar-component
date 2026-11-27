import { Button } from "@valar/react-ui/button";
import { Card, CardContent } from "@valar/react-ui/card";
import { Field, FieldDescription, FieldLabel, FieldSeparator } from "@valar/react-ui/field";
import { Input } from "@valar/react-ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
	REGEXP_ONLY_DIGITS,
} from "@valar/react-ui/input-otp";
import { Fragment, useId, useState, type FormEvent } from "react";

type AuthAction =
	| "Apple"
	| "Google"
	| "GitHub"
	| "Meta"
	| "recover"
	| "resend"
	| "switch"
	| "terms"
	| "privacy";

// No credentials or OTPs leave this form unless the host supplies onSubmit.
export default function Auth({
	block,
	chinese = false,
	onSubmit,
	onAction,
}: {
	block: string;
	chinese?: boolean;
	onSubmit?: (data: FormData) => void;
	onAction?: (action: AuthAction) => void;
}) {
	const [kind, variant] = block.split("-");
	const signup = kind === "signup";
	const otp = kind === "otp";
	const emailOnly = variant === "05";
	const brand = variant === "03" || emailOnly || (variant === "02" && !otp);
	const card = ["01", "03", "04"].includes(variant);
	const split = variant === "04";
	const providerFirst = kind === "login" && variant === "03";
	const providers: AuthAction[] =
		otp || (signup && variant === "03")
			? []
			: variant === "01"
				? ["Google"]
				: variant === "02"
					? ["GitHub"]
					: split
						? ["Apple", "Google", "Meta"]
						: ["Apple", "Google"];
	const groups =
		variant === "02"
			? [
					[0, 1],
					[2, 3],
					[4, 5],
				]
			: split || emailOnly
				? [
						[0, 1, 2],
						[3, 4, 5],
					]
				: [[0, 1, 2, 3, 4, 5]];
	const id = useId();
	const [code, setCode] = useState("");
	const [error, setError] = useState("");
	const [status, setStatus] = useState("");
	const t = (en: string, zh: string) => (chinese ? zh : en);
	const heading = otp
		? t("Enter verification code", "输入验证码")
		: emailOnly
			? t("Welcome to Acme Inc.", "欢迎来到 Acme Inc.")
			: signup
				? t("Create an account", "创建账号")
				: variant === "03" || split
					? t("Welcome back", "欢迎回来")
					: t("Log in to your account", "登录账号");
	const submitLabel = otp
		? t("Verify", "验证")
		: signup
			? t("Create account", "创建账号")
			: t("Log in", "登录");
	const codeLabel = t("Verification code", "验证码");
	const art = (
		<div
			aria-hidden="true"
			data-auth-art
			className="relative hidden min-h-48 overflow-hidden bg-muted md:grid md:place-items-center"
		>
			<div className="aspect-square w-2/3 rotate-12 rounded-[32%] border border-border bg-linear-to-br from-background to-muted shadow-sm" />
			<div className="absolute inset-0 grid place-items-center">
				<span className="grid size-16 place-items-center rounded-2xl border border-border bg-background text-2xl font-semibold text-foreground">
					A
				</span>
			</div>
		</div>
	);
	const logo = (
		<div className="flex items-center justify-center gap-2 text-sm font-medium">
			<span
				aria-hidden="true"
				className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground"
			>
				A
			</span>
			Acme Inc.
		</div>
	);

	function action(value: AuthAction, label: string) {
		if (onAction) onAction(value);
		else
			setStatus(
				t(`${label}: connect this action in your app.`, `${label}：请在宿主应用中接入此操作。`)
			);
	}

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		if (signup && !emailOnly && data.get("password") !== data.get("confirmPassword")) {
			setError(t("Passwords do not match.", "两次输入的密码不一致。"));
			event.currentTarget.querySelector<HTMLInputElement>("[name=confirmPassword]")?.focus();
			return;
		}
		setError("");
		if (onSubmit) onSubmit(data);
		else setStatus(t("Form validated. No data was sent.", "表单已通过验证，未发送任何数据。"));
	}

	const link = (value: AuthAction, label: string) => (
		<button
			type="button"
			className="rounded-sm text-xs text-foreground underline underline-offset-4 focus-visible:bg-accent focus-visible:outline-none"
			onClick={() => action(value, label)}
		>
			{label}
		</button>
	);
	const switchAccount = !otp && (
		<p className="text-center text-xs text-muted-foreground">
			{signup
				? t("Already have an account?", "已有账号？")
				: t("Don't have an account?", "还没有账号？")}{" "}
			{link("switch", signup ? t("Log in", "登录") : t("Sign up", "注册"))}
		</p>
	);
	const providerRow = providers.length > 0 && (
		<div
			className={
				split ? "grid grid-cols-3 gap-2" : emailOnly ? "grid gap-2 sm:grid-cols-2" : "grid gap-2"
			}
		>
			{providers.map((provider) => (
				<Button
					type="button"
					variant="outline"
					key={provider}
					aria-label={t(`Continue with ${provider}`, `使用 ${provider} 继续`)}
					onClick={() => action(provider, provider)}
				>
					{provider}
				</Button>
			))}
		</div>
	);
	const terms = (otp ? split || emailOnly : ["03", "04", "05"].includes(variant)) && (
		<p className="text-center text-xs text-muted-foreground">
			{t("By continuing, you agree to the", "继续即表示同意")}{" "}
			{link("terms", t("Terms of Service", "服务条款"))} {t("and", "和")}{" "}
			{link("privacy", t("Privacy Policy", "隐私政策"))}.
		</p>
	);
	const separator = providers.length > 0 && variant !== "01" && (
		<FieldSeparator>{t("Or continue with", "或通过以下方式继续")}</FieldSeparator>
	);
	const form = (
		<form
			className="grid min-w-0 gap-4"
			onSubmit={submit}
			onInput={() => {
				setError("");
				setStatus("");
			}}
		>
			{emailOnly && logo}
			<header className={variant === "01" ? "grid gap-1" : "grid gap-1 text-center"}>
				<h1 className="text-xl font-semibold tracking-tight">{heading}</h1>
				{!emailOnly || otp ? (
					<p className="text-sm text-muted-foreground">
						{otp
							? t(
									"Enter the six-digit code sent to your email.",
									"请输入发送至你邮箱的六位验证码。"
								)
							: signup
								? t("Enter your details to create an account.", "填写信息以创建账号。")
								: t("Enter your details to access your account.", "填写信息以登录账号。")}
					</p>
				) : null}
			</header>
			{emailOnly && switchAccount}
			{providerFirst && (
				<>
					{providerRow}
					{separator}
				</>
			)}
			{otp ? (
				<Field className="items-center">
					<FieldLabel htmlFor={`${id}-code`} className={variant === "01" ? undefined : "sr-only"}>
						{codeLabel}
					</FieldLabel>
					<InputOTP
						id={`${id}-code`}
						name="code"
						value={code}
						onValueChange={setCode}
						maxLength={6}
						pattern={REGEXP_ONLY_DIGITS}
						pasteTransformer={(text) => text.replace(/[^0-9]/g, "")}
						required
						autoComplete="one-time-code"
						dir="ltr"
					>
						{groups.map((group, index) => (
							<Fragment key={group[0]}>
								{index > 0 && <InputOTPSeparator />}
								<InputOTPGroup>
									{group.map((slot) => (
										<InputOTPSlot
											key={slot}
											index={slot}
											className={emailOnly ? "h-12 w-8 text-lg" : "w-7"}
										/>
									))}
								</InputOTPGroup>
							</Fragment>
						))}
					</InputOTP>
				</Field>
			) : (
				<>
					{signup && (variant === "01" || variant === "02" || variant === "03") && (
						<Field>
							<FieldLabel htmlFor={`${id}-name`}>{t("Full name", "姓名")}</FieldLabel>
							<Input
								id={`${id}-name`}
								name="name"
								placeholder="Alex Lee"
								autoComplete="name"
								required
							/>
						</Field>
					)}
					<Field>
						<FieldLabel htmlFor={`${id}-email`}>{t("Email", "邮箱")}</FieldLabel>
						<Input
							id={`${id}-email`}
							name="email"
							type="email"
							placeholder="you@example.com"
							autoComplete={signup ? "email" : "username"}
							required
						/>
					</Field>
					{!emailOnly && (
						<div
							className={
								signup && (variant === "03" || split)
									? "grid min-w-0 grid-cols-2 gap-2"
									: "grid gap-4"
							}
						>
							<Field className="min-w-0">
								<div className="flex flex-wrap items-baseline justify-between gap-1">
									<FieldLabel htmlFor={`${id}-password`}>{t("Password", "密码")}</FieldLabel>
									{!signup && link("recover", t("Forgot password?", "忘记密码？"))}
								</div>
								<Input
									id={`${id}-password`}
									name="password"
									type="password"
									autoComplete={signup ? "new-password" : "current-password"}
									minLength={signup ? 8 : undefined}
									aria-describedby={signup ? `${id}-length` : undefined}
									required
								/>
							</Field>
							{signup && (
								<Field className="min-w-0">
									<FieldLabel htmlFor={`${id}-confirm`}>
										{t("Confirm password", "确认密码")}
									</FieldLabel>
									<Input
										id={`${id}-confirm`}
										name="confirmPassword"
										type="password"
										autoComplete="new-password"
										aria-invalid={Boolean(error)}
										aria-describedby={error ? `${id}-mismatch` : undefined}
										required
									/>
								</Field>
							)}
							{signup && (
								<FieldDescription id={`${id}-length`} className="col-span-full">
									{t("Use at least eight characters.", "请至少输入八个字符。")}
								</FieldDescription>
							)}
						</div>
					)}
				</>
			)}
			{error && (
				<p role="alert" id={`${id}-mismatch`} className="text-sm text-destructive">
					{error}
				</p>
			)}
			{otp && emailOnly && (
				<div className="text-center">{link("resend", t("Resend code", "重新发送验证码"))}</div>
			)}
			<Button type="submit" disabled={otp && code.length !== 6}>
				{submitLabel}
			</Button>
			{otp && !emailOnly && (
				<div className="text-center">{link("resend", t("Resend code", "重新发送验证码"))}</div>
			)}
			{!providerFirst && (
				<>
					{separator}
					{providerRow}
				</>
			)}
			{!emailOnly && switchAccount}
			<p role="status" className="text-center text-xs text-muted-foreground empty:hidden">
				{status}
			</p>
		</form>
	);

	return (
		<main
			data-native-block={block}
			className={
				variant === "02"
					? "grid min-h-svh bg-background lg:grid-cols-2 [&>[data-auth-art]]:hidden lg:[&>[data-auth-art]]:grid"
					: `grid min-h-svh place-items-center px-4 py-6 sm:px-8 ${variant === "03" || split ? "bg-muted" : "bg-background"}`
			}
		>
			<div
				className={
					variant === "02"
						? "grid gap-5 p-6 sm:p-10"
						: `grid w-full gap-5 ${split ? "max-w-3xl" : "max-w-sm"}`
				}
			>
				{brand && !emailOnly && logo}
				{card ? (
					<Card className={split ? "gap-0 overflow-hidden p-0" : ""}>
						<CardContent className={split ? "grid p-0 md:grid-cols-2" : ""}>
							{split ? (
								<>
									<div className="p-5 sm:p-8">{form}</div>
									{art}
								</>
							) : (
								form
							)}
						</CardContent>
					</Card>
				) : (
					<div className={variant === "02" ? "mx-auto w-full max-w-xs self-center" : ""}>
						{form}
					</div>
				)}
				{terms}
			</div>
			{variant === "02" && art}
		</main>
	);
}
