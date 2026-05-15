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

需要三项凭据，**环境变量优先于配置文件**：

| 配置项           | 环境变量          | 说明                                                   |
| ---------------- | ----------------- | ------------------------------------------------------ |
| `domain`         | `CODEUP_DOMAIN`   | 服务接入点域名，如 `openapi-rdc.aliyuncs.com`          |
| `organizationId` | `CODEUP_ORG_ID`   | 组织 ID（中心版必需）                                  |
| `token`          | `CODEUP_TOKEN`    | 个人访问令牌（`pt-xxxx...`）                           |

任选一种方式配置：

**方式一：环境变量**

```bash
export CODEUP_DOMAIN=openapi-rdc.aliyuncs.com
export CODEUP_ORG_ID=60d54f3daccf2bbd6659f3ad
export CODEUP_TOKEN=pt-0fh3****0fbG_35af****0484
```

**方式二：写入 `~/.codeup/config.json`**

```bash
codeup config set domain openapi-rdc.aliyuncs.com
codeup config set org-id 60d54f3daccf2bbd6659f3ad
codeup config set token  pt-0fh3****0fbG_35af****0484

codeup config get          # 查看当前生效配置（token 自动脱敏）
codeup config path         # 打印配置文件绝对路径
```

> 服务接入点：参见[云效 OpenAPI 接入点文档](https://help.aliyun.com/zh/yunxiao/developer-reference/service-access-point-domain)。
> 个人访问令牌：参见[获取个人访问令牌](https://help.aliyun.com/zh/yunxiao/developer-reference/obtain-personal-access-token)。

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
# 在组织根路径下创建私有库 demo-repo
codeup create demo-repo

# 完整选项
codeup create demo-repo \
  --path demo-repo \
  --description "demo repository" \
  --visibility private \
  --namespace-id 2813489 \
  --create-parent-path
# 需要平台自动创建 README 时：--readme EMPTY（空文件）或 --readme USER_GUIDE（引导文档）
```

可选项：

- `--path <path>`：仓库路径，默认与 `<name>` 相同
- `-d, --description <text>`：描述
- `--visibility <private|internal>`：默认 `private`
- `--namespace-id <id>`：父命名空间 ID；不传则建在组织根路径下
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
