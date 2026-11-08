// Standalone examples using the same public compositions as apps/react-preview.
export const reactExamples: Record<string, string> = {
	button: `import { useState } from "react";
import { Button } from "@valar/react-ui/button";

export default function ButtonExample() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex items-center gap-3">
      <Button onClick={() => setCount((value) => value + 1)}>Save</Button>
      <Button variant="outline" onClick={() => setCount(0)}>Reset</Button>
      <output aria-label="Save count">{count}</output>
    </div>
  );
}`,
	input: `import { useId, useState } from "react";
import { Input } from "@valar/react-ui/input";

export default function InputExample() {
  const id = useId();
  const [name, setName] = useState("");
  return (
    <div className="grid gap-2">
      <label htmlFor={id}>Name</label>
      <Input id={id} name="name" autoComplete="name" value={name}
        onChange={(event) => setName(event.target.value)} />
      <output>{name || "Enter your name"}</output>
    </div>
  );
}`,
	checkbox: `import { useId, useState } from "react";
import { Checkbox } from "@valar/react-ui/checkbox";

export default function CheckboxExample() {
  const id = useId();
  const [agree, setAgree] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <Checkbox id={id} name="agree" checked={agree}
        onCheckedChange={(checked) => setAgree(checked === true)} />
      <label htmlFor={id}>Accept the terms</label>
      <output>{agree ? "Accepted" : "Not accepted"}</output>
    </div>
  );
}`,
	select: `import { useId, useState } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@valar/react-ui/select";

export default function SelectExample() {
  const id = useId();
  const [provider, setProvider] = useState("claude");
  return (
    <div className="grid gap-2">
      <label htmlFor={id}>Provider</label>
      <Select name="provider" value={provider} onValueChange={setProvider}>
        <SelectTrigger id={id}><SelectValue placeholder="Choose a provider" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="claude">Claude</SelectItem>
          <SelectItem value="codex">Codex</SelectItem>
          <SelectItem value="cursor">Cursor</SelectItem>
        </SelectContent>
      </Select>
      <output>{provider}</output>
    </div>
  );
}`,
	dialog: `import { useId, useState } from "react";
import { Button } from "@valar/react-ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@valar/react-ui/dialog";
import { Input } from "@valar/react-ui/input";

export default function DialogExample() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline">Edit Profile</Button></DialogTrigger>
      <DialogContent closeLabel="Close">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your name, then choose Done.</DialogDescription>
        </DialogHeader>
        <label htmlFor={id}>Name</label>
        <Input id={id} name="name" autoComplete="name" value={name}
          onChange={(event) => setName(event.target.value)} />
        <Button onClick={() => setOpen(false)}>Done</Button>
      </DialogContent>
    </Dialog>
  );
}`,
	calendar: `import { useState } from "react";
import { Calendar } from "@valar/react-ui/calendar";

export default function CalendarExample() {
  // React DayPicker uses native Date, constructed locally (month is zero-based).
  const [selected, setSelected] = useState<Date | undefined>(new Date(2026, 10, 12));
  const [month, setMonth] = useState(new Date(2026, 10, 1));
  return (
    <div className="grid gap-2">
      <Calendar mode="single" captionLayout="dropdown"
        month={month} onMonthChange={setMonth}
        selected={selected} onSelect={setSelected} />
      <output aria-label="Selected date">{selected?.toLocaleDateString() ?? "Choose a date"}</output>
    </div>
  );
}`,
	"range-calendar": `import { useState } from "react";
import { RangeCalendar } from "@valar/react-ui/range-calendar";

export default function RangeCalendarExample() {
  // React uses native Date endpoints named from/to, not Vue's DateValue start/end.
  const [range, setRange] = useState<{
    from: Date | undefined;
    to?: Date;
  } | undefined>({ from: new Date(2026, 10, 10), to: new Date(2026, 10, 14) });
  const [month, setMonth] = useState(new Date(2026, 10, 1));
  return (
    <div className="grid gap-2">
      <RangeCalendar captionLayout="dropdown" month={month} onMonthChange={setMonth}
        selected={range} onSelect={setRange} />
      <output aria-label="Selected range">
        {range?.from?.toLocaleDateString() ?? "Start"} – {range?.to?.toLocaleDateString() ?? "End"}
      </output>
    </div>
  );
}`,
	slider: `import { useId, useState } from "react";
import { Slider } from "@valar/react-ui/slider";

export default function SliderExample() {
  const labelId = useId();
  const [quota, setQuota] = useState(37);
  return (
    <div className="grid gap-3">
      <span id={labelId}>Quota</span>
      <Slider type="single" name="quota" value={quota} onValueChange={setQuota}
        min={-20} max={80} step={3} largeStep={6}
        aria-labelledby={labelId} thumbLabels={["Quota"]} />
      <output>{quota}</output>
    </div>
  );
}`,
	chart: `import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@valar/react-ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const data = [
  { label: "Mon", value: 0 },
  { label: "Tue", value: 17 },
  { label: "Wed", value: null },
  { label: "Thu", value: 9 },
  { label: "Fri", value: 31 },
  { label: "Sat", value: 4 },
  { label: "Sun", value: 22 },
];

export default function ChartExample() {
  return (
    <ChartContainer className="h-[240px] w-full"
      config={{ value: { label: "Usage", color: "var(--chart-2)" } }}
      aria-label="Daily usage: Monday zero, Wednesday missing">
      <LineChart accessibilityLayer data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis domain={[0, 40]} tickLine={false} axisLine={false} width={28} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Line type="linear" dataKey="value" stroke="var(--color-value)" strokeWidth={2}
          dot={{ r: 3 }} connectNulls={false} isAnimationActive={false} />
      </LineChart>
    </ChartContainer>
  );
}`,
};
