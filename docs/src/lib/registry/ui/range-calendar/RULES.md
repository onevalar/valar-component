# Range Calendar 设计规范

- 只用于选择起止日期区间；选择单个或多个独立日期用 Calendar。
- 值是 `{ start, end }`，两端都是 `@internationalized/date` 的日期对象；用 `bind:value` 绑定，处理时注意用户只选了起点（`end` 为空）的状态。
- 默认 `locale="zh-CN"`；其他语言的界面传对应 `locale`；需要周一开始时设 `weekStartsOn={1}`。
- 可选范围用 `minValue`、`maxValue`，不可选的日期用 `isDateDisabled`；区间较长时用 `numberOfMonths={2}` 并排显示两个月。
- 放在 Popover 中作为日期区间选择器时，触发按钮显示已选区间，未选完时提示“选择结束日期”。
- `captionLayout="dropdown"` 的月份和年份是弹出的网格（月份 3×4，年份一次 12 个、可翻页）；年份跨度大时用 `minValue`、`maxValue` 或 `years` 限定范围。
- 格子默认 36px，不要为了省空间缩小；窄容器里用 `--cell-size` 按断点调整。
- 区间起止日期是实心主色底、反色数字，不要加会改文字颜色的悬停样式，否则鼠标停在上面会变成黑块。
