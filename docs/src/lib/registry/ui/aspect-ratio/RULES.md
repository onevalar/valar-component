# Aspect Ratio 设计规范

- 用 `ratio` 属性（如 `ratio={16 / 9}`）固定媒体的宽高比，不要用 padding 技巧或固定高度。
- 内部的图片、视频设 `size-full object-cover`（需要完整显示时用 `object-contain`），图片要有 `alt`（检查规则 `valar/image-alt`）。
- Issue 正文和其他需完整显示的媒体可用 `appearance="media"`。提供媒体比例和目标显示宽度 `mediaWidth`，按可用宽度和 600 px 高度上限等比缩小。媒体用 6 px 圆角和 `object-contain`。需要实际播放时由视频控件提供键盘操作。
