# CloseChangeRequest - 关闭合并请求

通过 OpenAPI 关闭合并请求（不合并）。

| **适用版本** | **中心版、Region版** |
| ------------ | -------------------- |

## **服务接入点与授权信息**

| **产品** | **资源** | **所需权限** |
| -------- | -------- | ------------ |
| 代码管理 | 合并请求 | 读写         |

## **请求语法**

### **中心版**

```
POST https://{domain}/oapi/v1/codeup/organizations/{organizationId}/repositories/{repositoryId}/changeRequests/{localId}/close
```

### **Region版**

```
POST https://{domain}/oapi/v1/codeup/repositories/{repositoryId}/changeRequests/{localId}/close
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

| **参数** | **类型** | **描述** |
| result | boolean | 是否执行成功。 |

## **返回示例**

```json
{
  "result": true
}
```
