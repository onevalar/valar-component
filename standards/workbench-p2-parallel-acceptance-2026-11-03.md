# P2 十组件四组并行编辑器验收（E11）

日期：2026-11-03。[实现、可审截图、录像与最终提交所在工作线程](https://ampcode.com/threads/T-01a199a9-28fa-709a-8877-6fe766c7497e)。本批为现有 Svelte 组件接入组件页编辑器，不是跨框架转换，不替换 Bits UI，不扩展旧 Studio。覆盖由33增至 **43／68**；剩余25（Collapsible暂不独立做、P3十五项、P4九项）。用户授权本批验收后统一提交推送，不发布包或部署、不修改用户自写 guides、不自动开始下一批。

## 并行边界与参数合同

四个子任务只写独占的组件编辑器／最小源码锚点，主线程负责共享接入、白名单、永久测试、真实浏览器、写回、生产回归与交付。静态子任务报告不替代运行验收。

| 组 | 组件 | 可调范围与保留边界 |
| --- | --- | --- |
| A | Tags Input | 根 padding／gap各0–16px、步长2，共同圆角档位；不改标签内部几何、最小高度、输入法／粘贴／校验／表单逻辑 |
| B | Button Group | Text横留白0–24px、gap0–16px、步长2，横纵共同端点圆角；不复制Button高度。原始端点来自子控件时显示“样式自带” |
| B | Breadcrumb | 窄／宽屏List gap分别0–24px、Item gap0–16px、步长2；保留nav/list/current-page和原生锚点 |
| B | Pagination | Content gap0–16px、省略号占位20–48px、步长2；保留Bits生成页码、边界、真实内容切片及翻页后焦点 |
| C | Progress | 高度2–16px、步长2，轨道／indicator联动圆角；保留0／42／100／不确定值与动效 |
| C | Skeleton | 仅圆角；宽高由使用处最终内容决定，保留加载区域及真实恢复内容 |
| C | Spinner | 默认size有限枚举12／16／20／24／32px；不改旋转或全局动效，调用处显式尺寸优先 |
| C | Kbd | 高度16–32px、横留白0–12px、组gap0–16px、步长2及圆角；不增加全局快捷键，练习只在指定按钮聚焦时执行 |
| D | Menubar | 面板padding0–12px、min-width96–320px（步长16），Item横留白4–20px／纵留白2–12px／gap4–16px（步长2），面板／Item圆角；保留Inset、Choice列、原纵向差值、贴边分隔线及指示器位移联动 |
| D | Navigation Menu | List gap0–24px、Trigger横留白0–32px、Content padding0–24px、步长2，Trigger／Panel圆角；保留两种viewport布局、额外右留白，不调后置固定高度或动效 |

圆角共用现有档位和“样式自带”。全部使用真实八套 flattened registry lazy loader，无样式名默认表；strict schema、空草稿no-op、独立v2 storage、全局token只读、preview限pane、page排除全部编辑器。源码白名单是有限工具类，未放开任意CSS或配色权限。

## 整合时解决的问题

- Tags Input和Spinner只补独立后置cn参数，默认字面类在前、调用处class最后；Menubar两个indicator span补data-slot，使预览left真正命中。Root的非bindable状态使用公开value／onValueChange接线。
- Spinner不能用CSS区分默认16px与调用处显式size-4。源组件自动检测调用尺寸并输出data标记，画布不再手工标记；已验证默认改32px而显式16／24px不变，避免把演示特例当成完整实现。
- 真实写回发现：原始组件字面utility会压过写回base-layer CSS，造成registry基线已变而画布仍旧。Vite现有flattened导入规则延伸到workbench下的 `*-tuner.svelte`，让画布与普通文档页同用安装后的Nova基线；旧Studio和一般helper不纳入。Tags写回前实际14px期望却6px，修复后刷新／重开为14px，随后新草稿2px也生效。此共享路径改动已跑完整生产回归，永久保留Tags开发站写回回归。

## 运行验收与真实写回

十个编辑器均在真实开发站通过UI确认框POST200；逐项核对Valar CSS、生成registry、页面与重开基线几何。Tags Input还显式执行永久写回回归，证明安装值不压住后续草稿。验收结束后只恢复本次写入并重建registry；Valar默认CSS无Git差异，tracked生成文件仅八套Menubar／Spinner／Tags Input对应的源码接线变化。

浏览器合同覆盖：标签添加／全角分隔符／长标签／错误／重复与上限／required／禁用不提交／getAll／reset；Button Group真实Input／Select／保存反馈；Breadcrumb原生链接与菜单；分页真实内容与焦点；加载状态、Skeleton恢复和Spinner显式尺寸；Kbd聚焦局部按键；Menubar方向键切换、checkbox／radio、子菜单及窄屏Sheet；Navigation两种viewport、锚点与窄屏替代导航。各pane状态独立；保存版本、页面应用、关闭焦点由既有及本批回归覆盖。没有声称实体中文输入法或实体手机人工验收。

Navigation临时写回脚本初次错猜Nova右留白差值，实际为0；检查真实源码后修正断言，重新执行通过。不是用改产品满足错误预期。所有临时写回脚本已删除。

## 自动回归

使用Node24.22.2、pnpm12.14.0。

| 命令／场景 | 实际结果 |
| --- | --- |
| `pnpm build:cli` | 通过 |
| `pnpm test` | **647通过**：CLI282、parity110、primitives148、addon4、docs103 |
| `pnpm check` | 全仓通过，Svelte **0 errors／0 warnings** |
| 局部Oxfmt／ESLint、`git diff --check` | 通过 |
| `NODE_OPTIONS=--max-old-space-size=3072 CI=true pnpm build` | 通过，未发布／部署 |
| 完整生产Playwright | **59 passed (2.7m)，2 skipped**；两个需显式开启的开发写回测试不向生产preview写入 |
| Tags Input开发站永久写回回归 | 显式开启，**1 passed (27.9s)**；结束后恢复默认CSS并重建 |
| 其余九组件开发站真实写回 | 全部逐项通过，含Navigation最后独立复核 |
| 最终临时浏览器探测 | 十组件全部数字控件设最大值（Spinner选32、Skeleton选直角），保存版本后刷新仍存在；390px下编辑器left=0、width=390、scrollWidth不大于clientWidth，**十项通过** |

保留11项源码合同和10项常规浏览器合同，另1项显式写回回归。源码合同覆盖八样式非对称连续合并、安装回读／编译、空草稿、非法输入及精确白名单；完整生产E2E包括独立tarball消费者安装、strict check/build及既有组件回归。四组静态harness另外检查有限参数全集与工具类，不以这些报告替代上述主线程验收。

## 视觉与录像

十组件各四状态：默认浅色1440px、局部深色1440px、并排对比1920px、390px窄视口，DPR2。最终40张截图重新等待过渡结束后捕获并审阅；文件 `e11-<组件>-{light,dark,compare,narrow}.png`，四状态拼图为 `e11-<组件>-review.jpg`，均位于工作线程 `.amp/in/artifacts/`。局部深色不切换参数侧栏主题。窄屏为Chromium视口，不是实体手机或Safari测试；纵向截图裁切不是水平溢出。

另补十张非默认最大数字参数窄屏截图 `e11-<组件>-narrow-max.png`，汇总为 `e11-max-a.jpg`／`e11-max-b.jpg` 并审阅，无水平裁切；局部组件可以按合同横滚。导航窄屏替代按钮的展开和焦点由生产E2E独立验证，不仅凭截图判断。

早期暗色黑字及窄屏左侧裁切截图抓在过渡中；等待稳定后复核DOM和重拍正常，没有为截图改产品样式。最终只保留稳定状态作为证据。

真实移动指针短片 `e11-menubar-interaction.mp4` 约7秒：经过相邻文件／编辑／视图控件，展示编辑菜单与视图选择项切换；全片及帧联系表已检查。录像展示交互响应，细节正确性由执行过的浏览器断言验证，不以短片代替。初次录像因会话恢复为空页、随后选择器误命中底层页面而无效；最终片使用恢复一致的会话和唯一目标重录。

## 交付边界

按授权把四组实现、共享接入、生成registry、测试和本记录统一提交推送；最终提交链接及CI订阅见工作线程。没有部署、发布包或自动升级已有消费者源码。后续25项按真实页面需求再确认，Collapsible仍不建虚构视觉参数。
