# ListChangeRequestPatchSets - 查询合并请求版本列表

通过 OpenAPI 查询合并请求 diff 版本（patch set）列表，用于回复评论时自动补全 `patchset_biz_id`。

| **适用版本** | **中心版、Region版** |
| ------------ | -------------------- |

## **服务接入点与授权信息**

| **产品** | **资源** | **所需权限** |
| -------- | -------- | ------------ |
| 代码管理 | 合并请求 | 只读         |

## **请求语法**

### **中心版**

```
GET https://{domain}/oapi/v1/codeup/organizations/{organizationId}/repositories/{repositoryId}/changeRequests/{localId}/diffs/patches
```

### **Region版**

```
GET https://{domain}/oapi/v1/codeup/repositories/{repositoryId}/changeRequests/{localId}/diffs/patches
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

## **返回参数**

返回 patch set 对象数组，含 `patchSetBizId`、`versionNo`、`relatedMergeItemType`（`MERGE_SOURCE` / `MERGE_TARGET`）、`commitId` 等字段。

## **返回示例**

```json
[
    {
        "commitId": "45ede4680536406d793e0e629bc771cb9fcaa153",
        "createTime": "2024-10-05T15:30:45Z",
        "patchSetBizId": "bf117304dfe44d5d9b1132f348edf92e",
        "patchSetName": "版本1",
        "relatedMergeItemType": "MERGE_SOURCE",
        "shortId": "45ede468",
        "versionNo": 1
    }
]
```
