# CLAUDE.md

本文件记录 TenJudge 前端项目在协作过程中已经确认的事实、约定和待确认事项。文档应保持简洁，只写已确认内容和必要的高层方向；未确认的设计、实现细节、配色细节、目录结构或路由方案不要写成既定结论。

## 1. 项目概述

- 项目名称：TenJudge
- 当前仓库：tenjudge-frontend
- 项目类型：Online Judge 前端
- 后端技术：Spring Boot
- 前端目标：为在线评测、题目浏览、比赛参与等场景提供清晰、高效、专注的用户界面。

## 2. 技术栈

已确定前端技术栈：

- Vue 3
- TypeScript
- Pinia
- Vue Router
- Axios
- Vite
- markdown-it
- DOMPurify

当前仓库依赖状态：

- 已存在：Vue 3、TypeScript、Vite、Pinia、Vue Router、Axios、markdown-it、DOMPurify。

## 3. 产品与模块方向

当前阶段聚焦普通用户功能，后台管理系统暂缓。

- 主页面 / 主站：所有界面上方都应有统一主导航栏，导航栏下方展示当前功能页面。
- 导航项：后续可包含 Contests、Problems、Submissions、Agent 等入口，不限于四个固定模块。
- 比赛模块：专注于单个比赛，保留主导航栏，并在比赛内部提供副导航栏。副导航栏包含 Problems、Submissions、Standings 三个标签，通过 URL query 参数（`?tab=`）切换，默认显示 Problems。
- 比赛详情页采用左右两栏布局：左侧为内容区（副导航 + 标签内容），右侧为比赛信息卡片（名称、状态、时间、罚时）。
- 比赛报名/取消报名操作不在列表页直接进行，需点击进入独立报名页面 `/contests/:contestId/register` 后确认操作，防止误触。
- 比赛未开始时后端返回 CONTEST_NOT_STARTED 错误，前端展示提示信息而非题目列表。
- Agent 智能体模块：先预留模块；问答交互、题目引用、提交记录引用等具体设计暂缓。
- 后台管理系统：方向是管理题目、比赛、用户等；普通管理员能力先聚焦题目管理，超级管理员额外管理比赛和用户。
- 管理区主导航入口文案为 `Admin`，仅 `admin` 和 `super_admin` 可见；`/admin` 默认进入 `/admin/problems`。
- 管理区使用独立副导航；当前包含 `Problems`、`Contests` 和 `Users`，后续可扩展用户管理等模块。
- 题目管理对 `admin` 和 `super_admin` 开放，所有管理员都可以访问和修改任意题目；前端题目列表提供全部题目和我的题目切换，默认显示全部题目。
- 比赛管理仅对 `super_admin` 开放；普通 `admin` 不显示比赛管理入口，也不能通过路由直接访问比赛管理页。
- 用户管理仅对 `super_admin` 开放；普通 `admin` 不显示用户管理入口，也不能通过路由直接访问用户管理页。
- 用户管理不提供用户列表；超级管理员通过用户 ID 或用户名搜索单个用户后查看基础信息，并可修改该用户角色。
- 超级管理员可在用户管理页注册用户，注册时可指定 `user`、`admin`、`super_admin` 三种角色。
- 超级管理员不能修改自己的角色；前端需要禁用该操作并展示提示。
- 管理员题目编辑当前仅支持通过上传题目 zip 文件更新；后续可能增加其他编辑方式，但当前不要将表单编辑题面、标签、限制等作为既定能力。
- 管理员题目新建 / 修改页需要展示后端 README 中确认的题目 zip 包规范，帮助管理员上传前检查文件结构；当前仅做说明展示，不做前端解压或内容校验。
- 超级管理员可在题目编辑页单独修改题目可见性；普通管理员不可操作可见性。可见性修改调用独立接口保存，不与 zip 上传更新绑定。
- 第一阶段架构设计记录在 `docs/architecture/frontend-architecture.md`。

## 4. UI 与设计原则

- 整体视觉风格：简洁、纯白底、干净克制。
- 页面文案统一使用英文。
- 设计目标：让用户专注于比赛、看题、提交代码和查看结果。
- 在保证美观和可用性的前提下，不添加额外花哨装饰。
- 不使用第三方 UI 组件库；通用 UI 组件由项目内自行封装和维护。
- 开发新界面或组件时，需要优先判断是否存在跨模块复用场景；按钮、表单控件、导航、状态展示等常见元素应抽象为可复用组件，避免在多个模块重复实现。
- 业务关键点和特殊代码逻辑需要添加必要注释，尤其是后续协作者不容易从代码本身直接理解的权限判断、比赛状态判断、提交 / 测评流程、Agent 特殊逻辑、接口兼容处理等。
- 操作反馈使用右下角小弹窗展示，弹窗至少包含成功和失败两种模式。
- 成功模式适用于提交测评、报名比赛等需要明确告知用户操作已成功受理的场景。
- 失败模式适用于后端返回错误码的场景，弹窗中需要展示后端返回的 `message`。
- `docs/reference/Example.vue` 仅作为 UI 风格参考，不能照搬其代码组织方式或框架写法。
- 全项目颜色和配色方案需要标准化管理，避免在页面和组件中散落裸色值。
- 颜色标准化的具体 token、语义命名和状态色方案后续再确认。

## 5. 数据与接口

- 后端使用 Spring Boot。
- 前端通过 Axios 与后端接口通信。
- 当前 Swagger / OpenAPI 文档已上传到 `docs/reference/api.json`；接口细节以该文件为准，`CLAUDE.md` 只记录高层约定和反复依赖的结论。
- 当前 API 文档为 OpenAPI 3.1，已覆盖 Auth、Contest、Problem、Submit 四组接口。
- 后端 Swagger API 文档中的路径默认不带 `/api` 前缀；前端实际请求时必须统一加上 `/api` 前缀，用于 Nginx 识别并转发，Nginx 会在转发时去掉该前缀。
- 前端 API 访问域名 / baseURL 需要通过环境变量配置，不能写死在业务代码中；当前默认约定为开发环境直连 `http://localhost:8080`，生产环境使用 `/api` 交给 Nginx 转发。
- 后端认证使用 Sa-Token。
- 前端需要保存 token，并在后续请求中通过 header 携带 token 发回后端。
- 登录接口返回 `tokenName`、`tokenValue` 和 `userInfo`；前端认证实现应以登录返回的 token 名称和值作为后续请求携带 token 的依据。
- token 和 `userInfo` 需要做持久化，具体实现方案由前端自行决定。
- 当前登录用户信息以登录返回的 `userInfo` 为准；前端不能在每个请求、路由切换或全局守卫中额外调用 `auth/me` / 当前用户查询接口，避免给后端数据库造成不必要压力。
- 普通用户注册固定提交 `role: "user"`，注册页不向普通用户暴露角色选择。
- 管理员注册用户复用注册接口，但不能复用普通注册封装；需要按超级管理员选择的角色提交 `role`。
- 公开用户查询接口为 `GET /auth/user`，通过 `userId` 或 `username` 二选一查询，不要求登录；返回 `UserVO`，但 `email` 固定为空。
- 用户角色修改接口为 `PUT /auth/admin/user/role`，请求体包含 `userId` 和目标 `role`；仅超级管理员可调用，且后端不允许修改自己的角色。
- 题目 `statement` 字段格式为 Markdown，前端需要渲染为 Markdown 内容；渲染后的 HTML 必须经过安全清理再插入页面。
- 题目创建与当前题目编辑均通过 `multipart/form-data` 上传 zip 文件；创建字段名为 `zipFile`，更新题目时按接口描述提交题目 `id` 和 `zipFile`。
- 题目标签列表来自 `docs/reference/tags.txt`，共 37 个标签（类似 Codeforces 风格）。前端常量维护在 `src/constants/tags.ts`。
- 题目难度直接显示原始分数（Codeforces 风格数值），不加颜色标签。映射逻辑保留在 `src/constants/problem.ts` 供后续使用。
- 题目列表页采用左右两栏布局：左侧为题目表格（风格与比赛列表一致），右侧为筛选面板。筛选面板包含关键字搜索、难度区间（min-max）、标签多选下拉，均为预留功能（后端暂无筛选接口）。
- 筛选面板 UI 风格为白色卡片 + 细边框 + 4px 圆角，与 table-frame 统一，无渐变和多余装饰。
- 后端统一响应结构为 `code`、`message`、`data`；失败弹窗展示后端返回的 `message`。
- 分页数据结构包含 `records`、`total`、`current`、`size`、`pages`。
- 分页查询参数、默认分页大小、接口参数名、业务枚举值、状态映射、语言选项、可见性选项等不应散落硬编码在页面或组件中；应集中放在配置 / 常量文件中维护，并由接口封装和业务组件复用。
- 当前前端分页约定固定为每页 30 条，用户只能切换页码，不能在界面中切换每页数量。
- 后端测评结果枚举见 `docs/reference/judge_result.txt`，共 8 种状态（ACCEPTED、COMPILE_ERROR、RUNTIME_ERROR、TIME_LIMIT_EXCEEDED、MEMORY_LIMIT_EXCEEDED、WRONG_ANSWER、SYSTEM_ERROR、SKIPPED）。前端状态映射维护在 `src/constants/submission.ts`。
- 后端业务错误码见 `docs/reference/biz_error_code.txt`。其中 10001（UNAUTHORIZED）表示登录过期或未授权，前端 Axios 响应拦截器检测到 10001 后自动清除本地会话并跳转登录页。
- 提交详情接口（GET /submit/{submissionId}）返回完整源码和测试点详情数组，权限限定为提交者本人或管理员。
- 用户提交列表分页查询默认每页 30 条，最大允许 100 条。
- 比赛内用户提交列表返回全部结果，不分页。
- 比赛创建 / 更新请求支持 `freezeTime` 字段；为空表示不封榜，非空时必须落在比赛时间区间内。
- 比赛列表项和比赛详情均返回 `freezeTime`，用于前端识别是否封榜及封榜开始时间。
- 比赛榜单接口为 `GET /contest/{contestId}/board`，前端每页固定请求 30 行。
- 比赛榜单采用 ICPC 风格展示每题结果：一发通过显示 `+`，多次提交后通过显示 `+N`，未通过但有错误提交显示 `-N`，未提交为空白。
- 比赛榜单通过题在 `+` / `+N` 下方显示 `acceptedAt`，格式为 `H:MM`；未通过题复用 `wrongAttemptsBeforeAc` 表示该题错误提交次数。
- 比赛榜单每题结果包含 `attemptsAfterFreeze`，表示封榜后的有效提交次数；提交时间大于等于 `freezeTime` 且状态不是 `PENDING` 或 `SYSTEM_ERROR` 时计入。
- 比赛榜单中 `attemptsAfterFreeze > 0` 时封榜状态优先于通过 / 错误状态，题目格子显示为蓝色并展示 `?N`，其中 `N` 为封榜后的有效提交次数；此时不展示 `acceptedAt`。
- 比赛榜单用户名居中显示，点击后跳转到当前比赛的 Submissions 标签，并通过 `userId` query 查看该用户在本场比赛中的提交。
- 比赛详情页 Submissions 标签默认展示当前登录用户在本场比赛中的提交；当 URL 包含 `?tab=submissions&userId=` 时展示指定用户提交，并提供返回当前登录用户提交的小按钮。
- 比赛榜单视觉使用克制状态色：通过为浅绿色，错误未通过为浅红色，未提交为白底。
- 当前 API 文档包含注册、登录、登出、题目列表 / 详情 / 创建 / 更新 / 可见性修改、比赛列表 / 详情 / 创建 / 更新 / 报名 / 取消报名、比赛内按题号查询题目、比赛榜单、Agent 按题目 ID 查询题目、提交代码测评、提交详情查询（含源码和测试点）、用户提交分页列表、比赛内用户提交列表等能力。
- 后续根据 Swagger API 文档进行前端开发时，需要结合 Online Judge 常见业务场景主动识别潜在接口缺口；如果某个前端功能可能需要但 API 中暂未提供，应先与用户沟通确认，确认需要后再进行前端预留或适配设计。
- 当前 API 文档暂未看到测评状态轮询、用户资料更新等常见前端能力；涉及对应页面时需要先与用户确认接口计划。
## 6. 协作约定

- 对话统一使用中文回答。
- 与用户明确确认的新需求、架构决策、技术约定、页面设计要点，应及时记录到 `AGENTS.md`。
- `AGENTS.md` 只记录高价值信息，避免写入过细、临时、未经确认的实现描述。
- 未确认内容必须标记为待确认，不能写成既定事实。
- 如果文档结构变得臃肿，可以适时重组；必要时再拆分到独立文档。
- 当用户要求提交所有文件时，应提交当前工作区内所有未被 `.gitignore` 忽略的变更；除非用户明确要求排除某些文件，否则不要自行排除已修改文件。
- Git 提交信息沿用现有风格：`type: 中文动宾短句`，常用 type 包含 `feat`、`fix`、`docs`、`chore`。
- GitHub Actions 发布前端 Docker 镜像时仅在 `main` 分支 push 且最新 commit message 包含 `[docker-publish]` 时执行；镜像发布到 `ghcr.io/tenjudge/tenjudge-frontend:latest`，同时构建 `linux/amd64` 和 `linux/arm64`。

## 7. 当前待办

- 按 `docs/architecture/frontend-architecture.md` 推进第一阶段普通用户功能实现。
