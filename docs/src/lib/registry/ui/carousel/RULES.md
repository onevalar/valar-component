# Carousel 设计规范

- `Carousel.Root` 渲染 `role="region"`，必须用 `aria-label` 说明轮播的内容；每个 `Carousel.Item` 已标为一张幻灯片。
- 用 `Carousel.Previous`、`Carousel.Next` 提供翻页按钮，它们的读屏文字默认是“上一张”“下一张”，其他语言用 `label` 改。
- 行为用 `opts`（Embla 选项，如 `loop`、`align`）和 `plugins` 配置；需要读取当前页或跳转时用 `setApi` 拿到 API，不要自己监听滚动。
- 自动播放会打断阅读：使用自动播放插件时必须提供暂停按钮，并在悬停和聚焦时暂停。
- 重要内容不要只放在后面几张幻灯片里，用户很少翻到最后。

## 全屏媒体

- 全屏图片查看器使用 `Carousel.Root appearance="media"`、`Carousel.Toolbar` 和 `Carousel.Item index={index}`，覆盖 Linear 工单图片查看器的上一张、下一张、缩放与关闭组合。保持首尾禁用、每次切换一张、图片居中、窄屏不横向溢出。
- 媒体预览用 Dialog 包裹。Next（向下）放在 Previous（向上）前方。右／下键前进，左／上键后退。关闭后焦点返回启动预览的缩略图，当前图片用 live status 播报，隐藏的图片不进入焦点顺序。
- 工具栏高 40 px，内边距上下 6 px、左右 8 px，使用 28 px 按钮、14 px 图标、0.5 px 分隔线，按钮组与关闭控件间距 4 px。使用内嵌聚焦描边。
- 当前图片的缩放由查看器管理，切图复位。媒体视口裁切相邻画面，键盘、按钮和手势负责切换。启用减少动态效果时，使用即时切换。
