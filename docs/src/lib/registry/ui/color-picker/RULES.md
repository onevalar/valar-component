# Color Picker 设计规范

- 用于让用户选择任意颜色的数据（标签色、品牌色、主题编辑）；只在少数固定颜色间选择时用 Radio Group。界面本身的颜色仍然只用语义 token，不要把 Color Picker 选出的值写进组件样式。
- `label` 必填，它同时命名触发按钮、色板、色相/不透明度滑条、色值输入与色块组，并显示为可见标签；不要在外面再包 Field.Label。
- 默认支持不透明度（`alpha={true}`）：不透明颜色输出小写六位 `#rrggbb`，半透明颜色输出八位 `#rrggbbaa`；若业务仅接受不透明色，传 `alpha={false}`。面板内置 HEX / RGB / HSL / OKLCH 四种格式编辑与一键复制。
- 常用颜色放在 `presets`；最近使用颜色默认按浏览器本地记录（可传 `showRecent={false}` 关闭）；放在表单中提交时设 `name`。
