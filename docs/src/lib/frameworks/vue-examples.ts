// Standalone examples using the same public compositions as apps/vue-preview.
export const vueExamples: Record<string, string> = {
	button: `<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@valar/vue-ui/button";

const count = ref(0);
</script>

<template>
  <div class="flex items-center gap-3">
    <Button @click="count++">Save</Button>
    <Button variant="outline" @click="count = 0">Reset</Button>
    <output aria-label="Save count">{{ count }}</output>
  </div>
</template>`,
	input: `<script setup lang="ts">
import { ref, useId } from "vue";
import { Input } from "@valar/vue-ui/input";

const id = useId();
const name = ref("");
</script>

<template>
  <div class="grid gap-2">
    <label :for="id">Name</label>
    <Input :id="id" v-model="name" name="name" autocomplete="name" />
    <output>{{ name || "Enter your name" }}</output>
  </div>
</template>`,
	checkbox: `<script setup lang="ts">
import { ref, useId } from "vue";
import { Checkbox } from "@valar/vue-ui/checkbox";

const id = useId();
const agree = ref(false);
</script>

<template>
  <div class="flex items-center gap-3">
    <Checkbox :id="id" v-model="agree" name="agree" />
    <label :for="id">Accept the terms</label>
    <output>{{ agree ? "Accepted" : "Not accepted" }}</output>
  </div>
</template>`,
	select: `<script setup lang="ts">
import { ref, useId } from "vue";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@valar/vue-ui/select";

const id = useId();
const provider = ref("claude");
</script>

<template>
  <div class="grid gap-2">
    <label :for="id">Provider</label>
    <Select v-model="provider" name="provider">
      <SelectTrigger :id="id"><SelectValue placeholder="Choose a provider" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="claude">Claude</SelectItem>
        <SelectItem value="codex">Codex</SelectItem>
        <SelectItem value="cursor">Cursor</SelectItem>
      </SelectContent>
    </Select>
    <output>{{ provider }}</output>
  </div>
</template>`,
	dialog: `<script setup lang="ts">
import { ref, useId } from "vue";
import { Button } from "@valar/vue-ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@valar/vue-ui/dialog";
import { Input } from "@valar/vue-ui/input";

const id = useId();
const open = ref(false);
const name = ref("");
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child><Button variant="outline">Edit Profile</Button></DialogTrigger>
    <DialogContent close-label="Close">
      <DialogHeader>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogDescription>Update your name, then choose Done.</DialogDescription>
      </DialogHeader>
      <label :for="id">Name</label>
      <Input :id="id" v-model="name" name="name" autocomplete="name" />
      <Button @click="open = false">Done</Button>
    </DialogContent>
  </Dialog>
</template>`,
	calendar: `<script setup lang="ts">
import { shallowRef } from "vue";
import { parseDate, type DateValue } from "@internationalized/date";
import { Calendar } from "@valar/vue-ui/calendar";

// Reka uses DateValue (here CalendarDate), not native JavaScript Date.
// shallowRef preserves the date object's identity and private fields.
const selected = shallowRef<DateValue | undefined>(parseDate("2026-11-12"));
const month = shallowRef<DateValue>(parseDate("2026-11-01"));
</script>

<template>
  <div class="grid gap-2">
    <Calendar v-model="selected" v-model:placeholder="month" caption-layout="dropdown" />
    <output aria-label="Selected date">{{ selected?.toString() ?? "Choose a date" }}</output>
  </div>
</template>`,
	"range-calendar": `<script setup lang="ts">
import { shallowRef } from "vue";
import { parseDate, type DateValue } from "@internationalized/date";
import { RangeCalendar } from "@valar/vue-ui/range-calendar";

// Vue uses DateValue start/end, unlike React's native Date from/to.
const range = shallowRef<{ start: DateValue | undefined; end: DateValue | undefined }>({
  start: parseDate("2026-11-10"),
  end: parseDate("2026-11-14"),
});
const month = shallowRef<DateValue>(parseDate("2026-11-01"));
</script>

<template>
  <div class="grid gap-2">
    <RangeCalendar v-model="range" v-model:placeholder="month" caption-layout="dropdown" />
    <output aria-label="Selected range">
      {{ range.start?.toString() ?? "Start" }} – {{ range.end?.toString() ?? "End" }}
    </output>
  </div>
</template>`,
	slider: `<script setup lang="ts">
import { ref, useId } from "vue";
import { Slider } from "@valar/vue-ui/slider";

const labelId = useId();
const quota = ref(37);
</script>

<template>
  <div class="grid gap-3">
    <span :id="labelId">Quota</span>
    <Slider v-model="quota" type="single" :min="-20" :max="80" :step="3" :large-step="6"
      :aria-labelledby="labelId" :thumb-labels="['Quota']" />
    <!-- Serialize a scalar explicitly; Reka's native name prop uses name[0]. -->
    <input type="hidden" name="quota" :value="quota" />
    <output>{{ quota }}</output>
  </div>
</template>`,
	chart: `<script setup lang="ts">
import { CurveType } from "@unovis/ts";
import { VisAxis, VisLine, VisScatter, VisXYContainer } from "@unovis/vue";
import {
  ChartContainer, ChartCrosshair, ChartTooltip, ChartTooltipContent,
  componentToString, type ChartConfig,
} from "@valar/vue-ui/chart";

const data = [
  { label: "Mon", value: 0 },
  { label: "Tue", value: 17 },
  { label: "Wed", value: null },
  { label: "Thu", value: 9 },
  { label: "Fri", value: 31 },
  { label: "Sat", value: 4 },
  { label: "Sun", value: 22 },
];
// Preserve the original null payload; only the drawing accessor uses a NaN gap.
const chart = data.map((datum, index) => ({
  ...datum, x: index, y: datum.value === null ? Number.NaN : datum.value,
}));
type Datum = (typeof chart)[number];
const x = (datum: Datum) => datum.x;
const y = (datum: Datum) => datum.y;
const config = { value: { label: "Usage", color: "var(--chart-2)" } } satisfies ChartConfig;
const tooltipTemplate = componentToString(config, ChartTooltipContent, { hideLabel: true });
</script>

<template>
  <ChartContainer :config="config" class="h-[240px] w-full" role="img"
    aria-label="Daily usage: Monday zero, Wednesday missing">
    <VisXYContainer :data="chart" :height="220" :y-domain="[0, 40]" :duration="0">
      <VisLine :x="x" :y="y" :curve-type="CurveType.Linear" color="var(--chart-2)"
        :interpolate-missing-data="false" />
      <VisScatter :x="x" :y="y" :size="6" color="var(--chart-2)" />
      <VisAxis type="x" :tick-values="[0, 1, 2, 3, 4, 5, 6]"
        :tick-format="(value: number) => data[value]?.label ?? ''"
        :grid-line="false" :domain-line="false" :tick-line="false" />
      <VisAxis type="y" :tick-values="[0, 10, 20, 30, 40]"
        :grid-line="true" :domain-line="false" :tick-line="false" />
      <ChartTooltip />
      <ChartCrosshair :template="tooltipTemplate" color="var(--chart-2)" />
    </VisXYContainer>
  </ChartContainer>
</template>`,
};
