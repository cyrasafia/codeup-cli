# ListMergeRequestComments - 查询评论列表

通过 OpenAPI 查询合并请求评论列表。

| **适用版本** | **中心版** |
| ------------ | ---------- |

## **服务接入点与授权信息**

| **产品** | **资源** | **所需权限** |
| -------- | -------- | ------------ |
| 代码管理 | 合并请求 | 只读         |

## **请求语法**

### **中心版**

```
POST https://{domain}/oapi/v1/codeup/organizations/{organizationId}/repositories/{repositoryId}/changeRequests/{localId}/comments/list
```

## **请求头**

| **参数**        | **类型** | **是否必填** | **描述**       |
| --------------- | -------- | ------------ | -------------- |
| x-yunxiao-token | string   | 是           | 个人访问令牌。 |

## **请求参数**

| **参数** | **类型** | **位置** | **是否必填** | **描述** | **示例值** |
| organizationId | string | path | 是 | 组织 ID。 | 60d54f3daccf2bbd6659f3ad |
| repositoryId | string | path | 是 | 代码库 ID 或 URL 编码全路径。 | 2813489 |
| localId | integer | path | 是 | 局部 ID。 | 1 |
| comment_biz_id_list | array[string] | body | 否 | 所需评论 ID 列表，从根评论开始返回。 | |
| comment_type | string | body | 否 | 评论类型：`GLOBAL_COMMENT,INLINE_COMMENT`。 | GLOBAL_COMMENT |
| file_path | string | body | 否 | 文件路径（行内评论筛选）。 | /src/main/test.java |
| patchset_biz_id_list | array[string] | body | 否 | 版本业务 ID 列表。 | |
| resolved | boolean | body | 否 | 是否已解决。 | false |
| state | string | body | 否 | 评论状态：`DRAFT,OPENED`。 | OPENED |

## **返回参数**

返回评论对象数组，含 `comment_biz_id`、`content`、`author`、`child_comments_list`、`resolved`、`comment_type`、`filePath`、`line_number` 等字段。
