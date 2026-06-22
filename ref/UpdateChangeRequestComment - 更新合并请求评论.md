# UpdateChangeRequestComment - 更新合并请求评论

通过 OpenAPI 更新合并请求评论（如标记已解决）。

| **适用版本** | **中心版、Region版** |
| ------------ | -------------------- |

## **服务接入点与授权信息**

| **产品** | **资源** | **所需权限** |
| -------- | -------- | ------------ |
| 代码管理 | 合并请求 | 读写         |

## **请求语法**

### **中心版**

```
PUT https://{domain}/oapi/v1/codeup/organizations/{organizationId}/repositories/{repositoryId}/changeRequests/{localId}/comments/{commentBizId}
```

### **Region版**

```
PUT https://{domain}/oapi/v1/codeup/repositories/{repositoryId}/changeRequests/{localId}/comments/{commentBizId}
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
| commentBizId | string | path | 是 | 评论 bizId。 | bf117304dfe44d5d9b1132f348edf92e |
| content | string | body | 否 | 评论内容。 | your new comment |
| resolved | boolean | body | 否 | 是否已解决。 | true |

## **返回参数**

| **参数** | **类型** | **描述** |
| result | boolean | 是否执行成功。 |

## **返回示例**

```json
{
    "result": true
}
```
