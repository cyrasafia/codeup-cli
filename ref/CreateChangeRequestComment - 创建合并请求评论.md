# CreateChangeRequestComment - 创建合并请求评论

通过 OpenAPI 创建合并请求评论（含回复）。

| **适用版本** | **中心版、Region版** |
| ------------ | -------------------- |

## **服务接入点与授权信息**

| **产品** | **资源** | **所需权限** |
| -------- | -------- | ------------ |
| 代码管理 | 合并请求 | 读写         |

## **请求语法**

### **中心版**

```
POST https://{domain}/oapi/v1/codeup/organizations/{organizationId}/repositories/{repositoryId}/changeRequests/{localId}/comments
```

### **Region版**

```
POST https://{domain}/oapi/v1/codeup/repositories/{repositoryId}/changeRequests/{localId}/comments
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
| comment_type | string | body | 是 | `GLOBAL_COMMENT` 或 `INLINE_COMMENT`。 | GLOBAL_COMMENT |
| content | string | body | 是 | 评论内容。 | This is a comment. |
| draft | boolean | body | 是 | 是否草稿。 | false |
| patchset_biz_id | string | body | 是 | 关联版本 ID。 | bf117304dfe44d5d9b1132f348edf92e |
| resolved | boolean | body | 是 | 是否已解决。 | false |
| parent_comment_biz_id | string | body | 否 | 父评论 ID（回复时）。 | 12345 |
| file_path | string | body | 否 | 文件路径（行内评论）。 | /src/main/test.java |
| from_patchset_biz_id | string | body | 否 | 比较起始版本 ID。 | bf117304... |
| to_patchset_biz_id | string | body | 否 | 比较目标版本 ID。 | bf117304... |
| line_number | integer | body | 否 | 行号（行内评论）。 | 42 |

## **返回参数**

返回创建的评论详情（含 `comment_biz_id`、`content`、`author` 等字段）。
