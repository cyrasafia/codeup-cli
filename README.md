# codeup

阿里云云效 **Codeup** 仓库管理 CLI（基于 OpenAPI 中心版）。

支持四个功能：

- 创建项目（仓库）
- 查询项目列表
- 查看项目详情
- 修改项目信息

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
```

## 配置

### 个人访问令牌

个人访问令牌（Personal Access Token，形如 `pt-...`）用于请求头 `x-yunxiao-token`。完整安全说明与官方说明见：[获取个人访问令牌用于 API 调用和 Git 操作](https://help.aliyun.com/zh/yunxiao/developer-reference/obtain-personal-access-token)。

**本 CLI 涉及的权限**（创建令牌时在权限列表中勾选；控制台中的名称、分组可能随产品更新，以下与 OpenAPI 文档中的「产品 · 资源 · 权限」表述对齐，便于对照搜索。）

| 用途 | 文档中的典型表述 | 说明 |
| ---- | ---------------- | ---- |
| `codeup list` / `codeup get` | **代码管理** · **代码仓库** · **只读** | 查询仓库列表与详情 |
| `codeup create` / `codeup update` | **代码管理** · **代码仓库** · **读写** | 创建与更新仓库（已涵盖只读查询能力） |
| 将默认父路径或 `--namespace-id` 配成**路径**（如 `zlxt/zl-product`） | **代码管理** · **代码组** · **只读** | 创建前会调用 [GetNamespace](https://help.aliyun.com/zh/yunxiao/developer-reference/getnamespace-query-code-group-space-information) 把路径解析为 `namespaceId`；仅用**数字 ID** 时可不勾选此项 |

**最小权限组合建议**

- 只使用查询类命令：至少 **代码仓库 · 只读**。
- 使用创建/更新：至少 **代码仓库 · 读写**。
- 使用路径作为父分组且需解析：在上一行基础上增加 **代码组 · 只读**；若未开通，解析接口可能返回 **403**，可改为只使用数字 `namespaceId`。

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
# 兼容旧名：
# export CODEUP_DEFAULT_NAMESPACE_ID=1844019
```

**方式二：写入 `~/.codeup/config.json`**

```bash
codeup config set domain openapi-rdc.aliyuncs.com
codeup config set org-id 60d54f3daccf2bbd6659f3ad
codeup config set token  pt-0fh3****0fbG_35af****0484
codeup config set default-namespace-id zlxt/zl-product   # 或纯数字 ID；也可用 default-namespace / default-namespace-path
# 清空：codeup config set default-namespace-id ""

codeup config get          # 查看当前生效配置（token 自动脱敏）
codeup config path         # 打印配置文件绝对路径
```

## 用法

所有数据命令都支持 `--json` 输出原始 JSON，便于脚本管道使用。

### 列表 `codeup list`

```bash
codeup list                              # 默认第 1 页，每页 20 条，按创建时间倒序
codeup list --search demo                # 按路径模糊搜索
codeup list --order-by last_activity_at --sort desc
codeup list --archived                   # 只看已归档
codeup list --per-page 50 --page 2
codeup list --all                        # 自动翻页拉取全部（受 API 150 页上限约束）
codeup list --json                       # 原始 JSON 输出
```

输出末尾会附带 `shown N | total M | page x/y` 这样的小结。

### 详情 `codeup get`

```bash
codeup get 2813489                       # 按数字 ID
codeup get my-namespace/demo-repo        # 按 namespace/path（自动 URL 编码）
codeup get 2813489 --json
```

### 创建 `codeup create`

```bash
# 在组织根路径下创建库（默认组织内可见 internal）
codeup create demo-repo

# 若已配置 defaultNamespaceId，上面会在默认父路径下创建；本次强制建在组织根：
codeup create demo-repo --org-root

# 完整选项（显式设为私有）
codeup create demo-repo \
  --path demo-repo \
  --description "demo repository" \
  --visibility private \
  --namespace-id zlxt/zl-product \
  --create-parent-path
# 需要平台自动创建 README 时：--readme EMPTY（空文件）或 --readme USER_GUIDE（引导文档）
```

可选项：

- `--path <path>`：仓库路径，默认与 `<name>` 相同
- `-d, --description <text>`：描述
- `--visibility <private|internal>`：默认 `internal`（组织内公开）；需要私有时传 `private`
- `--namespace-id <ref>`：本次父路径，可为**数字 ID**或**全路径**（如 `zlxt/zl-product`），**优先于**配置里的默认父路径
- `--org-root`：本次在**组织根路径**下创建，忽略配置中的默认父路径
- 若未传 `--namespace-id` 且未使用 `--org-root`：若配置了默认父路径（ID 或路径）则先解析再创建；否则建在组织根下
- `--readme`：默认**不传**该字段，不按 OpenAPI 自动初始化 README（与云效文档中 `readMeType: EMPTY` 不同：官方定义 `EMPTY` 仍会创建**空的** `README.md`）。需要空 README 时传 `--readme EMPTY`，需要引导内容时传 `--readme USER_GUIDE`
- `--avatar-url <url>`：头像 URL
- `--create-parent-path`：父路径不存在时自动创建
- `--json`：输出原始 JSON

### 更新 `codeup update`

至少要传一个字段，否则会报错。

```bash
codeup update 2813489 --description "新的描述"
codeup update 2813489 --visibility internal
codeup update 2813489 --default-branch main
codeup update my-namespace/demo-repo --name new-name --path new-path
```

可选项：`--name`、`--path`、`--description`、`--visibility`、`--default-branch`、`--json`。

## 退出码

- `0`：成功
- `1`：参数错误、配置缺失、网络错误或 HTTP 非 2xx；错误信息打印到 stderr。

## 不在范围内

按 `specs.md`，本 CLI 暂不实现：删除 / 归档 / 转移 / 模板库列表，以及 git 操作（codeup 兼容 git，直接用 `git` 命令即可）。
