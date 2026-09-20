# codeup

阿里云云效 **Codeup** 仓库管理 CLI（基于 OpenAPI 中心版）。

支持功能：

- 创建 / 查询 / 更新项目（仓库）
- 创建 / 查询 / 更新 / 评审 / 合并 / 关闭合并请求（MR）

> 跨平台（Linux / macOS / Windows），运行依赖 Node.js 18+（使用了内置 `fetch`）。

## 安装

```bash
git clone <this-repo>
cd codeup
npm install
npm link        # 将 codeup 命令安装到全局 PATH
```

确认安装成功：

```bash
codeup --help
codeup repo --help
codeup mr --help
```

## 命令结构

```
codeup
├── config          # 配置管理（顶层）
├── repo            # 仓库管理
│   ├── list
│   ├── get
│   ├── create
│   └── update
└── mr              # 合并请求管理
    ├── create
    ├── list
    ├── get
    ├── update
    ├── review
    ├── merge
    └── close
```

## 配置

### 个人访问令牌

个人访问令牌（Personal Access Token，形如 `pt-...`）用于请求头 `x-yunxiao-token`。完整安全说明与官方说明见：[获取个人访问令牌用于 API 调用和 Git 操作](https://help.aliyun.com/zh/yunxiao/developer-reference/obtain-personal-access-token)。

**本 CLI 涉及的权限**（创建令牌时在权限列表中勾选；控制台中的名称、分组可能随产品更新，以下与 OpenAPI 文档中的「产品 · 资源 · 权限」表述对齐，便于对照搜索。）

| 用途 | 文档中的典型表述 | 说明 |
| ---- | ---------------- | ---- |
| `codeup repo list` / `codeup repo get` | **代码管理** · **代码仓库** · **只读** | 查询仓库列表与详情 |
| `codeup repo create` / `codeup repo update` | **代码管理** · **代码仓库** · **读写** | 创建与更新仓库（已涵盖只读查询能力） |
| `codeup mr list` / `codeup mr get` | **代码管理** · **合并请求** · **只读** | 查询合并请求列表与详情 |
| `codeup mr create` / `update` / `review` / `merge` / `close` | **代码管理** · **合并请求** · **读写** | 创建、更新、评审、合并与关闭 MR |
| 将默认父路径或 `--namespace-id` 配成**路径**（如 `zlxt/zl-product`） | **代码管理** · **代码组** · **只读** | 创建前会调用 [GetNamespace](https://help.aliyun.com/zh/yunxiao/developer-reference/getnamespace-query-code-group-space-information) 把路径解析为 `namespaceId`；仅用**数字 ID** 时可不勾选此项 |

**最小权限组合建议**

- 只使用仓库查询类命令：至少 **代码仓库 · 只读**。
- 使用仓库创建/更新：至少 **代码仓库 · 读写**。
- 使用 MR 查询：至少 **合并请求 · 只读**（通常与代码仓库只读一并勾选）。
- 使用 MR 创建/评审/合并/关闭：至少 **合并请求 · 读写**。
- 使用路径作为父分组且需解析：在仓库相关权限基础上增加 **代码组 · 只读**；若未开通，解析接口可能返回 **403**，可改为只使用数字 `namespaceId`。

**如何获取（云效控制台）**

1. 登录 [云效工作台](https://devops.aliyun.com/)（账号与登录见[个人账号与登录](https://help.aliyun.com/zh/yunxiao/user-guide/personal-account-and-login)）。
2. 右上角 **用户头像** → **个人设置**。
3. 打开 **个人访问令牌** → **新建访问令牌**。
4. 填写 **令牌名称**、**到期时间**；在 **选择权限** 中按上文 **本 CLI 涉及的权限** 表格与 **最小权限组合建议** 勾选（遵循最小权限）。
5. 创建成功后**立刻复制并妥善保存**令牌字符串：**云效只在创建时显示一次**，之后无法再次查看原文。

将令牌写入环境变量 `CODEUP_TOKEN`，或使用 `codeup config set token <令牌>`（配置文件权限建议保持私有）。

### 组织 ID

**中心版** OpenAPI 路径中必须携带 `organizationId`，对应环境变量 `CODEUP_ORG_ID` / 配置项 `organizationId`。

**推荐：个人设置中的「已加入组织」**

1. 登录 [云效工作台](https://devops.aliyun.com/)。
2. 右上角 **用户头像** → **个人设置**。
3. 打开 **已加入组织**（菜单名称以控制台为准，可能略有差异）。
4. 在列表中可以看到你所加入的**每一个组织及其组织 ID**，复制需要在 Codeup 上操作代码库的那一个，写入 `CODEUP_ORG_ID` 或执行 `codeup config set org-id <组织ID>`。

**其他方式**

- 若具备组织管理权限，也可在 **组织管理后台** → **基本信息** 中查看组织 ID（与云效 OpenAPI 文档中「获取 organizationId」的说明一致）。

需要三项**必填**凭据，**环境变量优先于配置文件**。另可选配置「默认父路径」：

| 配置项 | 环境变量 | 说明 |
| ------ | -------- | ---- |
| `domain` | `CODEUP_DOMAIN` | 服务接入点域名，如 `openapi-rdc.aliyuncs.com` |
| `organizationId` | `CODEUP_ORG_ID` | 组织 ID（中心版必需），获取方式见 [组织 ID](#组织-id) |
| `token` | `CODEUP_TOKEN` | 个人访问令牌（`pt-xxxx...`），获取与权限见上文 [个人访问令牌](#个人访问令牌) |
| `defaultNamespaceId` | `CODEUP_DEFAULT_NAMESPACE`（推荐）或 `CODEUP_DEFAULT_NAMESPACE_ID` | 可选。创建时若未传 `--namespace-id` 且未使用 `--org-root`，作为**默认父路径**：可写**数字 ID**（如 `1844019`）或**全路径**（如 `zlxt/zl-product`）。路径会在创建前通过 [GetNamespace](https://help.aliyun.com/zh/yunxiao/developer-reference/getnamespace-query-code-group-space-information) 解析为 ID。 |

任选一种方式配置：

**方式一：环境变量**

```bash
export CODEUP_DOMAIN=openapi-rdc.aliyuncs.com
export CODEUP_ORG_ID=60d54f3daccf2bbd6659f3ad
export CODEUP_TOKEN=pt-0fh3****0fbG_35af****0484
export CODEUP_DEFAULT_NAMESPACE=zlxt/zl-product   # 可选；也可用纯数字 ID
```

**方式二：写入 `~/.codeup/config.json`**

```bash
codeup config set domain openapi-rdc.aliyuncs.com
codeup config set org-id 60d54f3daccf2bbd6659f3ad
codeup config set token  pt-0fh3****0fbG_35af****0484
codeup config set default-namespace-id zlxt/zl-product

codeup config get
codeup config path
```

## 用法

所有数据命令都支持 `--json` 输出原始 JSON，便于脚本管道使用。

### 仓库列表 `codeup repo list`

```bash
codeup repo list
codeup repo list --search demo
codeup repo list --order-by last_activity_at --sort desc
codeup repo list --archived
codeup repo list --per-page 50 --page 2
codeup repo list --all --json
```

### 仓库详情 `codeup repo get`

```bash
codeup repo get 2813489
codeup repo get my-namespace/demo-repo --json
```

### 创建仓库 `codeup repo create`

```bash
codeup repo create demo-repo
codeup repo create demo-repo --org-root
codeup repo create demo-repo \
  --path demo-repo \
  --description "demo repository" \
  --visibility private \
  --namespace-id zlxt/zl-product \
  --create-parent-path
```

可选项：`--path`、`-d, --description`、`--visibility`（默认 `internal`）、`--namespace-id`、`--org-root`、`--readme EMPTY|USER_GUIDE`、`--avatar-url`、`--create-parent-path`、`--json`。

### 更新仓库 `codeup repo update`

至少要传一个字段。

```bash
codeup repo update 2813489 --description "新的描述"
codeup repo update my-namespace/demo-repo --default-branch main
```

可选项：`--name`、`--path`、`--description`、`--visibility`、`--default-branch`、`--json`。

### 创建 MR `codeup mr create`

在 Git 仓库目录内可省略仓库参数，自动从 `origin` remote 与当前分支推断：

```bash
codeup mr create -t "feat: add MR support"
codeup mr create --wip -t "feat: add MR support"
codeup mr create zlxt/zl-product/my-repo \
  --source-branch feature/foo \
  --target-branch main \
  -t "标题" \
  -d "描述" \
  --reviewer <userId> \
  --json
```

可选项：`[repoId]`、`-t, --title`、`-d, --description`、`--source-branch`、`--target-branch`、`--remote`、`--reviewer`（可重复）、`--ai-review`、`--wip`、`--json`。

**注意：** 源分支需已 push 到远程；当前分支不能已是默认分支（除非显式 `--source-branch`）。

**仓库推断检测：** 所有 `mr` 子命令在省略仓库参数、从 git remote 推断时会做检测，失败时给出提示而非原始报错：

- 当前目录不是 git 仓库；
- `origin`（或 `--remote` 指定的）远程不是 `codeup.aliyun.com`；
- 远程对应的仓库在组织中不存在或令牌无权限访问（HTTP 404）。

以上情况均可显式传入 `namespace/path` 或数字仓库 ID 绕过推断。

### MR 列表 `codeup mr list`

```bash
codeup mr list
codeup mr list zlxt/zl-product/foo
codeup mr list --state opened --search "fix"
codeup mr list --page 2 --per-page 50 --all --json
```

### MR 详情 `codeup mr get`

```bash
codeup mr get zlxt/zl-product/foo 3
codeup mr get 3 --json    # 省略 repoId 时从 git remote 推断
```

可选项：`[repoId]`、`[localId]`、`--remote`、`--json`。

### 更新 MR `codeup mr update`

至少要传一个字段。

```bash
codeup mr update zlxt/zl-product/foo 2 -t "feat: 新增 MR 命令"
codeup mr update 2 --no-wip    # 省略 repoId 时从 git remote 推断
codeup mr update zlxt/zl-product/foo 2 --json
```

可选项：`[repoId]`、`[localId]`、`-t, --title`、`-d, --description`、`--wip`、`--no-wip`、`--remote`、`--json`。

### 评审 MR `codeup mr review`

必须指定 `--approve` 或 `--reject`。

```bash
codeup mr review zlxt/zl-product/foo 3 --approve
codeup mr review zlxt/zl-product/foo 3 --approve -c "LGTM"
codeup mr review 3 --reject -c "需要补充单测"    # 省略 repoId 时从 git remote 推断
codeup mr review zlxt/zl-product/foo 3 --approve --json
```

可选项：`[repoId]`、`--approve`、`--reject`、`-c, --comment`、`--draft-comment-id`（可重复）、`--remote`、`--json`。

### 合并 MR `codeup mr merge`

```bash
codeup mr merge zlxt/zl-product/foo 3
codeup mr merge zlxt/zl-product/foo 3 --type squash
codeup mr merge 3 --remove-source-branch -m "Merge feat/foo"
codeup mr merge zlxt/zl-product/foo 3 --json
```

可选项：`[repoId]`、`--type`（默认 `no-fast-forward`：`ff-only` | `no-fast-forward` | `squash` | `rebase`）、`-m, --message`、`--remove-source-branch`、`--remote`、`--json`。

### 关闭 MR `codeup mr close`

关闭合并请求（不合并）。

```bash
codeup mr close zlxt/zl-product/foo 3
codeup mr close 3 --json    # 省略 repoId 时从 git remote 推断
```

可选项：`[repoId]`、`[localId]`、`--remote`、`--json`。

### MR 评论 `codeup mr comment`

列出、查看全文、创建、回复、标记已解决合并请求评论。PAT 需 **合并请求 · 只读**（`list` / `get`）或 **合并请求 · 读写**（`create` / `reply` / `resolve`）。

#### 列出评论 `codeup mr comment list`

```bash
codeup mr comment list 3
codeup mr comment list zlxt/zl-product/foo 3 --unresolved
codeup mr comment list 3 --type inline --file src/foo.js --json
```

可选项：`[repoId]`、`[localId]`、`--resolved`、`--unresolved`、`--type`（默认 `all`：`all` | `global` | `inline`）、`--file`、`--include-drafts`、`--remote`、`--json`。

#### 查看评论全文 `codeup mr comment get`

读取指定评论的完整内容（`list` 输出中内容会被截断到 80 字符），并附带其回复。

```bash
codeup mr comment get 3 --comment <commentBizId>
codeup mr comment get zlxt/zl-product/foo 3 --comment <commentBizId> --json
```

可选项：`[repoId]`、`[localId]`、`--comment`（必填）、`--remote`、`--json`。

#### 创建顶层评论 `codeup mr comment create`

在 MR 上新建全局评论（非回复、非行内评论）。

```bash
codeup mr comment create 3 -c "整体 LGTM，建议补充单测"
codeup mr comment create zlxt/zl-product/foo 3 -c "评审意见" --json
```

可选项：`[repoId]`、`[localId]`、`-c, --comment`（必填）、`--draft`、`--remote`、`--json`。

#### 回复评论 `codeup mr comment reply`

回复已有评论（全局或行内）；不支持新建行内评论。

```bash
codeup mr comment reply 3 --parent <commentBizId> -c "已修复"
codeup mr comment reply zlxt/zl-product/foo 3 --parent <commentBizId> -c "LGTM" --json
```

可选项：`[repoId]`、`[localId]`、`--parent`（必填）、`-c, --comment`（必填）、`--draft`、`--remote`、`--json`。

#### 标记已解决 `codeup mr comment resolve`

```bash
codeup mr comment resolve 3 --comment <commentBizId>
codeup mr comment resolve 3 --comment <commentBizId> --unresolve
```

可选项：`[repoId]`、`[localId]`、`--comment`（必填）、`--unresolve`、`--remote`、`--json`。

## 退出码

- `0`：成功
- `1`：参数错误、配置缺失、网络错误或 HTTP 非 2xx；错误信息打印到 stderr。

## 不在范围内

按 `specs.md`，本 CLI 暂不实现：删除 / 归档 / 转移 / 模板库列表，以及日常 git 操作（clone/pull/push 等直接用 `git` 命令）。`codeup mr create` / `codeup mr list` 会读取本地 git 上下文推断仓库与分支，但不替代 git 本身。
