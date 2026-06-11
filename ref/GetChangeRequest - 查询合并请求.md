# GetChangeRequest - 查询合并请求

通过 OpenAPI 查询合并请求详情。

| **适用版本** | **中心版、Region版** |
| ------------ | -------------------- |

## **服务接入点与授权信息**

| **产品** | **资源** | **所需权限** |
| -------- | -------- | ------------ |
| 代码管理 | 合并请求 | 只读         |

## **请求语法**

### **中心版**

```
GET https://{domain}/oapi/v1/codeup/organizations/{organizationId}/repositories/{repositoryId}/changeRequests/{localId}
```

### **Region版**

```
GET https://{domain}/oapi/v1/codeup/repositories/{repositoryId}/changeRequests/{localId}
```

## **请求头**

| **参数**        | **类型** | **是否必填** | **描述**       |
| --------------- | -------- | ------------ | -------------- |
| x-yunxiao-token | string   | 是           | 个人访问令牌。 |

## **请求参数**

| **参数** | **类型** | **位置** | **是否必填** | **描述** | **示例值** |
| organizationId | string | path | 是：中心版 | 组织 ID。 | 60d54f3daccf2bbd6659f3ad |
| repositoryId | string | path | 是 | 代码库 ID 或 URL 编码全路径。 | 2813489 |
| localId | string | path | 是 | 局部 ID，代码库中第几个合并请求。 | 1 |

## **返回参数（节选）**

| **参数** | **类型** | **描述** |
| localId | integer | 局部 ID |
| title | string | 标题 |
| status | string | 合并请求状态 |
| sourceBranch | string | 源分支 |
| targetBranch | string | 目标分支 |
| description | string | 描述 |
| reviewers | array | 评审人列表 |
| webUrl | string | 页面地址 |
| detailUrl | string | 详情地址 |
