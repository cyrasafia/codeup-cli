# ReviewChangeRequest - 评审合并请求

通过 OpenAPI 评审合并请求。

| **适用版本** | **中心版、Region版** |
| ------------ | -------------------- |

## **服务接入点与授权信息**

| **产品** | **资源** | **所需权限** |
| -------- | -------- | ------------ |
| 代码管理 | 合并请求 | 读写         |

## **请求语法**

### **中心版**

```
POST https://{domain}/oapi/v1/codeup/organizations/{organizationId}/repositories/{repositoryId}/changeRequests/{localId}/review
```

### **Region版**

```
POST https://{domain}/oapi/v1/codeup/repositories/{repositoryId}/changeRequests/{localId}/review
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
| reviewComment | string | body | 否 | 评论内容。 | change request comment content |
| reviewOpinion | string | body | 否 | 评审意见：PASS / NOT_PASS。 | PASS |
| submitDraftCommentIds | array[string] | body | 否 | 提交的草稿评论 ID 列表。 | ["4ff23jj62c795xxxb468af8"] |

## **返回参数**

| **参数** | **类型** | **描述** |
| result | boolean | 是否执行成功。 |

## **返回示例**

```json
{
    "result": true
}
```
