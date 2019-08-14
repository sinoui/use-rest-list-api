# CHANGELOG

## v0.7.0

- fix:修复 useRestListApi 的 crud 响应转换器类型声明错误

## v0.6.0

- feat: 添加删除数据响应转换器`transformRemoveResponse`

## v0.5.1 - 2019.7.15

- fix: 修复`remove`方法缓存失效的缺陷
- fix: 修复`items`返回值类型为`any`的缺陷

## v0.5.0 - 2019.7.11

- feat: 添加数据时，支持指定添加位置

## v0.4.1 - 2019.7.11

- feat: 导出 Options 类型

## v0.4.0 - 2019.7.11

- breakchange：将 react 从 dependencies 中移除，移动至 peerDependencies 中
- breakchange：获取列表的响应数据结构调整 将返回数据结构从`{content: T[],totalElements:string}`调整为`T[]`
- fix: 修复没有查询参数时 URL 多了?的问题

## v0.3.1 - 2019.7.9

- fix: 修复 removeById 方法错误

## v0.3.0 - 2019.7.9

- improve: 缓存回调函数
- breakchange: `setItem<T>(itemId: string, extraItemInfo: T): T`调整为`setItem<T>(itemId: string, extraItemInfo: Partial<T>)`，这个函数不再返回更新后的数据
