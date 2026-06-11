# ListChangeRequests - 查询合并请求列表

通过 OpenAPI 查询合并请求（新）列表，支持多条件筛选、分页以及排序。

| **适用版本** | **中心版、Region版** |
| ------------ | -------------------- |

## **服务接入点与授权信息**

| **产品** | **资源** | **所需权限** |
| -------- | -------- | ------------ |
| 代码管理 | 合并请求 | 只读         |

## **请求语法**

### **中心版**

```
GET https://{domain}/oapi/v1/codeup/organizations/{organizationId}/changeRequests
```

### **Region版**

```
GET https://{domain}/oapi/v1/codeup/changeRequests
```

## **请求头**

| **参数**        | **类型** | **是否必填** | **描述**       |
| --------------- | -------- | ------------ | -------------- |
| x-yunxiao-token | string   | 是           | 个人访问令牌。 |

## **请求参数**

| **参数** | **类型** | **位置** | **是否必填** | **描述** | **示例值** |
| page | integer | query | 否 | 页码。 | 1 |
| perPage | integer | query | 否 | 每页大小。 | 20 |
| projectIds | string | query | 否 | 代码库 ID 列表，逗号分隔。 | 2813489,2813490 |
| authorIds | string | query | 否 | 创建者用户 ID 列表，逗号分隔。 | 62c795xxxb468af8 |
| reviewerIds | string | query | 否 | 评审人用户 ID 列表，逗号分隔。 | 62c795xxxb468af8 |
| state | string | query | 否 | opened / merged / closed | opened |
| search | string | query | 否 | 标题关键字搜索。 | mr title |
| orderBy | string | query | 否 | created_at / updated_at | updated_at |
| sort | string | query | 否 | asc / desc | desc |
| createdBefore | string | query | 否 | 起始创建时间（ISO 8601）。 | 2024-04-05T15:30:45Z |
| createdAfter | string | query | 否 | 截止创建时间（ISO 8601）。 | 2024-04-05T15:30:45Z |

## **响应头**

| **参数** | **描述** |
| x-total | 总数 |
| x-page | 当前页 |
| x-total-pages | 总分页数 |
| x-next-page | 下一页 |
| x-prev-page | 前一页 |
| x-per-page | 每页大小 |
