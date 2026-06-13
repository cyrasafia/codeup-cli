# MergeChangeRequest - 合并合并请求

通过 OpenAPI 合并合并请求。

| **适用版本** | **中心版、Region版** |
| ------------ | -------------------- |

## **服务接入点与授权信息**

| **产品** | **资源** | **所需权限** |
| -------- | -------- | ------------ |
| 代码管理 | 合并请求 | 读写         |

## **请求语法**

### **中心版**

```
POST https://{domain}/oapi/v1/codeup/organizations/{organizationId}/repositories/{repositoryId}/changeRequests/{localId}/merge
```

### **Region版**

```
POST https://{domain}/oapi/v1/codeup/repositories/{repositoryId}/changeRequests/{localId}/merge
```

## **请求头**

| **参数**        | **类型** | **是否必填** | **描述**       |
| --------------- | -------- | ------------ | -------------- |
| x-yunxiao-token | string   | 是           | 个人访问令牌。 |

## **请求参数**

| **参数** | **类型** | **位置** | **是否必填** | **描述** | **示例值** |
| organizationId | string | path | 是：中心版 | 组织 ID。 | 60d54f3daccf2bbd6659f3ad |
| repositoryId | string | path | 是 | 代码库 ID 或 URL 编码全路径。 | 2813489 |
| localId | integer | path | 是 | 局部 ID。 | 1 |
| mergeMessage | string | body | 否 | 合并提交信息。 | merge message |
| mergeType | string | body | 是 | ff-only / no-fast-forward / squash / rebase。 | no-fast-forward |
| removeSourceBranch | boolean | body | 否 | 是否在合并后删除源分支。 | true |

## **返回参数**

返回合并后的合并请求详情（含 `status`、`mergedRevision`、`reviewers` 等字段）。

## **返回示例**

```json
{
    "localId": 1,
    "title": "mr title",
    "status": "MERGED",
    "mergedRevision": "6da8c14b5a9102998148b7ea35f96507d5304f74",
    "sourceBranch": "demo-branch",
    "targetBranch": "master"
}
```
