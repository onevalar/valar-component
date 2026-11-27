import assert from "node:assert/strict";
import test from "node:test";
import { Checkbox, CheckboxGroup } from "@valar/react-ui/checkbox";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";

test("a standalone mixed checkbox exposes a mixed state without submitting a value", () => {
	const html = render(
		h(Checkbox, { defaultChecked: "indeterminate", name: "terms", required: true })
	);
	assert.match(html, /<button(?=[^>]*aria-checked="mixed")(?=[^>]*data-state="indeterminate")/);
	assert.match(
		html,
		/<span(?=[^>]*data-slot="checkbox-indicator")(?=[^>]*data-state="indeterminate")/
	);
	assert.match(html, /<input(?=[^>]*type="checkbox")(?=[^>]*name="terms")(?=[^>]*required="")/);
	assert.doesNotMatch(html, /<input[^>]*\bchecked=""/);
});

test("CheckboxGroup renders selected children and only one required form input", () => {
	const html = render(
		h(
			CheckboxGroup,
			{
				"aria-label": "Notification channels",
				name: "channels",
				form: "settings",
				required: true,
				defaultValue: ["email"],
				allValues: ["email", "sms"],
			},
			h(Checkbox, { parent: true, "aria-label": "Select all" }),
			h(Checkbox, { id: "email", value: "email" }),
			h(Checkbox, { id: "sms", value: "sms", disabled: true })
		)
	);
	assert.match(html, /<div(?=[^>]*role="group")(?=[^>]*aria-label="Notification channels")/);
	assert.match(html, /<button(?=[^>]*aria-label="Select all")(?=[^>]*aria-checked="mixed")/);
	assert.match(html, /<button(?=[^>]*id="email")(?=[^>]*aria-checked="true")/);
	assert.match(html, /<button(?=[^>]*id="sms")(?=[^>]*aria-checked="false")(?=[^>]*disabled="")/);
	const inputs = html.match(/<input[^>]*>/g) ?? [];
	assert.equal(inputs.filter((input) => input.includes('name="channels"')).length, 2);
	assert.equal(inputs.filter((input) => input.includes('required=""')).length, 1);
	assert.match(
		html,
		/<input(?=[^>]*name="channels")(?=[^>]*value="email")(?=[^>]*checked="")(?=[^>]*form="settings")/
	);
});
