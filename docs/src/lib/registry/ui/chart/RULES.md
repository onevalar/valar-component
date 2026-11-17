# Chart 设计规范

- 每个图表都定义 `ChartConfig`，每个系列写 `label` 和 `color`；颜色用主题 token `var(--chart-1)`～`var(--chart-5)`，不要写十六进制或调色板色值（检查规则 `valar/chart-color-token`）。
- 图表放在 `Chart.Container` 中，传入 `config`；容器默认按 `aspect-video` 比例取高度，需要其他高度时用 `aspect-*`、`h-*` 档位类。
- 用量图可用 `appearance="usage"`，容器高 320 px、底色透明，刻度使用 450 字重。右侧金额刻度为 11 px，日期刻度为 12 px。由 LayerChart 设置右侧金额轴、水平虚线和时间范围。无用量时保留坐标轴，提供可读的时间段和总额。
- 工作量洞察可用 `Chart.Container appearance="insights"`（桌面图高约 281 px）与 `Chart.Tooltip appearance="insights"`。保留右轴、水平虚线和窄柱，优先级系列使用局部 `--insight-priority-*` 色值。浮层显示系列、计数和组内百分比。柱形下钻与数值表共享分组，给表格提供键盘入口，关闭详情回到对应数值。窄屏详情排列在图表下方，数据表横向滚动使用悬浮 Scroll Area。
- 悬停数值用 `Chart.Tooltip`，系列名和颜色从 config 读取，不要另写一份。
- `null`／`undefined` 是缺失值，Tooltip 不显示该系列的数值行；`0` 是有效数值，必须保留。不要把缺失值显示成零或沿用上次悬停的数值。
- 图表本身对读屏器不友好：在标题或说明中写出结论（如“本月访问量比上月高 12%”），关键数据另外提供表格或文字。
- 不要只靠颜色区分系列：系列多于两个时显示图例，必要时配合不同的线型或直接标注数值。
