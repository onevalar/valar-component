# Avatar、Item 组件页编辑器验收

日期：2026-11-02。实现、截图、录像及交付状态：[Amp 工作线程](https://ampcode.com/threads/T-01a199a9-28fa-709a-8877-6fe766c7497e)。

本批 E9 为现有 Avatar、Item 接入全屏编辑器，不是跨框架转换，不修改 primitive/API，不扩展旧 Studio。编辑器覆盖 **31／68**，剩余37（P2十三、P3十五、P4九）。用户授权验收后统一提交推送，不发布包、部署站点、修改用户自写 guides 或自动开始下一批。

## 参数合同

| 组件 | 可调参数 | 联动与保留边界 |
| ---- | -------- | -------------- |
| Avatar | sm／default／lg 各20–64px，步长4；共同圆角档位／样式自带 | Root、after、Image、Fallback、GroupCount共同圆角；GroupCount尺寸随头像，SVG为头像一半；Badge尺寸为头像四分之一加2px，保留full圆角。保留sm隐藏SVG、其余Badge SVG8px、Fallback字号、组重叠和ring |
| Item | default／sm／xs分别横向留白0–32px、纵向留白0–24px、媒体／内容gap0–24px，步长2；共同圆角档位／样式自带 | 省略size属性仍按默认档预览；xs在dropdown-content中的零留白保留。保留variant、标题／说明截断、Header／Footer、媒体及子Button／Avatar几何，保留列表与原生链接语义 |

使用真实八套flattened registry lazy loader，无样式名默认值表；独立storageKey为 `valar.avatar-styles.v2`／`valar.item-styles.v2`。缺失／不兼容的必要源码明确拒绝。空草稿不生成覆盖，preview限定pane，page CSS排除所有编辑器，全局token只读。写回白名单仅开放自身有限尺寸、留白和圆角，不开放颜色、自由CSS或子控件权限。

Avatar Badge的cn展开早于primitive里的普通尺寸类；写回使用有限的 `group-data-…:size-N!`，预览以base层important规则覆盖已写回的important尺寸，不改primitive。混合头像组沿用真实Tailwind的sm条件优先级，即使调参后sm数值大于lg也不按数值猜优先级。

画布包括三尺寸成功／失败图片、有／无图标Badge、文字／图标GroupCount、混合头像组和真实成员列表；所有图片为本地资源。失败／恢复按钮重新创建演示头像实例，走真实图片加载，不伪造loadingStatus。Item画布包括三尺寸×三variant、图标／本地图片／Avatar媒体、独立标记按钮、Header／Footer及单独原生锚点链接，不嵌套交互元素。各pane状态、ID独立，窄画布可纵向滚动。

### 八套源码基线

Avatar八套一致：sm／default／lg为24／32／40px，GroupCount SVG12／16／20px，Badge8／10／12px，共同圆角full。

Item单位px；各格按横向／纵向留白／gap排列。

| 样式 | default | sm | xs | 圆角 |
| ---- | ------- | -- | -- | ---- |
| Nova | 12／10／10 | 12／10／10 | 10／8／8 | lg |
| Vega | 16／14／14 | 12／10／10 | 10／8／8 | md |
| Lyra | 12／10／10 | 12／10／10 | 10／8／8 | none |
| Maia | 16／14／14 | 14／12／14 | 12／10／10 | 2xl |
| Mira | 12／10／10 | 12／10／10 | 10／8／10 | md |
| Luma | 16／14／14 | 14／12／14 | 12／10／10 | 2xl |
| Rhea | 16／14／14 | 14／12／14 | 10／8／8 | 2xl |
| Sera | 16／14／14 | 14／12／14 | 12／10／10 | none |

## 自动验证

使用Node24.22.2、pnpm12.14.0。

- `pnpm build:cli`通过。
- `pnpm test`：**632通过**（CLI282、parity110、primitives148、registry addon4、docs88）。新增两个安装合同覆盖八套源码、非对称连续写回／回读、Badge／GroupCount比例、未调子组件、xs下拉留白及非法参数／白名单拒绝。
- `pnpm check`全仓通过；Svelte **0 errors／0 warnings**。
- 局部Oxfmt、ESLint及 `git diff --check`通过。
- 浏览器合同：Avatar真实图片失败／恢复、混合组sm优先级、64／20／36非对称尺寸、Badge18px及sm SVG隐藏、圆角同步、对比隔离、版本保存／重开及Esc归焦；Item省略size、三尺寸独立几何、3个list／9个listitem、Space标记、原生锚点、子按钮高度保持、对比与版本保存。
- 两者390px最大参数下，草稿画布 `scrollWidth <= clientWidth`；不是实体手机或Safari验收。

生产构建及完整生产Playwright结果另列在本记录末尾。Avatar子任务仅负责两个编辑器文件，主线程完成Item、共享接入、永久合同、浏览器、写回、回归与最终整合；子任务的静态harness不代替运行验收。

## 开发站真实写回与缓存修复

通过真实编辑器确认框，两个POST均200，检查磁盘CSS、安装registry、无草稿刷新页面和重开编辑器基线：

- Nova Avatar：sm28／default44／lg52px、圆角none；registry含default Badge `size-3.25!`，普通页面头像44px，重新打开面板default44；sm Badge9px，继续草稿调sm64后为18px，证明已安装important类不会压住后续预览。
- Nova Item：default横向22／纵向14／gap18px；registry含 `px-5.5`，普通页面padding-left22px，重开默认横向基线22。sm／xs回归原值，不改变它们的默认样式。

同一组合验收 **1通过（2.0分钟）**；结束后精确恢复原Valar CSS并重建registry，CSS和生成registry无Git差异。另保留开发站回归：

```sh
E2E_WRITEBACK=1 CI=true E2E_BASE_URL=http://127.0.0.1:5186 \
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chrome \
pnpm --filter docs exec playwright test e2e/workbench.spec.ts \
  --grep 'Avatar editor dev writeback' --workers 1
```

该测试仅显式开启才运行，必须独立单worker；默认生产回归跳过，不向生产站写入。测试保护并发CSS编辑，结束后恢复原文件并重建registry。当前运行 **1通过（39.3秒）**。

**实际发现并修复**：修复前页面头像已44px、磁盘registry也44，但重开编辑器读到32。写回端点原先只失效flattened组件及app.css，未失效生成registry模块；现在同时失效client／SSR中的registry目录模块，且重建期间抑制其热更新，待完整生成后再刷新。相同写回场景修复后读取44，后续important草稿也正确。

验证过程的环境／脚本故障不计为通过：CLI重建清理dist时曾令正在运行的Vite缓存失效，清理派生`.vite`缓存并重启后恢复；初次加载新依赖和重建后的水合等待不足曾令截图脚本超时；已改为等待就绪而非更改产品行为。录制前先等networkidle。一次保留测试尝试在页面导航后读POST响应体，Playwright拒绝读取；测试改为预先计算自身预计CSS并检查磁盘，未放宽用户行为断言。临时截图／写回脚本已删除。

## 视觉与交互证据

最终截图均DPR2，并逐张检查；局部深色只改变画布，参数面板继续跟随站点主题是预期。长列表／参数区允许纵向滚动；390px截图滚至草稿实际组件，而非只拍参数区。写回按钮自带省略号不是新增截断。

| 状态 | Avatar | Item |
| ---- | ------ | ---- |
| 1440浅色默认 | `e9-avatar-light.png` | `e9-item-light.png` |
| 局部深色 | `e9-avatar-dark.png` | `e9-item-dark.png` |
| 1920并排对比 | `e9-avatar-compare.png` | `e9-item-compare.png` |
| 390最大参数 | `e9-avatar-narrow.png` | `e9-item-narrow.png` |
| 图片失败／恢复 | `e9-avatar-fallback.png` | 不适用 |

媒体在工作线程 `.amp/in/artifacts/`。录像 `e9-avatar-interaction.mp4`（12.9秒）展示真实指针经过邻近控件后失败／恢复；`e9-item-interaction.mp4`（11.9秒）经过邻行按钮后依次标记默认和小尺寸行；均附loop.webp并检查联系表帧。截图／录像展示外观，精确尺寸与行为以执行过的DOM断言为准。

## 已知边界与后续

现有Bits Avatar在成功加载后直接更换坏src，会因 `loadImage` 的loaded提前返回而不显示Fallback；已用真实坏src和DOM状态验证，另给出修复建议，**本批未修改该底层行为**。演示用key重新创建实例，因此证明的是实际成功／失败加载与恢复，不是底层动态换源缺陷已修复。

下一候选Number Field → Slider Field，先建立最小样式入口，保留数值与本地化行为，不复制子组件旋钮；未获本批之后的自动实施授权。路线图同步到[WORKBENCH](WORKBENCH.md)。

## 最终生产回归

- `NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build`：成功，未发布或部署。
- 对本地生产preview执行完整Playwright：**47 passed (2.3m)，1 skipped**；跳过的是需显式开启的开发站写回测试，已单独执行并通过，见上文。
- 本批保留两项浏览器交互合同及一项显式开发站写回回归；完整回归同时覆盖独立tarball安装、严格检查／构建和已安装组件的样式合同。
- 默认Valar CSS及生成registry已恢复，无默认外观改动。代码与本记录按用户授权统一提交推送；最终提交链接、GitHub CI状态及可审媒体见所链工作线程。
