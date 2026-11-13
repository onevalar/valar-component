# Range Calendar 设计规范

- 只用于选择起止日期区间；选择单个或多个独立日期用 Calendar。
- 值是 `{ start, end }`，两端都是 `@internationalized/date` 的日期对象；用 `bind:value` 绑定，处理时注意用户只选了起点（`end` 为空）的状态。
- 默认 `locale="zh-CN"`；其他语言的界面传对应 `locale`；需要周一开始时设 `weekStartsOn={1}`。
- 可选范围用 `minValue`、`maxValue`，不可选的日期用 `isDateDisabled`；区间较长时用 `numberOfMonths={2}` 并排显示两个月。
- 放在 Popover 中作为日期区间选择器时，触发按钮显示已选区间，未选完时提示“选择结束日期”。
- `captionLayout="dropdown"` 复用 Calendar 的 Valar Select，长列表在面板内滚动。月历内容宽度小于 275 px 时，年月选择器排在翻月按钮下方，留出 8 px 间距。日期仍与星期按七列对齐。用 `minValue`、`maxValue` 或 `years` 限定范围。
- 使用样式自带的格子尺寸。需要调整时通过 `--cell-size` 显式设置。
- 区间起止日期是实心主色底、反色数字，不要加会改文字颜色的悬停样式，否则鼠标停在上面会变成黑块。

- 年月选择器与翻月箭头至少留 8 px。选择器所在月份列较窄时，箭头与年月分行。嵌入卡片时，为卡片提供受父容器约束的宽度，让日期和星期列一起缩小。
