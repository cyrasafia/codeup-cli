# CreateChangeRequest - 创建合并请求

通过 OpenAPI 创建合并请求。

| **适用版本** | **中心版、Region版** |
| ------------ | -------------------- |

## **服务接入点与授权信息**

-   [获取服务接入点](https://help.aliyun.com/zh/yunxiao/developer-reference/service-access-point-domain)：替换 API 请求语法中的 {domain} 。
-   [获取个人访问令牌](https://help.aliyun.com/zh/yunxiao/developer-reference/obtain-personal-access-token)。
-   获取organizationId：**仅中心版需要**。请前往**组织管理后台**的**基本信息**页面获取组织 ID 。

| **产品** | **资源** | **所需权限** |
| -------- | -------- | ------------ |
| 代码管理 | 合并请求 | 读写         |

## **请求语法**

### **中心版**

```
POST https://{domain}/oapi/v1/codeup/organizations/{organizationId}/repositories/{repositoryId}/changeRequests
```

### **Region版**

```
POST https://{domain}/oapi/v1/codeup/repositories/{repositoryId}/changeRequests
```

## **请求头**

| **参数**        | **类型** | **是否必填** | **描述**       | **示例值**                                     |
| --------------- | -------- | ------------ | -------------- | ---------------------------------------------- |
| x-yunxiao-token | string   | 是           | 个人访问令牌。 | pt-0fh3\\*\\*\\*\\*0fbG\\_35af\\*\\*\\*\\*0484 |

## **请求参数**

| **参数** | **类型** | **位置** | **是否必填** | **描述** | **示例值** |
| organizationId | string | path | 是：中心版 | 组织 ID。 | 60d54f3daccf2bbd6659f3ad |
| repositoryId | string | path | 是 | 代码库 ID 或者 URL-Encoder 编码的全路径。 | 2813489 |
| description | string | body | 否 | 描述，不超过10000个字符。 | mr description |
| reviewerUserIds | array[string] | body | 否 | 评审人用户 ID 列表。 | ["62c795xxxb468af8"] |
| sourceBranch | string | body | 是 | 源分支。 | demo-branch |
| sourceProjectId | integer | body | 是 | 源库 ID。 | 2813489 |
| targetBranch | string | body | 是 | 目标分支。 | master |
| targetProjectId | integer | body | 是 | 目标库 ID。 | 2813489 |
| title | string | body | 是 | 标题，不超过256个字符。 | mr title |
| triggerAIReviewRun | boolean | body | 否 | 是否触发 AI 评审，默认 false。 | false |
| workItemIds | string | body | 否 | 关联工作项 ID 列表，逗号分隔。 | 722200214032b6b31e6f1434ab |

## **返回参数（节选）**

| **参数** | **类型** | **描述** |
| localId | integer | 局部 ID |
| title | string | 标题 |
| status | string | UNDER_DEV / UNDER_REVIEW / TO_BE_MERGED / CLOSED / MERGED |
| sourceBranch | string | 源分支 |
| targetBranch | string | 目标分支 |
| webUrl | string | 页面地址 |
| detailUrl | string | 详情地址 |
