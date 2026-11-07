# Scroll Area 设计规范

- 用于固定区域内的自定义滚动条（侧栏列表、弹层中的长内容）；整页滚动保持浏览器原生滚动。
- Scroll Area 必须有确定的高度或最大高度（`h-*`、`max-h-*` 档位类，或在 flex 布局中 `flex-1 min-h-0`），否则不会出现滚动。
- 横向滚动设 `orientation="horizontal"`，两个方向都需要时设 `both`。
- 视口可以被键盘聚焦并滚动；区域内容没有标题时给 Scroll Area 设 `aria-label` 说明内容。
- 滚动条不能改变版面：出现或消失时，内容不能左右晃动。整页滚动条库里已统一处理：位置预留（根元素 `scrollbar-gutter: stable`），轨道透明，只露出细滑块，没有滚动槽；不要在页面或布局上再写 `overflow-y: scroll`、`overflow-y: overlay` 之类的补丁。
- 纵向滚动的原生区域（`overflow-auto`、`overflow-y-auto`）加 `scrollbar-stable`：细滑块、透明轨道（没有滚动槽），位置始终预留。不要只写光秃秃的 `overflow-auto`。
- 横向滚动，或内容会动态变长变短的区域，用 Scroll Area（`orientation="horizontal"` 或 `both`）：滚动条浮在内容上方，只显示滑块、不占位，并按内容比例自动伸缩。原生横向滚动条占的是高度，无法预留，所以不要用在内容会变化的地方。
- 滚动条默认常显（只有细滑块，没有滚动槽）。需要“停止滚动约 1 秒后淡出、再滚动时出现”的地方，显式开启：整页在 `<html>` 上写 `data-scrollbar="autohide"`，某个滚动区域在该元素上写 `data-scrollbar="autohide"` 或加类 `scrollbar-autohide`（鼠标停在区域上时仍会显示）。它依赖根布局里调用一次 `useScrollbarAutohide()`；不调用时不会隐藏任何滚动条。不要自己写滚动条显示隐藏的脚本。
