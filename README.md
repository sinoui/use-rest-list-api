# use-rest-list-api

[![npm version](https://img.shields.io/npm/v/@sinoui/use-rest-list-api)](https://www.npmjs.com/package/@sinoui/use-rest-list-api)
[![downloads](https://img.shields.io/npm/dm/@sinoui/use-rest-list-api)](https://www.npmjs.com/package/@sinoui/use-rest-list-api)

不分页列表与 RESTful CRUD API 交互的状态管理

它可以帮助我们：

- 管理列表的查询
- 与 RESTful CRUD API 交互
- 列表数据维护
- 查询条件与浏览器的 url 同步

目录：

- [安装](#安装)
- [快速使用](#快速使用)
- [RESTful CRUD API](#restful-crud-api)
  - [获取列表数据](#获取列表数据)
  - [获取单个数据](#获取单个数据)
  - [新增数据](#新增数据)
  - [更新数据](#更新数据)
  - [删除数据](#删除数据)
- [数据结构](#数据结构)
  - [分页与排序信息](#分页与排序信息)
  - [分页查询响应](#分页查询响应)
- [useRestListApi 参数说明](#useRestListApi-参数说明)
  - [url](#url)
  - [defaultValue](#defaultValue)
  - [options](#options)
- [转换器](#转换器)
  - [定制列表查询请求](#定制列表查询请求)
  - [定制列表查询响应转换器](#定制列表查询响应转换器)
  - [定制请求单个数据响应转换器](#定制请求单个数据响应转换器)
  - [定制新增请求的数据转换器](#定制新增请求的数据转换器)
  - [定制新增响应的数据转换器](#定制新增响应的数据转换器)
  - [定制更新请求的数据转换器](#定制更新请求的数据转换器)
  - [定制更新响应的数据转换器](#定制更新响应的数据转换器)
  - [定制删除响应的数据转换器](#定制删除响应的数据转换器)
- [dataSource 的属性和方法](#datasource-的属性和方法)
  - [获取查询数据](#获取查询数据)
  - [分页和排序](#分页和排序)
  - [列表查询](#列表查询)
  - [与增删改查 API 交互](#与增删改查-api-交互)

## 安装

```shell
yarn add @sinoui/use-rest-list-api
```

或者

```shell
npm i --save @sinoui/use-rest-list-api
```

## 快速使用

```tsx
import React from 'react';
import useRestListApi from '@sinoui/use-rest-list-api';

interface User {
  userId: string;
  userName: string;
}

function ListDemo() {
  const dataSource = useRestListApi<User>('/apis/users');

  return (
    <div>
      {dataSource.isLoading && <div>正在加载人员列表数据...</div>}
      <h1>人员列表</h1>
      {dataSource.items.map((user) => (
        <div key={user.userId}>{user.userName}</div>
      ))}
    </div>
  );
}
```

## RESTful CRUD API

假定我们要维护一组人员数据，获取人员列表的 url 是`/users`。

### 获取列表数据

#### 请求

```
GET /users?sex=male&sort=firstName&sort=lastName,desc
```

请求参数说明：

- `sex=male` - 表示列表的过滤条件。@sinoui/use-rest-list-api 默认将过滤条件放在查询字符串中。
- `sort` - 排序，默认格式为`propertyName[,asc|desc]`，如果有多个，则按照`sort=propertyName&sort=propertyName2,desc`这样的方式编排

注意：这是@sinoui/use-rest-list-api 默认发送分页查询请求的格式，你的 RESTful API 如果不是这样的，那么你需要[定制列表查询请求](#定制列表查询请求)。

#### 响应

后端返回 json 格式数据，数据如下：

```js
[
  {
    id: '1',
    firstName: '张',
    lastName: '三',
    sex: 'male',
  },
  {
    id: '2',
    firstName: '李',
    lastName: '四',
    sex: 'male',
  },
];
```

注意：如果你的 API 响应的数据格式不是这样的，那么你可以[定制列表查询响应转换器](#定制列表查询响应转换器)，将 API 响应数据转换成上面说的数据格式即可。

### 获取单个数据

有时为了展现详情数据，而列表返回的数据不是很全，这时你就需要通过 API 获取单个数据。

#### 请求

按照 RESTful 风格设计的 API，请求如下：

```
GET /users/1
```

#### 响应

返回 JSON 格式数据。

```json
{
  "id": "1",
  "firstName": "张",
  "lastName": "三",
  "sex": "male",
  "birthday": "1999-01-12"
}
```

注意：如果你的 API 响应数据格式不一致，你可以通过[定制请求单个数据响应转换器](#定制请求单个数据响应转换器)，来转换成这样的数据格式。

### 新增数据

#### 请求

```
POST /users
```

请求参数: (itemInfo: T,isNeedUpdate: boolean = true, idx: number = -1)

```js
// 要新增的数据
{
  "firstName": "王",
  "lastName": "五",
  "sex": "female",
  "birthday": "2000-08-12"
}，
// 新增操作完成之后是否需要刷新页面，默认true
false,
// 指定新增数据的插入位置，默认-1，在数据的末尾添加
-1
```

注意：如果你的 API 请求要新增的数据格式不一致，你可以通过[定制新增请求的数据转换器](#定制新增请求的数据转换器)，将上面的数据格式转换成满足你的 API 的数据格式。

#### 响应

返回 JSON 格式的数据：

```json
{
  "id": "3",
  "firstName": "王",
  "lastName": "五",
  "sex": "female",
  "birthday": "2000-08-12"
}
```

注意：如果你的 API 响应数据格式不一致，你可以通过[定制新增响应的数据转换器](#定制新增响应的数据转换器)，将上面的数据格式转换成满足你的 API 的数据格式。

### 更新数据

#### 请求

```
PUT /users/3
```

请求体是 JSON 格式数据：

```json
{
  "id": "3",
  "firstName": "王",
  "lastName": "五",
  "sex": "male",
  "birthday": "2000-08-12"
}
```

注意：如果你的 API 请求数据格式不一致，你可以通过[定制更新请求的数据转换器](#定制更新请求的数据转换器)，将上面的数据格式转换成满足你的 API 的数据格式。

#### 响应

返回 JSON 格式的数据：

```json
{
  "id": "3",
  "firstName": "王",
  "lastName": "五",
  "sex": "male",
  "birthday": "2000-08-12"
}
```

注意：如果你的 API 响应数据格式不一致，你可以通过[定制更新响应的数据转换器](#定制更新响应的数据转换器)，将上面的数据格式转换成满足你的 API 的数据格式。

### 删除数据

#### 请求

删除单个数据：

```json
DELETE / users / 1
```

删除多条数据：

```
DELETE /users/1,2,3
```

注意：如果你的 API 不支持删除多条数据，那么请设置`options.useMultiDeleteApi`为`false`。

#### 响应

返回 200、201 等 2xx 状态码表示删除成功即可。

## 数据结构

### 排序信息

排序：

```ts
interface SortInfo {
  direction: 'desc' | 'asc';
  property: string;
}
```

### 列表查询响应

useRestListApi 默认列表查询的数据结构如下：

```ts
T[]
```

## useRestListApi 参数说明

```ts
const dataSource = useRestListApi<T, PageData>(
    url: string,
    defaultValue?: PageData<T>,
    options?: Options
);
```

### url

指定加载列表数据的`url`，一般为 RESTful CRUD API 中加载列表的`url`，也就是基础 url。加载列表数据的 url 与基础 url 不一致，可以通过`options.baseUrl`设定基础 url。

### defaultValue

指定默认的列表分页数据，默认为：

```js
T[]
```

### options

配置：

- `baseUrl` - 指定 curd api 的基础`url`，如果不指定，则默认为`url`。
- `defaultSearchParams` - 指定默认的查询条件。
- `defaultSort` - 指定默认的排序规则。
- `syncToUrl` - 如果为`true`，则会同步查询条件与浏览器 URL。默认为`false`。
- `keyName` - 指定唯一键属性名，默认为`id`。
- `useMultiDeleteApi` - 是否启动删除多条数据的 API。默认为`true`，表示启用。见[删除数据](#删除数据)章节。
- `transformListResponse` - 指定分页列表查询结果的转换器。
- `transformListRequest` - 指定分页查询条件转换器。
- `transformFetchOneResponse` - 指定获取单条数据的响应数据转换器。
- `transformSaveRequest` - 指定新增数据的请求数据转换器。
- `transformSaveResponse` - 指定新增数据的响应数据转换器。
- `transformUpdateRequest` - 指定更新数据的请求数据转换器。
- `transformUpdateResponse` - 指定更新数据的响应数据转换器。
- `transformRemoveResponse` - 指定删除数据的响应数据转换器。

转换器可以用来定制你的 API 细节。会用一个章节来介绍。

## 转换器

如果你的 API 数据格式与@sinoui/use-rest-list-api 默认支持的不同，那么你可以使用转换器来实现定制，让@sinoui/use-rest-list-api 为你的 API 服务。

### 定制列表查询请求

使用`transformListRequest`来定制列表查询请求。例如下面的转换器：

```ts
import qs from 'qs';

export default function transformListRequest(
  searchParams: {
    [key: string]: string;
  },
  sorts: SortInfo[],
) {
  return qs.stringify(
    {
      ...searchParams,
      sort: sorts.map(
        (sortInfo) =>
          `${sortInfo.property}${sortInfo.direction === 'desc' ? '_desc' : ''}`,
      ),
    },
    {
      arrayFormat: 'comma',
    },
  );
}
```

应用这个转换器后，发送的分页列表查询将会是下面的格式：

```
GET /users?sex=male&sort=firstName,lastName_desc
```

推荐使用[qs](https://github.com/ljharb/qs)来处理请求参数的序列化和解析。这里用到了[arrayFormat](https://github.com/ljharb/qs#stringifying)配置，设定为`comma`，那么遇到数组时，则会采用","的方式将多个数据连接在一起。arrayFormat 的几个参数如下所示：

```ts
qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'indices' });
// 'a[0]=b&a[1]=c'
qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'brackets' });
// 'a[]=b&a[]=c'
qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'repeat' });
// 'a=b&a=c'
qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'comma' });
// 'a=b,c'
```

> transformListRequest 方法结构如下：
>
> ```ts
> interface SearchParams {
>   [key: string]: any;
> }
>
> /**
>  * 转换列表查询的请求
>  *
>  * @param searchParams 查询条件
>  * @param sorts 排序信息
>  *
>  * @return {string} 返回列表查询请求的查询字符串。需要是字符串格式的。
>  */
> function transformListRequest(
>   searchParams: SearchParams,
>   sorts: SortInfo[],
> ): string;
> ```

### 定制列表查询响应转换器

使用`transformListResponse`来转换分页列表查询响应的数据格式。如下所示的[Hacker News API](https://hn.algolia.com/api)转换器：

```ts
interface HackerNew {
  objectID: string;
  title: string;
  url: string;
  auth: string;
  tags: string[];
}

interface HackerNewsListResponse {
  hits: HackerNew[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
}

function transformListResponse(
  response: HackerNewsListResponse,
): PageResponse<HackerNew> {
  return response.hits,
}
```

> transformListResponse 函数的结构如下：
>
> ```ts
> function transformListPresponse<T, Response>(
>   response: Response,
> ): PageResponse<T>;
> ```

### 定制请求单个数据响应转换器

使用`transformFetchOneResponse`定制请求单个数据响应的数据格式。例如下面的示例：

```ts
interface User {
  userId: string;
  firstName: string;
  lastName: string;
}

interface Response {
  result: User;
  status: boolean;
}

function transformFetchOneResponse(response: Response): User {
  return response.result;
}
```

> transformFetchOneResponse 函数的结构如下：
>
> ```ts
> function transformFetchOneResponse<T, Response>(respone: Response): T;
> ```

### 定制新增请求的数据转换器

使用`transformSaveRequest`定制新增数据请求转换器。例如：

```ts
interface SaveUserInfo {
  user: User;
  time: long;
}

function transformSaveRequest(user: User): SaveUserInfo {
  return {
    user,
    time: new Date().getTime(),
  };
}
```

> transformSaveRequest 函数的数据结构如下：
>
> ```ts
> function transformSaveRequest<T, NewRequestData>(
>   data: T,
>   headers: { [key: string]: string },
> ): NewRequestData;
> ```

### 定制新增响应的数据转换器

使用`transformSaveResponse`定义新增响应的数据格式转变。例如：

```ts
/**
 * 新增API响应返回数据的结构
 */
interface ResponseData {
  result: User;
  status: boolean;
  errorMessage?: string;
}

function transformSaveResponse(responseData: ResponseData): User {
  if (response.status) {
    return response.result;
  }

  throw new Error('获取数据失败');
}
```

> transformSaveResponse 函数的数据结构如下：
>
> ```ts
> function transformSaveResponse<T, Response>(response: Response): T;
> ```

### 定制更新请求的数据转换器

使用`transformUpdateRequest`定制更新请求。用法与[transformSaveRequest](#定制新增请求的数据转换器)一致。

### 定制更新响应的数据转换器

使用`transformUpdateResponse`定制更新请求。用法与[transformSaveResponse](#定制新增响应的数据转换器)一致。

### 定制删除响应的数据转换器

```ts
/** 删除API的响应数据结构 */
interface ResponseData {
    code:string;
    msg:string;
}

function transformRemoveResponse(response:ResponseData):void {
    if(code==='200'){
        alert('删除成功');
    } else {
        alert('删除失败')；
        throw new Error(response.msg);
    }
}
```

## dataSource 的属性和方法

```ts
const dataSource = useRestListApi<User, ListRawResponse>('/users');
```

我们的组件可以通过`dataSource`与查询结果、查询条件、RESTful API 进行沟通。

### 获取查询数据

```ts
 // 获取当前页列表数据
const users: User[] = dataSource.items;

// 获取id为'1'的用户数据
const user: User = dataSource.getItemById('1');

// 更新id为'1'的用户数据
const newUser = {...user, 'sex': 'female'};
dataSource.updateItem(newUser);

// 更新部分字段
dataSource.setItem('1', 'sex', 'female');
dataSource.setItem('1', { birthday: '2000-10-12' });

//替换items
dataSource.setItems([{id:'1',birthday:'2019-01-01'},{id:'2',age:32}])

// 新增
dataSource.addItem({id: '5', firstName: '赵'， lastName: '六'}, false, -1);

// 删除id为'1'的用户数据
dataSource.removeItemById('3');

// 删除多条数据
dataSource.removeItemsByIds(['1', '2', '3']);

// 设置默认查询条件
dataSource.setDefaultSearchParams({userName:'张三'});

// 删除指定行的数据,从0开始
dataSource.removeItemAt(5)

// 获取原始响应数据
const rawResponse = dataSource.rawResponse;

// 获取是否正在加载列表数据的状态
const isLoading = dataSource.isLoading;

// 获取是否加载列表数据失败的状态
const isError = dataSource.isError;
```

注意：这里介绍的`getItemById`、`updateItem`、`setItem`、`addItem`、`removeItemById`这些方法只会与`dataSource.items`进行交互，不会与 RESTful CRUD API 进行交互。如果需要与 RESTful CRUD API 交互，参见[与增删改查 API 交互](#与增删改查-api-交互)。

### 排序

```ts
// 按照姓氏倒序排序
dataSource.sortWith([
  {
    property: 'firstName',
    direction: 'desc',
  },
  {
    property: 'lastName',
    direction: 'asc',
  },
]);
```

### 列表查询

```ts
// 根据查询条件获取数据
dataSource.query(searchParams);

// 获取查询条件
dataSource.searchParams;
// 获取默认的查询条件
dataSource.defaultSearchParams;

// 重新获取当前页的数据
dataSource.reload();
```

`fetch()`方法是查询列表的基础方法，它的语法格式如下：

```ts
function fetch<T>(
  searchParams?: SearchParams,
  sorts?: SortInfo[],
): PageResponse<T>;
```

### 与增删改查 API 交互

```ts
// 获取id为'1'的数据
const user = await dataSource.get('1');

// 新增用户数据
const user = await dataSource.save(
  { firstName: '张', lastName: '三' },
  false,
  -1,
);

// 修改用户数据
const user = await dataSource.update({
  id: '1',
  firstName: '张',
  lastName: '三',
});

// 删除数据
await dataSource.remove('1');

// 删除多条数据
await dataSource.remove(['1', '2', '3']);
```

以上操作默认均会修改`dataSource.items`。如果不需要更新，则可以指定函数的第二个参数为`false`，如：

```ts
const user = await dataSource.get('1', false);
```
