<script setup lang="ts">
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
	REGEXP_ONLY_DIGITS,
} from "@valar/vue-ui/input-otp";
import { Label } from "@valar/vue-ui/label";
import { ref, useId } from "vue";

const id = useId();
const code = ref("");
</script>

<template>
	<section aria-label="Account verification" class="grid justify-items-start gap-3 p-6 text-sm">
		<Label :for="id">Verification code</Label>
		<InputOTP
			:id="id"
			v-model="code"
			name="code"
			:maxlength="6"
			:pattern="REGEXP_ONLY_DIGITS"
			:paste-transformer="(text: string) => text.replace(/[^0-9]/g, '')"
			:aria-describedby="`${id}-hint`"
		>
			<InputOTPGroup>
				<InputOTPSlot v-for="index in [0, 1, 2]" :key="index" :index="index" />
			</InputOTPGroup>
			<InputOTPSeparator />
			<InputOTPGroup>
				<InputOTPSlot v-for="index in [3, 4, 5]" :key="index" :index="index" />
			</InputOTPGroup>
		</InputOTP>
		<p :id="`${id}-hint`" class="text-muted-foreground">Enter or paste a six-digit demo code.</p>
		<p role="status">{{ code.length === 6 ? "Code ready to verify" : "" }}</p>
	</section>
</template>
